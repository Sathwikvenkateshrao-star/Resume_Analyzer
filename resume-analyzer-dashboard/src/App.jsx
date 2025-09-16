import { Link } from "react-router-dom";
  
function App() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Resume Analyzer Dashboard</h1>
      <div className="flex justify-center gap-6">
        <Link to="/upload">
          <button className="bg-blue-500 text-white px-6 py-3 rounded">
            Upload Resumes
          </button>
        </Link>
        <Link to="/analyze">
          <button className="bg-green-500 text-white px-6 py-3 rounded">
            Analyze Resumes
          </button>
        </Link>
      </div>
    </div>
  );
}
export default App