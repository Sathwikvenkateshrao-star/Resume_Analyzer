import React, { useState, useMemo } from "react";

const ResultsTable = ({ results }) => {
  const [sortKey, setSortKey] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔹 Sorting logic
  const sortedResults = useMemo(() => {
    let sorted = [...results];
    sorted.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [results, sortKey, sortOrder]);

  // 🔹 Filtering logic
  const filteredResults = useMemo(() => {
    return sortedResults.filter(
      (r) =>{
        const skillText = Array.isArray(r.skills)
      ? r.skills.join(" ").toLowerCase()
      : (r.skills || "").toString().toLowerCase();
        return(
            r.name?.toLowerCase().includes(filter.toLowerCase()) ||
            skillText.includes(filter.toLowerCase())
        );
    });
  }, [sortedResults, filter]);

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      {/* 🔍 Search box */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name or skills..."
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* 📊 Results table */}
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("email")}>Email</th>
            <th onClick={() => handleSort("phone")}>Phone</th>
            <th onClick={() => handleSort("streangth")}>Strengths</th>
            <th onClick={() => handleSort("weaknesses")}>Weaknesses</th>
            <th onClick={() => handleSort("score")}>Score</th>
            <th onClick={() => handleSort("skills")}>Skills</th>
            <th onClick={() => handleSort("summary")}>Summary</th>
            
          </tr>
        </thead>
        <tbody>
          {paginatedResults.map((r, i) => (
            <tr key={i}>
              <td>{r.name || "N/A"}</td>
              <td>{r.email || "N/A"}</td>
              <td>{r.phone || "N/A"}</td>
              <td>{r.strengths}</td>
              <td>{r.weaknesses}</td>
              <td className={r.score >= 80 ? "text-successw fw-bold" :"text-warning"}>{r.score}</td>
              <td>{r.skills}</td>
              <td>{r.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📑 Pagination */}
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i + 1}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ResultsTable;
