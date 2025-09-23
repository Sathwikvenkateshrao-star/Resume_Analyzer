// src/HomePage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container-fluid bg-light py-5">
        <div className="container text-center">
          {/* Hero Section */}
          <h1 className="display-4 fw-bold">Smart Resume Analyzer</h1>
          <p className="lead text-muted mt-3 mb-4">
            Upload resumes, analyze candidates with AI, and find the best match for your job role in minutes.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
          >
            Get Started →
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Why Choose Resume Analyzer?</h2>
        <div className="row text-center">
          <div className="col-md-3 mb-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="fw-bold">📂 Easy Upload</h5>
                <p className="text-muted">Drag & drop multiple resumes in seconds.</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="fw-bold">🤖 AI-Powered</h5>
                <p className="text-muted">Get instant candidate scoring & analysis.</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="fw-bold">📊 Ranked Results</h5>
                <p className="text-muted">View strengths, weaknesses, and match scores.</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="fw-bold">📥 Export CSV</h5>
                <p className="text-muted">Download detailed reports for HR teams.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <p className="mb-0">
          © {new Date().getFullYear()} Resume Analyzer | Built for Smarter Hiring
        </p>
      </footer>
    </>
  );
}

export default HomePage;
