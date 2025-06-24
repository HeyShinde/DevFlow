"""
CodeParser Service

Supported languages (with current setup):
- python
- javascript
- java
- go
- ruby
- cpp
- csharp
- kotlin

Unsupported/skipped (due to missing pre-built grammars or incompatibility):
- typescript
- php
- c
- rust
- scala
- swift
"""
from tree_sitter import Language, Parser, Node
import os
import sys
from pathlib import Path
import tempfile
import subprocess
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum

class ChunkType(Enum):
    """Types of code chunks that can be extracted."""
    FUNCTION = "function"
    CLASS = "class"
    METHOD = "method"
    DOCSTRING = "docstring"
    COMMENT = "comment"
    MODULE = "module"

class CodeParser:
    def __init__(self):
        self.parsers = {}
        self._load_parsers()

    def _load_parsers(self):
        """Load language parsers using pre-built packages."""
        # Map of language names to their package names
        language_packages = {
            'python': 'tree_sitter_python',
            'javascript': 'tree_sitter_javascript',
            'java': 'tree_sitter_java',
            'go': 'tree_sitter_go',
            'ruby': 'tree_sitter_ruby',
            'cpp': 'tree_sitter_cpp',
            'csharp': 'tree_sitter_c_sharp',
            'kotlin': 'tree_sitter_kotlin'
        }

        for lang_name, package_name in language_packages.items():
            try:
                # Import the language package
                lang_module = __import__(package_name)
                # Get the language object
                language = Language(lang_module.language())
                # Create a parser for this language
                parser = Parser()
                parser.language = language
                self.parsers[lang_name] = parser
                print(f"Successfully loaded {lang_name} parser")
            except ImportError:
                print(f"Failed to import {package_name}")
            except Exception as e:
                print(f"Failed to load {lang_name} parser: {str(e)}")

    def parse_code(self, code: str, language: str) -> Optional[Node]:
        """Parse code using the appropriate tree-sitter parser."""
        if language not in self.parsers:
            raise ValueError(f"Unsupported language: {language}")
            
        parser = self.parsers[language]
        tree = parser.parse(bytes(code, 'utf8'))
        return tree

    def _get_node_text(self, node: Any, code_bytes: bytes) -> str:
        """Extract text from a node."""
        return code_bytes[node.start_byte:node.end_byte].decode('utf-8')

    def _get_docstring(self, node: Any, code_bytes: bytes) -> Optional[str]:
        """Extract docstring from a node with enhanced parsing."""
        docstrings = []
        
        # Look for docstring nodes in children
        for child in node.children:
            if child.type in ['string', 'string_literal', 'comment']:
                text = self._get_node_text(child, code_bytes)
                # Clean up docstring formatting
                text = text.strip()
                if text.startswith(('"""', "'''")):
                    # Remove quotes and clean up indentation
                    text = text[3:-3].strip()
                elif text.startswith(('"', "'")):
                    text = text[1:-1].strip()
                docstrings.append(text)
        
        # For Python, look for docstring in the first statement
        if node.type == 'function_definition' or node.type == 'class_definition':
            body = node.child_by_field_name('body')
            if body and len(body.children) > 0:
                first_stmt = body.children[0]
                if first_stmt.type == 'expression_statement':
                    expr = first_stmt.children[0]
                    if expr.type == 'string':
                        text = self._get_node_text(expr, code_bytes)
                        if text.startswith(('"""', "'''")):
                            text = text[3:-3].strip()
                        elif text.startswith(('"', "'")):
                            text = text[1:-1].strip()
                        docstrings.append(text)
        
        return '\n'.join(docstrings) if docstrings else None

    def _normalize_docstring(self, docstring: str) -> str:
        """Remove leading/trailing whitespace and normalize indentation for docstrings."""
        import textwrap
        if not docstring:
            return docstring
        return textwrap.dedent(docstring).strip()

    def _get_comments(self, node, code_bytes):
        """Extract comments that are direct children of the node (not module-level)."""
        comments = []
        for child in node.children:
            if child.type in ['comment', 'line_comment', 'block_comment']:
                comment_text = self._get_node_text(child, code_bytes).strip()
                if comment_text.startswith('#'):
                    comment_text = comment_text[1:].strip()
                comments.append(comment_text)
        return comments

    def extract_code_elements(self, code: str, language: str) -> Dict[str, List[Dict]]:
        """
        Extract various code elements including functions, classes, methods, docstrings, and comments.
        
        Returns:
            Dictionary with keys:
            - functions: List of function definitions
            - classes: List of class definitions
            - methods: List of method definitions
            - docstrings: List of docstrings
            - comments: List of comments
        """
        # Language-specific node type mappings
        FUNCTION_NODES = {
            'python': 'function_definition',
            'javascript': 'function_declaration',
            'java': 'method_declaration',
            'go': 'function_declaration',
            'ruby': 'method',
            'cpp': 'function_definition',
            'csharp': 'method_declaration',
            'kotlin': 'function_declaration',
        }
        CLASS_NODES = {
            'python': 'class_definition',
            'javascript': 'class_declaration',
            'java': 'class_declaration',
            'go': 'type_declaration',
            'ruby': 'class',
            'cpp': 'class_specifier',
            'csharp': 'class_declaration',
            'kotlin': 'class_declaration',
        }
        function_node = FUNCTION_NODES.get(language, 'function_definition')
        class_node = CLASS_NODES.get(language, 'class_definition')

        try:
            parser = self.parsers[language]
            tree = parser.parse(bytes(code, 'utf8'))
            
            elements = {
                ChunkType.FUNCTION.value: [],
                ChunkType.CLASS.value: [],
                ChunkType.METHOD.value: [],
                ChunkType.DOCSTRING.value: [],
                ChunkType.COMMENT.value: []
            }
            code_bytes = bytes(code, 'utf8')
            
            def visit_node(node, parent_stack=None):
                if parent_stack is None:
                    parent_stack = []
                
                # Process the current node
                if node.type == function_node:
                    name = self._get_function_name(node, language)
                    code = self._get_node_text(node, code_bytes)
                    docstring = self._get_docstring(node, code_bytes)
                    comments = self._get_comments(node, code_bytes)
                    
                    # Check if this is a method (inside a class)
                    is_method = any(p.type == class_node for p in parent_stack)
                    parent_class = parent_stack[-1].child_by_field_name('name').text.decode('utf-8') if is_method and parent_stack else None
                    
                    element = {
                        'name': name,
                        'code': code,
                        'docstring': docstring,
                        'comments': comments,
                        'type': ChunkType.METHOD.value if is_method else ChunkType.FUNCTION.value,
                        'parent_class': parent_class if is_method else None,
                        'start_line': node.start_point[0],
                        'end_line': node.end_point[0]
                    }
                    
                    if is_method:
                        elements[ChunkType.METHOD.value].append(element)
                    else:
                        elements[ChunkType.FUNCTION.value].append(element)
                        
                elif node.type == class_node:
                    name = self._get_class_name(node, language)
                    code = self._get_node_text(node, code_bytes)
                    docstring = self._get_docstring(node, code_bytes)
                    comments = self._get_comments(node, code_bytes)
                    
                    elements[ChunkType.CLASS.value].append({
                        'name': name,
                        'code': code,
                        'docstring': docstring,
                        'comments': comments,
                        'type': ChunkType.CLASS.value,
                        'start_line': node.start_point[0],
                        'end_line': node.end_point[0]
                    })
                
                # Process children
                for child in node.children:
                    visit_node(child, parent_stack + [node])
            
            visit_node(tree.root_node)
            return elements
        except Exception as e:
            print(f"Error extracting code elements: {str(e)}")
            return {
                ChunkType.FUNCTION.value: [],
                ChunkType.CLASS.value: [],
                ChunkType.METHOD.value: [],
                ChunkType.DOCSTRING.value: [],
                ChunkType.COMMENT.value: []
            }

    def _get_function_name(self, node: Any, language: str) -> str:
        """Extract function name based on language."""
        if language == 'python':
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language in ['javascript', 'java', 'go', 'cpp', 'csharp', 'kotlin']:
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language == 'ruby':
            return node.child_by_field_name('name').text.decode('utf-8')
        return "unknown_function"

    def _get_class_name(self, node: Any, language: str) -> str:
        """Extract class name based on language."""
        if language == 'python':
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language in ['javascript', 'java', 'go', 'cpp', 'csharp', 'kotlin']:
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language == 'ruby':
            return node.child_by_field_name('name').text.decode('utf-8')
        return "unknown_class"

    def _get_method_name(self, node: Any, language: str) -> str:
        """Extract method name based on language."""
        if language == 'python':
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language in ['javascript', 'java', 'go', 'cpp', 'csharp', 'kotlin']:
            return node.child_by_field_name('name').text.decode('utf-8')
        elif language == 'ruby':
            return node.child_by_field_name('name').text.decode('utf-8')
        return "unknown_method"

    def split_code_into_chunks(self, code: str, language: str, max_chunk_size: int = 1000) -> List[Dict]:
        """Split code into manageable chunks for processing."""
        def create_chunk(text: str, chunk_type: ChunkType, metadata: Dict = None) -> Dict:
            return {
                'text': text,
                'type': chunk_type.value,
                'metadata': metadata or {}
            }
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        # Split code into lines
        lines = code.split('\n')
        
        for line in lines:
            line_size = len(line) + 1  # +1 for newline
            
            if current_size + line_size > max_chunk_size and current_chunk:
                # Create a chunk from current lines
                chunk_text = '\n'.join(current_chunk)
                chunks.append(create_chunk(chunk_text, ChunkType.MODULE))
                current_chunk = []
                current_size = 0
            
            current_chunk.append(line)
            current_size += line_size
        
        # Add the last chunk if there are remaining lines
        if current_chunk:
            chunk_text = '\n'.join(current_chunk)
            chunks.append(create_chunk(chunk_text, ChunkType.MODULE))
        
        return chunks

    def extract_functions(self, tree: Node, code: str) -> List[Dict[str, str]]:
        """Extract function definitions from the AST."""
        functions = []
        code_bytes = bytes(code, 'utf8')
        
        def visit_node(node):
            print(f"Visiting node type: {node.type}")  # Debug logging
            if node.type == 'function_definition':
                try:
                    name_node = node.child_by_field_name('name')
                    if name_node:
                        name = name_node.text.decode('utf-8')
                        code = self._get_node_text(node, code_bytes)
                        docstring = self._get_docstring(node, code_bytes)
                        print(f"Found function: {name}")  # Debug logging
                        functions.append({
                            'name': name,
                            'code': code,
                            'docstring': docstring
                        })
                except Exception as e:
                    print(f"Error extracting function: {str(e)}")  # Debug logging
            for child in node.children:
                visit_node(child)
        
        visit_node(tree.root_node)
        print(f"Total functions found: {len(functions)}")  # Debug logging
        return functions

    def extract_classes(self, tree: Node, code: str) -> List[Dict[str, str]]:
        """Extract class definitions from the AST."""
        classes = []
        code_bytes = bytes(code, 'utf8')
        
        def visit_node(node):
            if node.type == 'class_definition':
                try:
                    name_node = node.child_by_field_name('name')
                    if name_node:
                        name = name_node.text.decode('utf-8')
                        code = self._get_node_text(node, code_bytes)
                        docstring = self._get_docstring(node, code_bytes)
                        print(f"Found class: {name}")  # Debug logging
                        classes.append({
                            'name': name,
                            'code': code,
                            'docstring': docstring
                        })
                except Exception as e:
                    print(f"Error extracting class: {str(e)}")  # Debug logging
            for child in node.children:
                visit_node(child)
        
        visit_node(tree.root_node)
        print(f"Total classes found: {len(classes)}")  # Debug logging
        return classes

    def parse_file(self, file_path: Path) -> list:
        """Parse a file and extract its code elements."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
            
            # Determine language from file extension
            ext = file_path.suffix[1:].lower()
            language_map = {
                'py': 'python',
                'js': 'javascript',
                'java': 'java',
                'go': 'go',
                'rb': 'ruby',
                'cpp': 'cpp',
                'cc': 'cpp',
                'cxx': 'cpp',
                'cs': 'csharp',
                'kt': 'kotlin'
            }
            language = language_map.get(ext, 'python')
            
            # Parse the code
            tree = self.parse_code(code, language)
            if not tree:
                return []
            
            # Extract elements
            elements = self.extract_code_elements(code, language)
            return elements
        except Exception as e:
            print(f"Error parsing file {file_path}: {str(e)}")
            return [] 