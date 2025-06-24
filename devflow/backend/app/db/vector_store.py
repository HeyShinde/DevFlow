"""
Vector Store Service

This service handles storing and retrieving code embeddings using ChromaDB.
"""

from typing import List, Dict, Any, Tuple
import chromadb
import os
import uuid
from chromadb import Client, Collection
from app.services.embedder import code_embedder
import numpy as np
from app.db.metadata_store import get_last_indexed

class VectorStore:
    """Vector store for code embeddings using ChromaDB."""

    COLLECTION_NAME = "code_embeddings"

    def __init__(self, client: Client):
        """Initialize the vector store."""
        # Create a persistent client with a local directory
        persist_directory = os.path.join(os.path.dirname(__file__), "chroma_db")
        os.makedirs(persist_directory, exist_ok=True)
        self.client = client
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def add_vectors(self, texts: List[str], metadatas: List[Dict[str, Any]]) -> None:
        """Add vectors to the store.
        
        Args:
            texts: List of code texts
            metadatas: List of metadata dictionaries
        """
        try:
            # Generate embeddings with metadata
            embeddings = []
            for text, metadata in zip(texts, metadatas):
                embedding = code_embedder.embed_code(text, metadata)
                embeddings.append(embedding)
            
            # Generate unique IDs
            ids = [str(uuid.uuid4()) for _ in range(len(texts))]
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
        except Exception as e:
            print(f"Error adding vectors: {str(e)}")
            raise

    def search(self, query: str, k: int = 5) -> Tuple[List[Dict[str, Any]], List[float]]:
        """Search for similar vectors.
        
        Args:
            query: Query string
            k: Number of results to return
            
        Returns:
            Tuple of (results, scores)
        """
        try:
            # Generate query embedding with enhanced context
            query_embedding = code_embedder.embed_query(query)
            
            # Search collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                include=["metadatas", "documents", "distances"]
            )
            
            # Extract results and scores
            metadatas = results["metadatas"][0]
            documents = results["documents"][0]
            distances = results["distances"][0]
            
            # Convert distances to similarity scores (1 - normalized distance)
            max_distance = max(distances) if distances else 1.0
            scores = [1 - (d / max_distance) for d in distances]
            
            # Combine results
            search_results = []
            for metadata, doc, score in zip(metadatas, documents, scores):
                result = metadata.copy()
                result["text"] = doc
                search_results.append(result)
            
            return search_results, scores
            
        except Exception as e:
            print(f"Error searching vectors: {str(e)}")
            raise

    def clear(self) -> None:
        """Clear all vectors from the store."""
        try:
            self.client.delete_collection(self.COLLECTION_NAME)
        except Exception as e:
            # Ignore error if collection does not exist
            if "does not exists" not in str(e):
                raise
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def get_stats(self, debug: bool = False) -> Dict[str, Any]:
        """Get statistics about the store, with optional debug info."""
        count = self.collection.count()
        collection_info = self.collection.get(include=["embeddings", "documents", "metadatas"])
        embeddings = collection_info.get("embeddings")
        documents = collection_info.get("documents")
        metadatas = collection_info.get("metadatas")
        # Robust dimension extraction for both numpy arrays and lists
        dimensions = 0
        if isinstance(embeddings, np.ndarray) and embeddings.shape[0] > 0:
            dimensions = embeddings.shape[1]
        elif isinstance(embeddings, list) and len(embeddings) > 0 and hasattr(embeddings[0], '__len__'):
            dimensions = len(embeddings[0])
        # File/document count
        file_count = 0
        file_names = set()
        languages = set()
        errors = []
        if metadatas and isinstance(metadatas, list):
            file_count = len(set(md.get('file_path') for md in metadatas if md and md.get('file_path')))
            for md in metadatas:
                if md:
                    if md.get('file_path'):
                        file_names.add(md['file_path'])
                    if md.get('language'):
                        languages.add(md['language'])
        # Sample file names/snippets
        sample_files = list(file_names)[:5] if file_names else []
        sample_snippets = documents[:5] if documents and isinstance(documents, list) else []
        # Use latest indexed_at from File table
        last_indexed = get_last_indexed() or None
        # Warnings
        if dimensions == 0:
            errors.append("No valid embeddings found. Try re-indexing or check backend logs.")
        # Prepare response
        stats = {
            "total_vectors": count,
            "dimensions": dimensions,
            "file_count": file_count,
            "sample_files": sample_files,
            "sample_snippets": sample_snippets,
            "last_indexed": last_indexed,
            "languages": list(languages),
            "errors": errors
        }
        if debug:
            stats["debug_info"] = {
                "ids": collection_info.get("ids")[:10] if collection_info.get("ids") else [],
                "sample_metadata": metadatas[:3] if metadatas else []
            }
        return stats

    def list_all(self) -> List[Dict[str, Any]]:
        """List all stored embeddings with their metadata.

        Returns:
            List of dictionaries containing metadata for each stored embedding
        """
        results = self.collection.get()
        return [
            {
                "id": id,
                "metadata": metadata
            }
            for id, metadata in zip(results["ids"], results["metadatas"])
        ] 