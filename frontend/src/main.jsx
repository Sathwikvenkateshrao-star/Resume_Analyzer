import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import UploadPage from "./UploadPage";
import AnalyzePage from "./AnalyzePage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to ="/upload"/>}></Route>
      <Route path="/upload" element={<UploadPage/>}></Route>
      <Route path="/analyze" element={<AnalyzePage/>}></Route>
    </Routes>
  </BrowserRouter>
  </React.StrictMode>
);