import { useState } from "react";
import axios from "axios";

function AnalyzePage() {
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState([]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert("Please Enter job description");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("job_description", jobDescription);
    formData.append("top_k", topK);

    try {
      const res = await axios.post("http://127.0.0.1:8000/save_analysis", formData);
      setResults(res.data.ranked_results || []);
    } catch (err) {
      console.error(err);
      alert("Error analyzing the resumes");
    }
  };

  // 🔽 Export results as CSV
  const handleExportCSV = () => {
    if (results.length === 0) {
      alert("No results to export");
      return;
    }

    const headers = ["Name", "Score", "Strengths", "Weaknesses", "Summary"];
    const rows = results.map((r) => [
      r.name || "N/A",
      r.score,
      Array.isArray(r.strengths) ? r.strengths.join(", ") : r.strengths,
      Array.isArray(r.weaknesses) ? r.weaknesses.join(", ") : r.weaknesses,
      r.summary,
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analyzed_resumes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Analyze Resumes</h2>

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
            onChange={(e) => setTopK(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-success flex-fill" onClick={handleAnalyze}>
            Analyze Resumes
          </button>
          <button className="btn btn-primary flex-fill" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Strengths</th>
                  <th>Weaknesses</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.name || "N/A"}</td>
                    <td>{r.score}</td>
                    <td>{Array.isArray(r.strengths) ? r.strengths.join(", ") : r.strengths}</td>
                    <td>{Array.isArray(r.weaknesses) ? r.weaknesses.join(", ") : r.weaknesses}</td>
                    <td>{r.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyzePage;
