import React, { useState, useEffect } from 'react';
import { getDocs, collection, query as firestoreQuery, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import "../assets/styles/StatusDashboard.css";

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

const StatusDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const cameraNo = queryParams.get("cameraNo");

  useEffect(() => {
    const fetchRequests = async () => {
      if (!cameraNo) {
        setLoading(false);
        return;
      }

      const requestsCollection = collection(db, "requests");
      const q = firestoreQuery(requestsCollection, where("cameraNo", "==", cameraNo));
      const requestSnapshot = await getDocs(q);
      const requestList = requestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestList);
      setLoading(false);
    };

    fetchRequests();
  }, [cameraNo]);

  const handleHome = () => {
    navigate('/');
  };

  const handleAddRequest = () => {
    navigate(`/request-form?cameraNo=${cameraNo}`);
  };
  
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "Received" ? "Pending" : "Received";
    try {
      const requestDoc = doc(db, "requests", id);
      await updateDoc(requestDoc, { status: newStatus });
      setRequests(requests.map(req => (req.id === id ? { ...req, status: newStatus } : req)));
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="status-dashboard">
      <button className="home-icon" onClick={handleHome}>
        <FaHome size={30} />
      </button>
      <h2>Status Dashboard Cam:{cameraNo}</h2>
      <div className="requests-list">
        {requests.map(req => (
          <div key={req.id} className="request-item">
            <p>Camera No: {req.cameraNo}</p>
            <p>Items: {req.items}</p>
            <p>Priority: {req.priority}</p>
            <p>Status: {req.status}</p>
            <div className="button-container">
              <button
                className="status-toggle-button"
                style={{ backgroundColor: req.status === "Received" ? "green" : "red" }}
                onClick={() => handleStatusToggle(req.id, req.status)}
              >
                {req.status === "Pending" ? "To Receive" : "Received"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="add-request-button" onClick={handleAddRequest}>Add Request</button>
    </div>
  );
};

export default StatusDashboard;