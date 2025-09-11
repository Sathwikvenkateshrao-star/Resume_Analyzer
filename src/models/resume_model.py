from pydantic import BaseModel
from typing import List

class ResumeInput(BaseModel):
    resume_text: str
    job_description: str

class ResumeAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    score: float
    summary: str
