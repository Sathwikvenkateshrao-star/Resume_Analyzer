# Resume Analyzer

An AI-powered resume analyzer built with FastAPI and Groq LLM.
It evaluates resumes against job descriptions, extracting strengths, weaknesses, a compatibility score, and a summary.
Supports PDF and DOCX resume uploads.

------------------------------------------------------------
⚡ Features
------------------------------------------------------------
- Upload PDF/DOCX resumes
- Compare resumes against job descriptions
- Extract candidate strengths and weaknesses
- Generate a match score (0–100)
- Return a concise summary of candidate fit
- REST API with FastAPI + Swagger UI

------------------------------------------------------------
📂 Project Structure
------------------------------------------------------------
Resume_analyzer/
│── app.py
│── requirements.txt
│── .env
│── README.txt
│
├── src/
│   ├── LLMs/
│   │   ├── groqllm.py
│   │
│   ├── models/
│   │   ├── resume_model.py
│   │
│   ├── services/
│   │   ├── resume_service.py
│   │
│   ├── utils/
│   │   ├── resume_extractor.py

------------------------------------------------------------
🔧 Installation
------------------------------------------------------------
1. Clone this repo:
   git clone https://github.com/yourusername/resume-analyzer.git
   cd resume-analyzer

2. Create a virtual environment:
   python -m venv venv
   source venv/bin/activate   # Mac/Linux
   venv\Scripts\activate      # Windows

3. Install dependencies:
   pip install -r requirements.txt

4. Add your Groq API key in .env:
   GROQ_API_KEY=your_groq_api_key_here

------------------------------------------------------------
▶️ Running the App
------------------------------------------------------------
Start the FastAPI server:
   uvicorn app:app --reload

Visit Swagger docs at:
   http://127.0.0.1:8000/docs

------------------------------------------------------------
🔗 API Endpoints
------------------------------------------------------------

1️⃣ Analyze Resume (Raw Text)
POST /analyze_resume

Request body:
{
  "resume_text": "John Doe, Python developer with 5 years of FastAPI experience.",
  "job_description": "Looking for a backend engineer skilled in Python, FastAPI, and cloud."
}

Response:
{
  "strengths": ["Python", "FastAPI"],
  "weaknesses": ["Limited cloud experience"],
  "score": 82.5,
  "summary": "Strong backend developer with Python/FastAPI expertise, but needs more cloud exposure."
}

---

2️⃣ Analyze Resume (File Upload)
POST /analyze_resume_file

Form-data:
- resume_file → File (.pdf or .docx)
- job_description → Text

Response:
{
  "strengths": ["AWS", "Python"],
  "weaknesses": ["No frontend experience"],
  "score": 75.0,
  "summary": "Candidate matches backend role requirements but lacks frontend exposure."
}

------------------------------------------------------------
📦 Dependencies
------------------------------------------------------------
- FastAPI
- Uvicorn
- LangChain
- Groq API
- pdfplumber (PDF parsing)
- python-docx (DOCX parsing)
- pydantic

------------------------------------------------------------
🛠️ Next Improvements
------------------------------------------------------------
- Add embeddings + vector store to handle multiple resumes at scale
- Save analyzed resumes into a database (SQLite/Postgres)
- Build a Streamlit UI for easier usage
- Add job description repository for automated matching

------------------------------------------------------------
👨‍💻 Author
------------------------------------------------------------
Built by Sathwik Venkatesh Rao
