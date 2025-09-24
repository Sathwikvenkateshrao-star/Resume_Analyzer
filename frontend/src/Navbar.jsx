// src/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Show logout button only when logged in & not on homepage/login
  const showLogout =
    token && location.pathname !== "/" && location.pathname !== "/login";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Resume Analyzer
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {location.pathname === "/" ? (
              <>
                {/* Homepage navigation */}
                <li className="nav-item">
                  <button
                    className="btn nav-link text-white"
                    onClick={() => scrollToSection("features")}
                  >
                    Features
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn nav-link text-white"
                    onClick={() => scrollToSection("about")}
                  >
                    About
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn nav-link text-white"
                    onClick={() => scrollToSection("contact")}
                  >
                    Contact
                  </button>
                </li>
              </>
            ) : (
              token && (
                <>
                  {/* Authenticated routes */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/upload">
                      Upload
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/analyze">
                      Analyze
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/results">
                      Results
                    </Link>
                  </li>
                </>
              )
            )}
          </ul>
          {showLogout && (
            <button className="btn btn-outline-light ms-3" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
