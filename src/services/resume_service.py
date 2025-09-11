from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate
from src.LLMs.groqllm import GroqLLM
from src.models.resume_model import ResumeInput, ResumeAnalysis

class ResumeService:
    def __init__(self):
        self.llm = GroqLLM().get_llm()

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

        # ✅ pass format_instructions as a variable, not inline
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
            return ResumeAnalysis(
                strengths=[],
                weaknesses=[],
                score=0.0,
                summary=f"Parsing failed: {e}"
            )
