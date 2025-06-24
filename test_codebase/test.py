"""
A test module demonstrating various Python code structures.
This module contains examples of classes, methods, and functions with doc strings.
"""

class Calculator:
    """A simple calculator class that performs basic arithmetic operations."""
    
    def __init__(self, initial_value=0):
        """Initialize the calculator with an optional initial value.
        
        Args:
            initial_value (int, optional): The starting value. Defaults to 0.
        """
        self.value = initial_value
    
    def add(self, x: int, y: int) -> int:
        """Add two numbers and return the result.
        
        Args:
            x (int): First number
            y (int): Second number
            
        Returns:
            int: The sum of x and y
        """
        return x + y
    
    def subtract(self, x: int, y: int) -> int:
        """Subtract y from x and return the result.
        
        Args:
            x (int): The number to subtract from
            y (int): The number to subtract
            
        Returns:
            int: The difference between x and y
        """
        return x - y

class StringProcessor:
    """A utility class for string manipulation operations."""
    
    def __init__(self):
        """Initialize the string processor."""
        self.processed_strings = []
    
    def reverse(self, text: str) -> str:
        """Reverse a string.
        
        Args:
            text (str): The string to reverse
            
        Returns:
            str: The reversed string
        """
        return text[::-1]
    
    def count_words(self, text: str) -> int:
        """Count the number of words in a string.
        
        Args:
            text (str): The input string
            
        Returns:
            int: The number of words
        """
        return len(text.split())

def greet(name: str) -> str:
    """Generate a greeting message.
    
    Args:
        name (str): The name to greet
        
    Returns:
        str: A greeting message
    """
    return f"Hello, {name}!"

def calculate_factorial(n: int) -> int:
    """Calculate the factorial of a number.
    
    Args:
        n (int): The number to calculate factorial for
        
    Returns:
        int: The factorial of n
        
    Raises:
        ValueError: If n is negative
    """
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n == 0:
        return 1
    return n * calculate_factorial(n - 1)

def multiply(self, x: int, y: int) -> int:
    """Multiply two numbers and return the result.

    Args:
        x (int): The first number
        y (int): The second number

    Returns:
        int: The product of x and y
    """
    return x * y