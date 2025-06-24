"""
Metadata Store Service

This service handles storing and retrieving metadata about indexed files,
code chunks, and user feedback using SQLite.
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from typing import List, Dict, Optional
from datetime import datetime
import json
import os
from app.core.utils import get_workspace_root  # <-- import the shared utility

# Use a local SQLite file in .devflow/ under the workspace
workspace_root = get_workspace_root()
db_dir = os.path.join(workspace_root, ".devflow")
os.makedirs(db_dir, exist_ok=True)
db_path = os.path.join(db_dir, "devflow_metadata.db")
engine = create_engine(f"sqlite:///{db_path}", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True)
    indexed_at = Column(DateTime, default=datetime.utcnow)
    chunks = relationship("Chunk", back_populates="file", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(String, primary_key=True, index=True)  # Use UUID
    file_id = Column(Integer, ForeignKey("files.id"))
    type = Column(String)
    name = Column(String)
    start_line = Column(Integer)
    end_line = Column(Integer)
    embedding_id = Column(String)
    file = relationship("File", back_populates="chunks")
    feedback = relationship("Feedback", back_populates="chunk", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String, ForeignKey("chunks.id"))
    feedback_type = Column(String)  # e.g., 'up', 'down', 'comment'
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    chunk = relationship("Chunk", back_populates="feedback")

# Create tables
Base.metadata.create_all(bind=engine)

# --- CRUD utility functions ---
def get_session():
    return SessionLocal()

def add_file(path: str):
    with get_session() as db:
        file = db.query(File).filter(File.path == path).first()
        if file:
            # Optionally update indexed_at timestamp
            file.indexed_at = datetime.utcnow()
            db.commit()
            db.refresh(file)
            return file
        file = File(path=path)
        db.add(file)
        db.commit()
        db.refresh(file)
        return file

def add_chunk(file_id: int, chunk_id: str, type_: str, name: str, start: int, end: int, embedding_id: str):
    with get_session() as db:
        chunk = Chunk(
            id=chunk_id,
            file_id=file_id,
            type=type_,
            name=name,
            start_line=start,
            end_line=end,
            embedding_id=embedding_id
        )
        db.add(chunk)
        db.commit()
        db.refresh(chunk)
        return chunk

def add_feedback(chunk_id: str, feedback_type: str, comment: str = None):
    with get_session() as db:
        feedback = Feedback(chunk_id=chunk_id, feedback_type=feedback_type, comment=comment)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

def delete_file(path: str):
    with get_session() as db:
        file = db.query(File).filter(File.path == path).first()
        if file:
            db.delete(file)
            db.commit()

def delete_chunks_for_file(file_id: int):
    with get_session() as db:
        db.query(Chunk).filter(Chunk.file_id == file_id).delete()
        db.commit()

# More query/delete/update functions can be added as needed.

class MetadataStore:
    def __init__(self, db_path: str = "devflow.db"):
        """
        Initialize the metadata store.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize the database schema."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create files table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_path TEXT UNIQUE NOT NULL,
                    last_indexed TIMESTAMP NOT NULL,
                    file_hash TEXT NOT NULL,
                    language TEXT,
                    metadata TEXT
                )
            """)
            
            # Create chunks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chunks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_id INTEGER NOT NULL,
                    start_line INTEGER NOT NULL,
                    end_line INTEGER NOT NULL,
                    text TEXT NOT NULL,
                    embedding_id TEXT NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (file_id) REFERENCES files (id)
                )
            """)
            
            # Create feedback table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chunk_id INTEGER NOT NULL,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    created_at TIMESTAMP NOT NULL,
                    FOREIGN KEY (chunk_id) REFERENCES chunks (id)
                )
            """)
            
            conn.commit()
    
    def add_file(self, file_path: str, file_hash: str, language: str, metadata: Dict = None) -> int:
        """
        Add or update a file record.
        
        Args:
            file_path: Path to the file
            file_hash: Hash of the file contents
            language: Programming language
            metadata: Additional metadata
            
        Returns:
            File ID
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Check if file exists
            cursor.execute(
                "SELECT id FROM files WHERE file_path = ?",
                (file_path,)
            )
            result = cursor.fetchone()
            
            if result:
                # Update existing file
                file_id = result[0]
                cursor.execute(
                    """
                    UPDATE files 
                    SET last_indexed = ?, file_hash = ?, language = ?, metadata = ?
                    WHERE id = ?
                    """,
                    (datetime.now(), file_hash, language, json.dumps(metadata or {}), file_id)
                )
            else:
                # Insert new file
                cursor.execute(
                    """
                    INSERT INTO files (file_path, last_indexed, file_hash, language, metadata)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (file_path, datetime.now(), file_hash, language, json.dumps(metadata or {}))
                )
                file_id = cursor.lastrowid
            
            conn.commit()
            return file_id
    
    def add_chunk(
        self,
        file_id: int,
        start_line: int,
        end_line: int,
        text: str,
        embedding_id: str,
        metadata: Dict = None
    ) -> int:
        """
        Add a code chunk record.
        
        Args:
            file_id: ID of the parent file
            start_line: Starting line number
            end_line: Ending line number
            text: Code text
            embedding_id: ID of the vector store embedding
            metadata: Additional metadata
            
        Returns:
            Chunk ID
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO chunks (file_id, start_line, end_line, text, embedding_id, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (file_id, start_line, end_line, text, embedding_id, json.dumps(metadata or {}))
            )
            
            chunk_id = cursor.lastrowid
            conn.commit()
            return chunk_id
    
    def add_feedback(self, chunk_id: int, rating: int, comment: Optional[str] = None) -> int:
        """
        Add user feedback for a code chunk.
        
        Args:
            chunk_id: ID of the code chunk
            rating: User rating (1-5)
            comment: Optional feedback comment
            
        Returns:
            Feedback ID
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO feedback (chunk_id, rating, comment, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (chunk_id, rating, comment, datetime.now())
            )
            
            feedback_id = cursor.lastrowid
            conn.commit()
            return feedback_id
    
    def get_file_chunks(self, file_path: str) -> List[Dict]:
        """
        Get all chunks for a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            List of chunk dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute(
                """
                SELECT c.*, f.file_path
                FROM chunks c
                JOIN files f ON c.file_id = f.id
                WHERE f.file_path = ?
                ORDER BY c.start_line
                """,
                (file_path,)
            )
            
            columns = [col[0] for col in cursor.description]
            chunks = []
            
            for row in cursor.fetchall():
                chunk = dict(zip(columns, row))
                chunk['metadata'] = json.loads(chunk['metadata'])
                chunks.append(chunk)
            
            return chunks
    
    def get_chunk_feedback(self, chunk_id: int) -> List[Dict]:
        """
        Get feedback for a code chunk.
        
        Args:
            chunk_id: ID of the code chunk
            
        Returns:
            List of feedback dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute(
                """
                SELECT * FROM feedback
                WHERE chunk_id = ?
                ORDER BY created_at DESC
                """,
                (chunk_id,)
            )
            
            columns = [col[0] for col in cursor.description]
            feedback = []
            
            for row in cursor.fetchall():
                feedback.append(dict(zip(columns, row)))
            
            return feedback
    
    def get_file_stats(self, file_path: str) -> Dict:
        """
        Get statistics for a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dictionary of file statistics
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get file info
            cursor.execute(
                "SELECT * FROM files WHERE file_path = ?",
                (file_path,)
            )
            file = cursor.fetchone()
            
            if not file:
                return None
            
            # Get chunk count
            cursor.execute(
                "SELECT COUNT(*) FROM chunks WHERE file_id = ?",
                (file[0],)
            )
            chunk_count = cursor.fetchone()[0]
            
            # Get average feedback rating
            cursor.execute(
                """
                SELECT AVG(f.rating)
                FROM feedback f
                JOIN chunks c ON f.chunk_id = c.id
                WHERE c.file_id = ?
                """,
                (file[0],)
            )
            avg_rating = cursor.fetchone()[0] or 0
            
            return {
                "file_path": file_path,
                "last_indexed": file[2],
                "language": file[4],
                "chunk_count": chunk_count,
                "average_rating": round(avg_rating, 2),
                "metadata": json.loads(file[5])
            }

def get_last_indexed():
    with get_session() as db:
        file = db.query(File).order_by(File.indexed_at.desc()).first()
        if file and file.indexed_at:
            return file.indexed_at.isoformat()
        return None

def list_files():
    with get_session() as db:
        files = db.query(File).all()
        return [
            {
                "id": f.id,
                "path": f.path,
                "indexed_at": f.indexed_at.isoformat() if f.indexed_at else None
            }
            for f in files
        ]

def list_chunks(file_id: int):
    with get_session() as db:
        chunks = db.query(Chunk).filter(Chunk.file_id == file_id).all()
        return [
            {
                "id": c.id,
                "file_id": c.file_id,
                "type": c.type,
                "name": c.name,
                "start_line": c.start_line,
                "end_line": c.end_line,
                "embedding_id": c.embedding_id
            }
            for c in chunks
        ]

def list_feedback(chunk_id: str):
    with get_session() as db:
        feedbacks = db.query(Feedback).filter(Feedback.chunk_id == chunk_id).all()
        return [
            {
                "id": f.id,
                "chunk_id": f.chunk_id,
                "feedback_type": f.feedback_type,
                "comment": f.comment,
                "created_at": f.created_at.isoformat() if f.created_at else None
            }
            for f in feedbacks
        ]

def clear():
    with get_session() as db:
        db.query(Feedback).delete()
        db.query(Chunk).delete()
        db.query(File).delete()
        db.commit() 