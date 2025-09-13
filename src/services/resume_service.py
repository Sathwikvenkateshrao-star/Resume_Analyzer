from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate
from src.LLMs.groqllm import GroqLLM
from src.models.resume_model import ResumeInput, ResumeAnalysis
from src.utils.embeddings_store import ResumeVectorStore
import json
from src.db.database import SessionLocal
from src.db.models import Candidate,JobDescription,AnalysisResult

class ResumeService:
    def __init__(self):
        self.llm = GroqLLM().get_llm()
        self.vectorstore = ResumeVectorStore()

    def analyze_resume(self, data: ResumeInput) -> ResumeAnalysis:
        # Define schema
        response_schemas = [
            ResponseSchema(name="strengths", description="List of strengths", type="list"),
            ResponseSchema(name="weaknesses", description="List of weaknesses", type="list"),
            ResponseSchema(name="score", description="Score out of 100", type="float"),
            ResponseSchema(name="summary", description="Summary of candidate fit", type="string")
        ]

        output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = output_parser.get_format_instructions()

        # pass format_instructions as a variable, not inline
        prompt = ChatPromptTemplate.from_template("""
        You are a resume evaluator. Compare the resume with the job description.

        Resume:
        {resume_text}

        Job Description:
        {job_description}

        {format_instructions}
        """)

        chain = prompt | self.llm | output_parser

        try:
            result = chain.invoke({
                "resume_text": data.resume_text,
                "job_description": data.job_description,
                "format_instructions": format_instructions
            })
            return ResumeAnalysis(**result)
        
        except Exception as e:
            print("LLM parsing Failed:",str(e))
            return ResumeAnalysis(
                strengths=[],
                weaknesses=[],
                score=0.0,
                summary=f"Fallback could not parse structured output.Error:{e}"
            )
        #  for the adding multiple of resumes 
    def analyze_multiple_resumes(self, job_description: str, top_k: int = 10) -> list[ResumeAnalysis]:
        """
        Analyze multiple resumes:
        1. Query FAISS vectorstore for top_k resumes.
        2. Run analyze_resume() on each.
        """
        matches = self.vectorstore.search_resumes(job_description, top_k=top_k)
        results = []

        for match in matches:
            data = ResumeInput(
                resume_text=match.page_content,
                job_description=job_description
            )
            results.append(self.analyze_resume(data))

        return results
    ## adding the ranked results
    def rank_all_resumes(self,job_description: str)-> list[ResumeAnalysis]:
        """ Analyze All the resumes stored in FAISS and return ranked by score (desc) """

        matches = self.vectorstore.search_resumes(job_description,top_k=1000)
        results = []

        for match in matches:
            data = ResumeInput(
                resume_text=match.page_content,
                job_description=job_description
            )
            results.append(self.analyze_resume(data))

        # sort reseult by score,highest first
        results.sort(key=lambda r: r.score,reverse=True)
        return results
    ## Extract the Metadata with LLM
    def extract_candidate_info(self,resume_text:str):
        response_schemas = [
            ResponseSchema(name="name",description="Candidate's full name",type="string"),
            ResponseSchema(name ="email", description="Candidate's email",type="string"),
            ResponseSchema(name="phone",description="Candidate's phone number",type="string"),
            ResponseSchema(name="skills",description="list of main skills",type="string"),
        ]
        ouput_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = ouput_parser.get_format_instructions()

        prompt = ChatPromptTemplate.from_template(
        """ Extract structured candidate detailes from the following resume text 
            
        Resume:
        {resume_text}

        {format_instructions}
        """)
        chain = prompt | self.llm | ouput_parser

        try:
            return chain.invoke({"resume_text":resume_text,"format_instructions":format_instructions})
        except Exception as e:
            print("Candidate info extraction failed",str(e))
            return{"name":None, "email":None, "phone":None, "skills":[]}
    # saving in the real DB (Postgre,SQL,SQLite)

    def save_analysis(self,candidate_data,job_data,analysis_result):
        db = SessionLocal()

        ## inserting the job description to DB
        job = JobDescription(
            title = job_data.get("title",None),
            description = job_data.get("description", "")
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        ## Extraact metadata if missing 
        if not candidate_data.get("name"):
            candidate_data = self.extract_candidate_info(candidate_data.get("resume_text", ""))
        ## inserting the candidates to db 

        candidate = Candidate(
            name = candidate_data.get("name"),
            email = candidate_data.get("email"),
            phone = candidate_data.get("phone"),
            skills = ", ".join(candidate_data.get("skills",[])),
            resume_text = candidate_data.get("resume_text", "")
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        print("Candidate data received :",candidate_data)
        ## inserting the Analysis Result in DB

        result = AnalysisResult(
            candidate_id = candidate.id,
            job_id = job.id,
            score = analysis_result.score,
            strengths = json.dumps(analysis_result.strengths),
            weaknesses = json.dumps(analysis_result.weaknesses),
            summary = analysis_result.summary,
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        db.close()
        return result
