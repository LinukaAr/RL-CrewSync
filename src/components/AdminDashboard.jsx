import React, { useState, useEffect } from 'react';
import "../assets/styles/AdminDashboard.css";
import { getDocs, setDoc, doc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa'; // Import the check icon

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [updatedStatus, setUpdatedStatus] = useState({}); // Track update status
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsCollection = collection(db, "requests");
      const requestSnapshot = await getDocs(requestsCollection);
      const requestList = requestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestList);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (!newStatus || typeof newStatus !== "string") {
        throw new Error("Invalid status. It must be a non-empty string.");
      }

      console.log(`Updating status for document ID: ${id}`);

      const requestDoc = doc(db, "requests", id.toString());
      const docSnap = await getDoc(requestDoc);

      if (docSnap.exists()) {
        await updateDoc(requestDoc, { status: newStatus });
        console.log("Document updated successfully.");
      } else {
        console.error("Document does not exist, creating a new one.");
        await setDoc(requestDoc, { status: newStatus }, { merge: true });
        console.log("Document created successfully.");
      }

      setRequests(requests.map(req => (req.id === id ? { ...req, status: newStatus } : req)));
      setUpdatedStatus(prev => ({ ...prev, [id]: true })); // Set update status to true
      
      // Set a timeout to remove the tick after 5 seconds
      setTimeout(() => {
        setUpdatedStatus(prev => ({ ...prev, [id]: false }));
      }, 5000);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleStatusChange = (id, event) => {
    const newStatus = event.target.value;
    setSelectedStatus(prev => ({ ...prev, [id]: newStatus }));
  };

  const handleSubmit = (id) => {
    const newStatus = selectedStatus[id];
    if (newStatus) {
      console.log(`Submitting status update for request ID: ${id}`);
      handleStatusUpdate(id, newStatus);
    } else {
      console.error('No status selected for request:', id);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="requests-list">
        {requests.map(req => (
          <div key={req.id} className="request-item">
            <p>Camera No: {req.cameraNo}</p>
            <p>Items: {req.items}</p>
            <p>Priority: {req.priority}</p>
            <p style={{ color: req.status === "Received"  ? "green" : "red" }}>
              Status: {req.status}
            </p>            
            <select
              value={selectedStatus[req.id] || req.status}
              onChange={(e) => handleStatusChange(req.id, e)}
            >
              <option value="Pending">Pending</option>
              <option value="Ready">Ready</option>
              <option value="On the way">On the way</option>
            </select>
            <button onClick={() => handleSubmit(req.id)}>Update Status</button>
            {updatedStatus[req.id] && <FaCheck style={{ color: 'green', marginLeft: '10px' }} />}
          </div>
        ))}
      </div>
      <button className='logout-button' onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;