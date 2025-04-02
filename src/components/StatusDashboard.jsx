"use client"

import { useState, useEffect } from "react"
import { getDocs, collection, query as firestoreQuery, where, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate, useLocation } from "react-router-dom"
import { FaHome, FaPlus, FaCheckCircle, FaHourglassHalf, FaBoxOpen, FaTruck, FaMapMarkerAlt } from "react-icons/fa"
import "../assets/styles/StatusDashboard.css"

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search)
}

const StatusDashboard = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const queryParams = useQueryParams()
  const cameraNo = queryParams.get("cameraNo")

  useEffect(() => {
    const fetchRequests = async () => {
      if (!cameraNo) {
        setLoading(false)
        return
      }

      const requestsCollection = collection(db, "requests")
      const q = firestoreQuery(requestsCollection, where("cameraNo", "==", cameraNo))
      const requestSnapshot = await getDocs(q)
      const requestList = requestSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Sort by status (Pending first) and then by priority (High first)
      const sortedList = requestList.sort((a, b) => {
        if (a.status === b.status) {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return a.status === "Pending" ? -1 : 1
      })

      setRequests(sortedList)
      setLoading(false)
    }

    fetchRequests()
  }, [cameraNo])

  const handleHome = () => {
    navigate("/")
  }

  const handleAddRequest = () => {
    navigate(`/request-form?cameraNo=${cameraNo}`)
  }

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "Received" ? "Pending" : "Received"
    try {
      const requestDoc = doc(db, "requests", id)
      await updateDoc(requestDoc, { status: newStatus })

      // Update local state
      const updatedRequests = requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req))

      // Re-sort the list
      const sortedList = updatedRequests.sort((a, b) => {
        if (a.status === b.status) {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return a.status === "Pending" ? -1 : 1
      })

      setRequests(sortedList)
    } catch (error) {
      console.error("Error updating status:", error.message)
    }
  }

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "Received":
        return <FaCheckCircle className="status-icon received" />
      case "Pending":
        return <FaHourglassHalf className="status-icon pending" />
      case "Ready":
        return <FaBoxOpen className="status-icon ready" />
      case "On the way":
        return <FaTruck className="status-icon on-the-way" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading requests...</p>
      </div>
    )
  }

  // Check if this is an "Other" location request
  const isOtherLocation = cameraNo === "0"
  // Get the location from the first request if it exists
  const locationName = isOtherLocation && requests.length > 0 ? requests[0].location : null

  return (
    <div className="status-dashboard-container">
      <div className="status-dashboard-header">
        <button className="home-button" onClick={handleHome}>
          <FaHome />
        </button>
        <h1>
          {isOtherLocation ? (
            <span className="location-title">
              <FaMapMarkerAlt className="location-icon" />
              {locationName || "Other Location"}
            </span>
          ) : (
            `Camera ${cameraNo} Status`
          )}
        </h1>
      </div>

      <div className="status-dashboard-content">
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Requests Found</h3>
            <p>You haven't made any requests yet.</p>
            <button className="add-request-button" onClick={handleAddRequest}>
              <FaPlus /> Create New Request
            </button>
          </div>
        ) : (
          <>
            <div className="requests-grid">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`request-card priority-${req.priority?.toLowerCase()} status-${req.status?.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="request-header">
                    <div className="request-status">
                      {getStatusIcon(req.status)}
                      <span className="status-text">{req.status}</span>
                    </div>
                    <div className="priority-badge">{req.priority}</div>
                  </div>

                  <div className="request-details">
                    <div className="items-section">
                      <h3>Requested Items</h3>
                      <p>{req.items}</p>
                    </div>

                    {req.timestamp && (
                      <div className="timestamp">Requested: {new Date(req.timestamp).toLocaleString()}</div>
                    )}
                  </div>

                  <div className="request-actions">
                    <button
                      className={`status-toggle-button ${req.status === "Received" ? "received" : "pending"}`}
                      onClick={() => handleStatusToggle(req.id, req.status)}
                    >
                      {req.status === "Received" ? "Mark as Pending" : "Mark as Received"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="floating-add-button" onClick={handleAddRequest}>
              <FaPlus />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default StatusDashboard

