import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="d-flex align-items-center justify-content-center bg-light text-center"
        style={{ height: "100vh" }}
      >
        <div className="container">
          <h1 className="display-3 fw-bold">Smart Resume Analyzer</h1>
          <p className="lead text-muted mt-3 mb-4">
            Upload resumes, analyze candidates with AI, and find the best match
            for your job role in minutes.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => (window.location.href = "/login")}
          >
            Get Started →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="d-flex align-items-center justify-content-center bg-white"
        style={{ height: "100vh" }}
      >
        <div className="container text-center">
          <h2 className="mb-5 fw-bold">🚀 Why Choose Resume Analyzer?</h2>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="card shadow h-100 border-0">
                <div className="card-body">
                  <h5 className="fw-bold">📂 Easy Upload</h5>
                  <p className="text-muted">
                    Drag & drop multiple resumes in seconds.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow h-100 border-0">
                <div className="card-body">
                  <h5 className="fw-bold">🤖 AI-Powered</h5>
                  <p className="text-muted">
                    Get instant candidate scoring & analysis.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow h-100 border-0">
                <div className="card-body">
                  <h5 className="fw-bold">📊 Ranked Results</h5>
                  <p className="text-muted">
                    View strengths, weaknesses, and match scores.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow h-100 border-0">
                <div className="card-body">
                  <h5 className="fw-bold">📥 Export CSV</h5>
                  <p className="text-muted">
                    Download detailed reports for HR teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="d-flex align-items-center bg-light"
        style={{ height: "100vh" }}
      >
        <div className="container text-center">
          <h2 className="mb-4 fw-bold">👨‍💼 About Us</h2>
          <p className="lead text-muted mb-4">
            At Resume Analyzer, we believe hiring should be <b>smarter</b>,{" "}
            <b>faster</b>, and <b>fairer</b>. Our AI-powered platform saves
            recruiters hours of manual effort by instantly analyzing, ranking,
            and comparing resumes against your job description.
          </p>
          <div className="row">
            <div className="col-md-4">
              <h5 className="fw-bold">🎯 Our Mission</h5>
              <p className="text-muted">
                To empower recruiters and HR teams with AI tools that simplify
                candidate evaluation and improve hiring decisions.
              </p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">🌍 Our Vision</h5>
              <p className="text-muted">
                A world where companies hire the best talent quickly, fairly,
                and with data-driven insights instead of guesswork.
              </p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">💡 How We Help</h5>
              <p className="text-muted">
                By automating resume analysis, highlighting candidate strengths,
                and delivering ranked results — so you never miss the perfect
                hire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="d-flex align-items-center bg-dark text-white"
        style={{ height: "100vh" }}
      >
        <div className="container text-center">
          <h2 className="mb-4 fw-bold">📩 Contact Us</h2>
          <p className="mb-5">
            Have questions? We'd love to hear from you. Reach out to us via
            email, phone, or the form below.
          </p>

          <div className="row justify-content-center">
            <div className="col-md-4 text-start mb-4">
              <h5>📧 Email</h5>
              <p><a href="mailto:sathwikvenkateshrao@gmail.com" className="text-white text-decoration-none">support@resumeanalyzer.com</a></p>
              <h5>📞 Phone</h5>
              <p>+91-9110613773</p>
              <h5>📍 Address</h5>
              <p>N.S.Rao & Co main Road Soraba,
              <br></br>Shivmogga, district, Karnataka 577-429</p>

            </div>
            <div className="col-md-6">
              <form className="bg-white text-dark p-4 rounded shadow">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your Email"
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Your Message"
                  ></textarea>
                </div>
                <button className="btn btn-primary w-100">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">
          © {new Date().getFullYear()} Resume Analyzer | Built for Smarter
          Hiring 🚀
        </p>
      </footer>
    </>
  );
}

export default HomePage;
