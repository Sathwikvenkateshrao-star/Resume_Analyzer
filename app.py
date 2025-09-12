from fastapi import FastAPI,UploadFile,File,Form,HTTPException
from typing import List
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

## for multiple of resumes upload

@app.post("/upload_resumes")
async def upload_resumes(resume_files:List[UploadFile] = File(...)):
    try:
        texts = []
        for file in resume_files:
            with tempfile.NamedTemporaryFile(delete=False,suffix=f".{file.filename.split('.')[-1]}") as tmp:
                tmp.write(await file.read())
                file_path = tmp.name
            texts.append(ResumeExtractor.extract_text(file_path))

        resume_service.vectorstore.create_store(texts)
        logger.info(f"Upload and indexed {len(texts)} resumes")
        return {"message": f"{len(texts)} resumes uploaded and indexed successfully"}
    except Exception as e :
        logger.error(f"Failed to upload resumes: {e}")
        raise HTTPException(status_code=500,detail=f"Internal error:{e}")
    

### Analyze Job description against the TOP resumes(FAISS+LLM)

@app.post("/analyze_resumes")
async def analyze_resumes(job_description:str = Form(...),top_k: int = 10):
    try:
        if not job_description.strip():
            raise HTTPException(status_code=400,detail="Job description is required")
        
        results = resume_service.analyze_multiple_resumes(job_description,top_k=top_k)
        logger.info(f"Analyzed {len(results)} resumes against JD")
        return {"results":[r.model_dump() for r in results]}
    except Exception as e:
        logger.error(f"Failed to analyze resumes : {e}")
        raise HTTPException(status_code=500,detail=f"Internal error:{e}")
    
## Analyze and give the rank and sorting 

@app.post("/ranked_resumes")
async def ranked_resumes(job_description:str = Form(...)):
    try:
        if not job_description.strip():
            raise HTTPException(status_code=400,detail="Job description is required")
        
        results = resume_service.rank_all_resumes(job_description)
        logger.info(f"Ranked {len(results)} resumes against JD")

        return {"ranked_results":[r.model_dump() for r in results]}
    except Exception as e:
        logger.error(f"❌ Failed to rank resumes: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")