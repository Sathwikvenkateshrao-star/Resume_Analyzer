import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles]),
  });

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const exportToCSV = (data) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]).join(",")
    const rows = data
      .map((row) => Object.values(row).map((v)=> `"${v}"`).join(","))
      .join("\n");

    const csvContent = headers + "\n" + rows;
    const blob = new Blob([csvContent],{type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download","reesume_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link)
  }
  const openTableInNewTab = (data) => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const tableHtml = `
      <html>
        <head>
          <title>Resume Results</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
        </head>
        <body class="p-4">
          <h2 class="text-center mb-4">Resume Analysis Results</h2>
          <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
              <thead class="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Strengths</th>
                  <th>Weaknesses</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (r) => `
                  <tr>
                    <td>${r.name || "N/A"}</td>
                    <td class="${r.score >= 80 ? "text-success fw-bold" : "text-warning"}">${r.score}</td>
                    <td>${r.strengths}</td>
                    <td>${r.weaknesses}</td>
                    <td>${r.summary}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    newWindow.document.writeln(tableHtml);
    newWindow.document.close();
  };

  const handleAnalyze = async () => {
    if (!files.length || !jobDescription) {
      alert("Please upload resumes and enter job description");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("resume_files", file));
    formData.append("title", title);
    formData.append("job_description", jobDescription);

    try {
      await axios.post("http://127.0.0.1:8000/save_analysis", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await axios.get("http://127.0.0.1:8000/results");
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resumes");
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "800px" }}>
        <h1 className="text-center text-primary fw-bold mb-4">
          Resume Analyzer Dashboard
        </h1>

        {/* Upload Section */}
        <div
          {...getRootProps()}
          className="border border-2 border-secondary rounded p-4 text-center mb-3 bg-light"
          style={{ cursor: "pointer" }}
        >
          <input {...getInputProps()} />
          <p className="text-muted mb-0">
            Drag & Drop or click to select
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <ul className="list-group mb-4">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {file.name}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeFile(file.name)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Job Inputs */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Job title"
            className="form-control mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Paste job description..."
            className="form-control"
            rows="4"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          <button  
          onClick={()=> exportToCSV(results)}
          disabled = {!results.length}
          className="btn btn-success">Export CSV</button>

          <button onClick={handleAnalyze} className="btn btn-primary">
            Analyze Resumes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => openTableInNewTab(results)}
            disabled={!results.length}>Open Results in New Tab

          </button>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-dark">
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
                    <td
                      className={
                        r.score >= 80 ? "text-success fw-bold" : "text-warning"
                      }
                    >
                      {r.score}
                    </td>
                    <td>{r.strengths}</td>
                    <td>{r.weaknesses}</td>
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

export default App;
