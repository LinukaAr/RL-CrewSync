"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTachometerAlt,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa"
import "../assets/styles/RequestForm.css"
import { db } from "../firebase" // Import Firestore instance
import { doc, setDoc } from "firebase/firestore"

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function RequestForm() {
  const query = useQuery()
  const initialCameraNo = query.get("cameraNo") || ""
  const [cameraNo, setCameraNo] = useState(initialCameraNo)
  const [priority, setPriority] = useState("Low")
  const [items, setItems] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setCameraNo(initialCameraNo)
  }, [initialCameraNo])

  const handleSubmit = async () => {
    if (!items.trim()) {
      alert("Please enter the items needed")
      return
    }

    setIsSubmitting(true)

    const newRequest = {
      cameraNo,
      items,
      priority,
      status: "Pending",
      timestamp: new Date().toISOString(),
    }

    try {
      // Use a consistent ID for the request
      const requestId = `${cameraNo}-${Date.now()}`
      const requestDoc = doc(db, "requests", requestId)

      // Add new request to Firestore
      await setDoc(requestDoc, newRequest, { merge: true })
      setShowSuccess(true)
      console.log("Request submitted:", newRequest)

      // Redirect to the status dashboard after a short delay
      setTimeout(() => {
        setShowSuccess(false)
        navigate(`/camera-status?cameraNo=${cameraNo}`)
      }, 3000) // 3-second delay
    } catch (error) {
      console.error("Error submitting request:", error)
      setIsSubmitting(false)
    }
  }

  // Redirect to the status dashboard
  const handleStatusDashboard = () => {
    navigate(`/camera-status?cameraNo=${cameraNo}`)
  }

  // Get priority icon based on selected priority
  const getPriorityIcon = () => {
    switch (priority) {
      case "High":
        return <FaExclamationCircle className="priority-icon high" />
      case "Medium":
        return <FaExclamationTriangle className="priority-icon medium" />
      case "Low":
        return <FaInfoCircle className="priority-icon low" />
      default:
        return null
    }
  }

  return (
    <div className="request-form-container">
      <div className="request-form-wrapper">
        <div className="form-header">
          <button onClick={() => navigate("/")} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Equipment Request</h2>
        </div>

        <div className="request-form-card">
          <div className="camera-badge">
            <span>Camera</span>
            <strong>{cameraNo}</strong>
          </div>

          <div className="form-group">
            <label htmlFor="items">Items Needed:</label>
            <input
              id="items"
              type="text"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Batteries, Food, Water, etc."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority:</label>
            <div className="select-wrapper">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`form-select priority-${priority.toLowerCase()}`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {getPriorityIcon()}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>

            <button onClick={handleStatusDashboard} className="status-button">
              <FaTachometerAlt /> Check Status
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h3>Request Submitted!</h3>
            <p>Your request has been sent successfully.</p>
            <p className="redirect-text">Redirecting to status page...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestForm

