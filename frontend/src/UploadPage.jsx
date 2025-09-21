import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

function UploadPage(){
    const [files, setFiles] = useState([]);
    const [message,setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const {getRootProps, getInputProps} = useDropzone({
        onDrop:(acceptedFiles) =>{
            setFiles((prevFiles) => [...prevFiles,...acceptedFiles]);
        },
    });

    //  clear the file one by one by name

    const removeFile = (fileName) => {
        setFiles(files.filter((file) => file.name !== fileName));
    };


    // Clear all the file at once

    const clearAll = () => setFiles([]);

    const handleUpload = async () =>{
        if(!files.length) {
            alert("Please Select the Resumes first");
            return;
        }
        const formData = new FormData();
        files.forEach((file) => formData.append("resume_files",file));
        
        // setting the laoder

        setLoadingText("Uploading resumes, please wait...")
        setLoading(true);
        setProgress(0)

        try{
            const res = await axios.post("http://127.0.0.1:8000/upload_resumes",formData)
            onUploadProgress:(progressEvent)=>{
              const percent = Math.round(
                (progressEvent.loaded * 100)/progressEvent.total
              );
              setProgress(percent);
              setLoadingText(`Uploading resumes..${percent}%`);
            };
            setMessage(res.data.message);
            // this will cleaar after the upload
            setFiles([]);
        }catch (err){
            console.error(err)
            alert("Error uploading resumes");
        }finally{
          setLoading(false)
          setProgress(0)
        }
    };
      return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Upload Resumes</h2>


        {/* Loader */}
        {loading ? (
          <div className="text-center">
            <Loader text={loadingText} />

            {/*  Progress Bar */}
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
        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className="border border-2 border-secondary rounded p-5 text-center mb-3 bg-light"
          style={{ cursor: "pointer" }}
        >
          <input {...getInputProps()} />
          <p className="mb-0">Drag & drop resumes here, or click to select</p>
        </div>

        {/* Show selected files */}
        {files.length > 0 && (
          <ul className="list-group mb-3">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {file.name}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeFile(file.name)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button className="btn btn-secondary w-50" onClick={clearAll}>
            Clear All
          </button>
          <button className="btn btn-primary w-50" onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading...":"Upload"}
          </button>
        </div>

        {message &&  !loading &&(
            <div className="text-center mt-4">
                <p className="text-success">{message}</p>
                {/* Navigate to analyze */}
                <button className="btn btn-success mt-2" onClick={() => navigate("/analyze")}>
                    Go to Analyze Resumes
                </button>
            </div>
            
            )}
            </>
        )}
      </div>
    </div>
  );
}

export default UploadPage;