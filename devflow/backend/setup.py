from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = fh.read().splitlines()

setup(
    name="devflow-backend",
    version="0.0.1",
    author="Shinde Aditya",
    author_email="aditya@heyshinde.com",
    description="Backend service for DevFlow - AI-powered contextual assistant",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/heyshinde/devflow",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
    ],
    python_requires=">=3.11",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "devflow=app.main:main",
        ],
    },
)
