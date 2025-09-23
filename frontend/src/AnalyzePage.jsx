import { useState } from "react";
import axios from "axios";
import ResultsTable from "../src/ResultsTable";
import Loader from "./Loader";
import Navbar from "./Navbar";

function AnalyzePage() {
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);

  // 🔹 Run final backend analysis after progress completes
  const runAnalysis = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("job_description", jobDescription);
    formData.append("top_k", topK);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:8000/save_analysis",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(res.data.ranked_results || []);
    } catch (err) {
      console.error(err);
      alert("Error analyzing the resumes");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // 🔹 Analyze resumes with SSE progress
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert("Please Enter job description");
      return;
    }

    setLoadingText("Starting analysis...");
    setLoading(true);
    setProgress(0);

    const evtSource = new EventSource("http://127.0.0.1:8000/progress");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setLoadingText(data.message);

      if (data.progress >= 100) {
        evtSource.close();
        runAnalysis(); // ✅ Only call API once progress is finished
      }
    };

    evtSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      evtSource.close();
      setLoading(false);
    };
  };

  // 🔹 Export results as CSV
  const handleExportCSV = () => {
    if (results.length === 0) {
      alert("No results to export");
      return;
    }

    setLoadingText("Preparing CSV, please wait...");
    setLoading(true);
    setProgress(0);

    let percent = 0;
    const interval = setInterval(() => {
      percent += 20;
      setProgress(percent);
      setLoadingText(`Exporting CSV... ${percent}%`);

      if (percent >= 100) {
        clearInterval(interval);

        const headers = [
          "Name",
          "Email",
          "Phone",
          "Score",
          "Skills",
          "Strengths",
          "Weaknesses",
          "Summary",
        ];
        const rows = results.map((r) => [
          r.name || "N/A",
          r.email,
          r.phone,
          r.score,
          Array.isArray(r.skills) ? r.skills.join(", ") : r.skills,
          Array.isArray(r.strengths) ? r.strengths.join(", ") : r.strengths,
          Array.isArray(r.weaknesses) ? r.weaknesses.join(", ") : r.weaknesses,
          r.summary,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "analyzed_resumes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoading(false);
        setProgress(0);
      }
    }, 300);
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="card shadow p-4 position-relative">
          <h2 className="text-center mb-4">Analyze Resumes</h2>

          {loading ? (
            <div className="text-center">
              <Loader text={loadingText} />
              {/* Progress Bar */}
              <div className="progress w-100 mt-3" style={{ height: "25px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Job Title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <textarea
                  placeholder="Paste job description..."
                  className="form-control"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  value={topK}
                  min={1}
                  onChange={(e) => setTopK(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success flex-fill"
                  onClick={handleAnalyze}
                >
                  Analyze Resumes
                </button>
                <button
                  className="btn btn-primary flex-fill"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
              </div>

              {results.length > 0 && (
                <div className="mt-4">
                  <ResultsTable results={results} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AnalyzePage;
