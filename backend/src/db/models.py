from sqlalchemy import Column,Integer,String,Text,Float,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from datetime import datetime,timezone
from .database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=True)
    email = Column(String,nullable=True)
    phone = Column(String,nullable=True)
    skills = Column(Text,nullable=True)
    resume_text = Column(Text,nullable=False)

    analyses = relationship("AnalysisResult",back_populates="candidate")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc))

    analyses = relationship("AnalysisResult", back_populates="job")



class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer,primary_key=True,index=True)
    candidate_id = Column(Integer,ForeignKey("candidates.id"))
    job_id = Column(Integer,ForeignKey("job_descriptions.id"))
    score = Column(Float,nullable=False)
    strengths = Column(Text,nullable=True)
    weaknesses = Column(Text,nullable=True)
    summary = Column(Text,nullable=True)
    analyzed_at = Column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc))

    candidate = relationship("Candidate",back_populates="analyses")
    job = relationship("JobDescription",back_populates="analyses")

class HRUser(Base):
    __tablename__ = "hr_users"

    id = Column(Integer,primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)