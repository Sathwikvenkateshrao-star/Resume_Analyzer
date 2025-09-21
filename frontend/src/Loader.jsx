import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">{text}</p>
    </div>
  );
};

export default Loader;
