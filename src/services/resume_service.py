from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate
from src.LLMs.groqllm import GroqLLM
from src.models.resume_model import ResumeInput, ResumeAnalysis
from src.utils.embeddings_store import ResumeVectorStore
import json  

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