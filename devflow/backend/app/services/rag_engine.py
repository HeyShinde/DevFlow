"""
RAG Engine Service

This service implements the Retrieval-Augmented Generation pipeline for code understanding.
It combines code embeddings, vector store retrieval, and LLM integration to provide
contextual code explanations and answers to natural language queries.
"""

from typing import List, Dict, Optional
import os
from openai import OpenAI
from .embedder import CodeEmbedder
from ..db.vector_store import VectorStore
from app.core.config import get_settings

settings = get_settings()

class RAGEngine:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL or "gpt-4o"
        
    def _create_prompt(self, query: str, context: List[Dict]) -> str:
        """
        Create a prompt for the LLM using the query and retrieved context.
        
        Args:
            query: User's question or query
            context: List of relevant code chunks with metadata
            
        Returns:
            Formatted prompt string
        """
        # Format context
        context_str = "\n\n".join([
            f"File: {chunk['file_path']}\n"
            f"Lines: {chunk['start_line']}-{chunk['end_line']}\n"
            f"Code:\n{chunk['text']}"
            for chunk in context
        ])
        
        # Create prompt
        prompt = f"""You are an AI assistant that helps developers understand their codebase.
Given the following code context and user query, provide a clear and concise answer.

Code Context:
{context_str}

User Query: {query}

Please provide a detailed answer that:
1. Directly addresses the user's query
2. References specific parts of the code when relevant
3. Explains any complex concepts or patterns
4. Suggests potential improvements if applicable

Answer:"""
        
        return prompt
    
    def query(self, query: str, k: int = 5) -> Dict:
        """
        Process a natural language query about the codebase.
        
        Args:
            query: User's question about the code
            k: Number of relevant code chunks to retrieve
            
        Returns:
            Dictionary containing the answer and relevant code references
        """
        # Generate query embedding
        query_embedding = self.embedder.embed_query(query)
        
        # Retrieve relevant code chunks
        chunks, scores = self.vector_store.search(query_embedding, k=k)
        
        # Create prompt with context
        prompt = self._create_prompt(query, chunks)
        
        # Generate response using LLM
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an AI assistant that helps developers understand their codebase."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Format response
        answer = response.choices[0].message.content
        
        return {
            "answer": answer,
            "references": [
                {
                    "file_path": chunk["file_path"],
                    "start_line": chunk["start_line"],
                    "end_line": chunk["end_line"],
                    "relevance_score": float(score)
                }
                for chunk, score in zip(chunks, scores)
            ]
        }
    
    def find_similar_code(self, code: str, context: Optional[List[Dict]] = None) -> str:
        """
        Generate similar code for a specific code snippet.
        Args:
            code: Code snippet to find similar code for
            context: Optional list of related code chunks for context
        Returns:
            Natural language explanation of the code
        """
        # Create prompt
        if context:
            context_str = "\n\n".join([
                f"Related code from {chunk['file_path']}:\n{chunk['text']}"
                for chunk in context
            ])
            prompt = f"""Please find similar code for the following code snippet. Consider the related code for context.

Code to find similar for:
{code}

Related code:
{context_str}

Please provide a clear explanation that:
1. Describes what the code does
2. Explains any complex logic or patterns
3. References related code when relevant
4. Suggests potential improvements if applicable

Explanation:"""
        else:
            prompt = f"""Please find similar code for the following code snippet.

Code:
{code}

Please provide a clear explanation that:
1. Describes what the code does
2. Explains any complex logic or patterns
3. Suggests potential improvements if applicable

Explanation:"""
        # Generate response using LLM
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an AI assistant that helps developers understand their codebase."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content

    def answer_query(self, query: str, k: int = 3, openai_key: str = None, openai_model: str = None, openai_token_limit: int = None) -> str:
        # Use provided key/model/token_limit or fallback to defaults
        client = self.client
        model = openai_model or self.model
        token_limit = openai_token_limit or 512
        if openai_key:
            client = OpenAI(api_key=openai_key)
        results, scores = self.vector_store.search(query, k=k)
        context = "\n\n".join([r.get("code", r.get("text", "")) for r in results])
        prompt = (
            f"You are an expert software engineer. Given the following code context and a user question, "
            f"provide a clear, concise answer.\n\n"
            f"Code Context:\n{context}\n\n"
            f"Question: {query}\n\nAnswer:"
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert software engineer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=token_limit,
            temperature=0.2
        )
        return response.choices[0].message.content.strip() 