from fastapi import FastAPI,UploadFile,File,Form,HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware #linking with Front-end
from fastapi import Depends
from fastapi.responses import StreamingResponse
import time
import json
from typing import List
import tempfile
from src.services.resume_service import ResumeService
from src.models.resume_model import ResumeAnalysis, ResumeInput 
from src.utils.resume_extractor import ResumeExtractor
from src.utils.logger import get_logger
from sqlalchemy.orm import Session
from src.db.database import init_db ,SessionLocal
from src.db.models import AnalysisResult, Candidate


app = FastAPI()
resume_service = ResumeService()
logger = get_logger("ResumeAnalyzer")

## ADDING CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


def get_db() :
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    init_db()
    print("Database Initialized on startup")

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
async def upload_resumes(resume_files: List[UploadFile] = File(...)):
    try:
        texts = []
        metadata_list = []

        print(f"Received {len(resume_files)} files for upload")

        for file in resume_files:
            print(f"Processing file : {file.filename}")
            with tempfile.NamedTemporaryFile(
                delete=False, suffix=f".{file.filename.split('.')[-1]}"
            ) as tmp:
                tmp.write(await file.read())
                file_path = tmp.name
            print(f"Saved temp file at : {file_path}")

            try:
                resume_text = ResumeExtractor.extract_text(file_path)
                print(f"Extracted text length : {len(resume_text)}")
                texts.append(resume_text)
                metadata_list.append({"filename": file.filename})
            except Exception as extract_err:
                print(f" Error extracting text from {file.filename}: {extract_err}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Text extraction failed for {file.filename}: {extract_err}",
                )

        #  Create FAISS store ONCE, after processing all resumes
        try:
            print(f"Creating FAISS store with {len(texts)} resumes")
            resume_service.vectorstore.create_store(texts, metadatas=metadata_list)
        except Exception as faiss_err:
            print(f" ERROR creating FAISS store: {faiss_err}")
            raise HTTPException(
                status_code=500, detail=f"Vectorstore error: {faiss_err}"
            )

        logger.info(f" Uploaded and indexed {len(texts)} resumes")
        return {"message": f"{len(texts)} resumes uploaded and indexed successfully"}

    except Exception as e:
        logger.error(f"Failed to upload resumes: {e}")
        print(f"Unhandled error in upload_resumes : {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    

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
        logger.error(f" Failed to rank resumes: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
    
    # New End Point for the DB 
@app.post("/save_analysis")
async def save_analysis(
    job_description: str = Form(...),
    title: str = Form(...),
    top_k: int = Form(10)
):
    try:
        job_data = {
            "title": title,
            "description": job_description
        }
        # fetch the top_k resumes from FAISS
        matches = resume_service.vectorstore.search_resumes(job_description,top_k=top_k) 

        if not matches:
            raise HTTPException(status_code=404,detail="No resumes found in vectorstore")
        
        saved_results = []  
        ranked_output = []

        #Loops through top_k resumes

        for match in matches:
            resume_txt = match.page_content

            ## analyze with LLM

            data = ResumeInput(resume_text=resume_txt,job_description=job_description)
            result = resume_service.analyze_resume(data)

            extracted = resume_service.extract_candidate_info(resume_txt)
            
        ## candidate data ()
            candidate_data = {
            "name": extracted.get("name"),
            "email": extracted.get("email"),
            "phone": extracted.get("phone"),
            "skills": extracted.get("skills", []),
            "resume_text": resume_txt
            }
        # Save into DB
            saved = resume_service.save_analysis(candidate_data, job_data, result)
            saved_results.append(saved.id)

            # add to ranked ouput
            ranked_output.append({
                "candidate_id":saved.id,
                "name":candidate_data["name"] or "N/A",
                "email":candidate_data["email"] or "N/A",
                "phone":candidate_data["phone"] or "N/A",
                "skills":candidate_data["skills"] or "N/A",
                "score":result.score,
                "strengths":result.strengths,
                "weaknesses": result.weaknesses,
                "summary":result.summary,
            })
        return {
                "message":f"Saved {len(saved_results)} analysis(Top {top_k})",
                "result_ids":saved_results,
                "ranked_results":ranked_output
            }
    except Exception as e:
        logger.error(f"Failed to save analysis : {e}")
        raise HTTPException(status_code=500, detail=f"Internal error : {e}")
    

@app.get("/results")
async def get_results(db: Session = Depends(get_db)):
    results = db.query(AnalysisResult).all()
    data = []
    for r in results:
        candidate = db.query(Candidate).filter(Candidate.id == r.candidate_id).first()
        data.append({
            "id": r.id,
            "name": candidate.name or (candidate.resume_text[:30] + "...") if candidate else "N/A",
            "score": r.score,
            "strengths": r.strengths,
            "weaknesses": r.weaknesses,
            "summary": r.summary,
        })
    return data

@app.get("/results/highscore")
async def get_high_scorers(min_score : float = 80):
    db:Session = SessionLocal()
    results = db.query(AnalysisResult).filter(AnalysisResult.score >= min_score).all()
    return results

@app.get("/candidates/skill")
async def search_by_skill(skill:str):
    db:Session = SessionLocal()
    candidates = db.query(Candidate).filter(Candidate.skills.like(f"%{skill}%")).all()
    db.close()
    return candidates

@app.get("/results/{candidate_id}")
async def get_result_by_candidate(candidate_id:int):
    db:Session = SessionLocal()
    results = db.query(AnalysisResult).filter(AnalysisResult.candidate_id == candidate_id).all()
    db.close()
    return results

# fot progress loader

@app.get("/progress")
async def progress():
    def event_stream():
        for percent in range(0,101,2):
            data = {"progress":percent, "message":f"Analyzing....{percent}%"}
            yield f"data: {json.dumps(data)}\n\n"
            time.sleep(1)
    return StreamingResponse(event_stream(), media_type="text/event-stream")