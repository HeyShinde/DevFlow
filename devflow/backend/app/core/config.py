"""
Configuration Module

This module centralizes all configuration settings for the DevFlow backend.
"""

import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DevFlow"
    DEBUG: bool = True  # Enable debug mode for development
    SECRET_KEY: str = "dev-secret-key"  # Change in production
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # ChromaDB Settings
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    COLLECTION_NAME: str = "code_embeddings"
    
    # Model Settings
    EMBEDDING_MODEL: str = "microsoft/codebert-base"
    LLM_MODEL: str = "gpt-4.1-nano"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
    EMBEDDING_DIMENSION: int = 768
    MAX_SEQUENCE_LENGTH: int = 512
    
    # Cache Settings
    CACHE_TTL: int = 3600  # seconds
    CACHE_PREFIX: str = "devflow_"
    
    # Database Settings
    DB_PATH: str = "devflow.db"
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()

# Create global settings instance for backward compatibility
settings = get_settings() 