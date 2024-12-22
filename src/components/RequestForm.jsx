import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTachometerAlt } from "react-icons/fa";
import "../assets/styles/RequestForm.css";
import { db } from "../firebase"; // Import Firestore instance
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function RequestForm() {
  const query = useQuery();
  const initialCameraNo = query.get("cameraNo") || "";
  const [cameraNo, setCameraNo] = useState(initialCameraNo);
  const [priority, setPriority] = useState("Low");
  const [items, setItems] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCameraNo(initialCameraNo);
  }, [initialCameraNo]);

  const handleSubmit = async () => {
    const newRequest = {
      cameraNo,
      items,
      priority,
      status: "Pending"
    };

    try {
      // Use a consistent ID for the request
      const requestId = `${cameraNo}-${Date.now()}`;
      const requestDoc = doc(db, "requests", requestId);

      // Add new request to Firestore
      await setDoc(requestDoc, newRequest, { merge: true });
      setShowSuccess(true);
      console.log("Request submitted:", newRequest);

      // Redirect to the status dashboard after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/camera-status?cameraNo=${cameraNo}`);
      }, 3000); // 3-second delay
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  // Redirect to the status dashboard
  const handleStatusDashboard = () => {
    navigate(`/camera-status?cameraNo=${cameraNo}`);
  };

  return (
    <div className="request-form">
      <a href="/" className="back-button">
        <FaArrowLeft /> 
      </a>
      <h2>Request</h2>
      <div className="request-form-card">
        <label className="no"><strong>Camera Number:</strong> {cameraNo}</label>
        <label>Items Needed:</label>
        <input
          type="text"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder="Batteries, Food, Water, etc."
        />
        <label>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleStatusDashboard}><FaTachometerAlt /> Check Status </button>
      </div>  
      {showSuccess && (
        <div className="success-message">
          <FaCheckCircle size={50} color="green" />
          <p>Request submitted successfully!</p>
        </div>
      )}
    </div>
  );
}

export default RequestForm;