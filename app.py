from fastapi import FastAPI,UploadFile,File,Form,HTTPException
import tempfile
from src.services.resume_service import ResumeService
from src.models.resume_model import ResumeAnalysis, ResumeInput
from src.utils.resume_extractor import ResumeExtractor
from src.utils.logger import get_logger


app = FastAPI()
resume_service = ResumeService()
logger = get_logger("ResumeAnalyzer")

@app.post("/analyze_resume_file", response_model=ResumeAnalysis)
async def analyze_resume_file(
    resume_file:UploadFile = File(...),
    job_description:str = Form(...)
):
    try:
        if not job_description.strip():
            raise HTTPException(status_code=400,detail="Job description is required")
          # save uploaded file temporari

        with tempfile.NamedTemporaryFile(delete=False,suffix=resume_file.filename) as tmp:
            tmp.write(await resume_file.read())
            file_path = tmp.name

  
        # Extract Text
        resume_text = ResumeExtractor.extract_text(file_path)

        # Analyze 
        data = ResumeInput(resume_text=resume_text, job_description=job_description)
        result = resume_service.analyze_resume(data)

        logger.info(f"Analyzed resume: {resume_file.filename}, Score:{result.score}")
        return result
    
    except Exception as e:
        logger.error(f"Failed to analyze {resume_file.filename}:{e}")
        raise HTTPException(status_code=500,detail=f"Internal error:{e}")
