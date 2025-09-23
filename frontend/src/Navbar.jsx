// src/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
    // specifically removing the logout button on these pages
  const showLogout = token && location.pathname !== "/" && location.pathname !== "/login";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/upload">Resume Analyzer</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
           {/* {token && ( 
          <> */}
            <li className="nav-item">
              <Link className="nav-link" to="/upload">Upload</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/analyze">Analyze</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/results">Results</Link>
            </li>
          {/* </>
            )} */}
          </ul>
          {showLogout && (
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
