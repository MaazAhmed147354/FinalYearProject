"""
ResuMatch CV Evaluation System

This package contains the Python models for resume parsing and evaluation.
It integrates with the Node.js backend through command-line interfaces.
"""

from .model import CVEvaluationSystem, CVEvaluator

__all__ = ['CVEvaluationSystem', 'CVEvaluator']