import os
from langchain_community.vectorstores import FAISS
# from langchain_openai import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

class ResumeVectorStore:
    def __init__(self,persist_dir="vector_db"):
        self.persist_dir = persist_dir
        # self.embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.vectorstore = None

    def create_store(self,resumes:list[str]):
        """ Create a new FAISS vector store from list of resumes """
        self.vectorstore = FAISS.from_texts(resumes,self.embeddings)
        self.vectorstore.save_local(self.persist_dir)

    def load_store(self):
        """ Load existing vector store """
        if os.path.exists(self.persist_dir):
            self.vectorstore = FAISS.load_local(self.persist_dir,self.embeddings,allow_dangerous_deserialization=True)
        else:
            raise ValueError(" No FAISS index found. Please upload resumes first.")

    def add_resume(self,resume_text:str):
        """ Add a single resume to the store """

        if self.vectorstore is None:
            self.create_store([resume_text])
        else:
            self.vectorstore.add_texts([resume_text])
            self.vectorstore.save_local(self.persist_dir)

    def search_resumes(self,job_description:str,top_k: int = 10):
        """  Find top K resumes matching the JD """
        if self.load_store is None:
            self.load_store()
        return self.vectorstore.similarity_search(job_description,k=top_k)