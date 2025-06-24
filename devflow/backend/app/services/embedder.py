"""
Embedder Service

This service handles code embeddings using a code-aware model from Hugging Face.
It provides functionality to generate embeddings for code chunks and queries.
"""

from typing import List, Dict, Union
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
import torch

class CodeEmbedder:
    def __init__(self, model_name: str = "microsoft/codebert-base-mlm"):
        """
        Initialize the code embedder with a pre-trained model.
        
        Args:
            model_name: Name of the pre-trained model to use for embeddings.
                       Default is microsoft/codebert-base-mlm, which is specifically
                       trained for code understanding.
        """
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()  # Set to evaluation mode
        
    def _prepare_code(self, code: str, metadata: Dict = None) -> str:
        """
        Prepare code for embedding by cleaning and formatting.
        
        Args:
            code: Raw code string
            metadata: Optional metadata about the code (type, name, docstring, etc.)
            
        Returns:
            Cleaned code string with context
        """
        # Convert numpy array to string if needed
        if isinstance(code, np.ndarray):
            code = str(code)
        elif not isinstance(code, str):
            code = str(code)
            
        # Start with the code type and name if available
        context = []
        if metadata:
            if metadata.get('type'):
                context.append(f"Type: {metadata['type']}")
            if metadata.get('name'):
                context.append(f"Name: {metadata['name']}")
            if metadata.get('docstring'):
                context.append(f"Description: {metadata['docstring']}")
            if metadata.get('parent_class'):
                context.append(f"Part of class: {metadata['parent_class']}")
        
        # Add the code itself
        code = ' '.join(code.split())  # Remove extra whitespace and normalize line endings
        
        # Combine context and code
        if context:
            return ' '.join(context) + ' ' + code
        return code
    
    def _generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a given text."""
        # Prepare input
        inputs = self.tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
        
        # Generate embeddings
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Use [CLS] token embedding as the sentence embedding
            embeddings = outputs.last_hidden_state[:, 0, :].numpy()
            
        # Normalize the embedding
        embedding = embeddings[0]  # Get the first (and only) embedding
        embedding = embedding / np.linalg.norm(embedding)
        
        return embedding
    
    def embed_code(self, code: str, metadata: Dict = None) -> np.ndarray:
        """Generate embedding for a code snippet with context."""
        prepared_code = self._prepare_code(code, metadata)
        return self._generate_embedding(prepared_code)
    
    def embed_query(self, query: str) -> np.ndarray:
        """Generate embedding for a natural language query."""
        # Add context to make the query more code-aware
        enhanced_query = f"Find code that: {query}"
        return self._generate_embedding(enhanced_query)
    
    def compute_similarity(self, query_embedding: np.ndarray, code_embedding: np.ndarray) -> float:
        """Compute cosine similarity between query and code embeddings."""
        return float(np.dot(query_embedding, code_embedding))

# Create a singleton instance
code_embedder = CodeEmbedder() 