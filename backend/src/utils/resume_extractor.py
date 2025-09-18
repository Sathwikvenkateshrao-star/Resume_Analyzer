import pdfplumber
import docx

#  Resume Extractor with the Error handling
class ResumeExtractor:
    @staticmethod
    def extract_text(file_path:str)->str:
        if file_path.endswith(".pdf"):
            return ResumeExtractor._extract_pdf(file_path)
        elif file_path.endswith(".docx"):
            return ResumeExtractor._extract_docx(file_path)
        else:
            raise ValueError("Unsupported file format.Only .pdf and .docx are supported.")
        
    @staticmethod
    def _extract_pdf(file_path:str)-> str:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() 
                if page_text:
                    text += page_text + "\n"
        if not text.strip():
            raise ValueError("Could not extract text from pdf (maybe scanned image?).")
        return text.strip()
    
    @staticmethod
    def _extract_docx(file_path:str) -> str:
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        if not text.strip():
            raise ValueError("Could not extract text from DOCX")
        return text.strip()
