"use client"

import { useState, useEffect } from "react"
import { getDocs, setDoc, doc, updateDoc, getDoc, collection } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from "react-router-dom"
import { FaCheck, FaSearch, FaSort, FaHistory, FaClipboardList, FaSync, FaMapMarkerAlt } from "react-icons/fa"
import "../assets/styles/AdminDashboard.css"

// Create a new CSS file for the improved styling
const AdminDashboard = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState({})
  const [updatedStatus, setUpdatedStatus] = useState({}) // Track update status
  const [activeTab, setActiveTab] = useState("active") // 'active' or 'history'
  const [searchTerm, setSearchTerm] = useState("")
  const [sortNewest, setSortNewest] = useState(true)
  const navigate = useNavigate()

  const fetchRequests = async () => {
    try {
      setRefreshing(true)
      const requestsCollection = collection(db, "requests")
      const requestSnapshot = await getDocs(requestsCollection)
      const requestList = requestSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setRequests(requestList)
      return requestList
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleRefresh = async () => {
    await fetchRequests()
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (!newStatus || typeof newStatus !== "string") {
        throw new Error("Invalid status. It must be a non-empty string.")
      }

      console.log(`Updating status for document ID: ${id}`)

      const requestDoc = doc(db, "requests", id.toString())
      const docSnap = await getDoc(requestDoc)

      if (docSnap.exists()) {
        await updateDoc(requestDoc, { status: newStatus })
        console.log("Document updated successfully.")
      } else {
        console.error("Document does not exist, creating a new one.")
        await setDoc(requestDoc, { status: newStatus }, { merge: true })
        console.log("Document created successfully.")
      }

      setRequests(requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
      setUpdatedStatus((prev) => ({ ...prev, [id]: true })) // Set update status to true

      // Set a timeout to remove the tick after 5 seconds
      setTimeout(() => {
        setUpdatedStatus((prev) => ({ ...prev, [id]: false }))
      }, 5000)
    } catch (error) {
      console.error("Error updating status:", error.message)
    }
  }

  const handleStatusChange = (id, event) => {
    const newStatus = event.target.value
    setSelectedStatus((prev) => ({ ...prev, [id]: newStatus }))
  }

  const handleSubmit = (id) => {
    const newStatus = selectedStatus[id]
    if (newStatus) {
      console.log(`Submitting status update for request ID: ${id}`)
      handleStatusUpdate(id, newStatus)
    } else {
      console.error("No status selected for request:", id)
    }
  }

  const handleLogout = () => {
    navigate("/")
  }

  // Filter requests based on active tab, search term, and sort order
  const filteredRequests = requests
    .filter((req) => {
      // Filter by tab (active or history)
      const tabMatch = activeTab === "active" ? req.status !== "Received" : req.status === "Received"

      // Filter by search term
      const searchMatch =
        searchTerm === "" ||
        req.cameraNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.items?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location?.toLowerCase().includes(searchTerm.toLowerCase())

      return tabMatch && searchMatch
    })
    .sort((a, b) => {
      // Sort by timestamp if available, otherwise by ID
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0

      return sortNewest ? bTime - aTime : aTime - bTime
    })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Equipment Request Dashboard</h1>
        <div className="header-actions">
          <button
            className={`refresh-button ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh requests"
          >
            <FaSync /> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-controls">
        <div className="tabs">
          <button className={`tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>
            <FaClipboardList /> Active Requests
          </button>
          <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
            <FaHistory /> History
          </button>
        </div>

        <div className="filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by camera, items, location, or priority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className="sort-button"
            onClick={() => setSortNewest(!sortNewest)}
            title={sortNewest ? "Showing newest first" : "Showing oldest first"}
          >
            <FaSort /> {sortNewest ? "Newest First" : "Oldest First"}
          </button>
        </div>
      </div>

      <div className="requests-container">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>No {activeTab === "active" ? "active" : "completed"} requests found.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((req) => (
              <div key={req.id} className={`request-card priority-${req.priority?.toLowerCase()}`}>
                <div className="request-header">
                  {req.cameraNo === "0" ? (
                    <div className="location-header">
                      <FaMapMarkerAlt className="location-icon" />
                      <h3>{req.location || "Other Location"}</h3>
                    </div>
                  ) : (
                    <h3>Camera {req.cameraNo}</h3>
                  )}
                  <span className={`priority-badge priority-${req.priority?.toLowerCase()}`}>{req.priority}</span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{req.items}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${req.status?.toLowerCase().replace(/\s/g, "-")}`}>
                      {req.status}
                    </span>
                  </div>

                  {req.timestamp && (
                    <div className="detail-row">
                      <span className="detail-label">Requested:</span>
                      <span className="detail-value">{new Date(req.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {activeTab === "active" && (
                  <div className="request-actions">
                    <select
                      value={selectedStatus[req.id] || req.status}
                      onChange={(e) => handleStatusChange(req.id, e)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ready">Ready</option>
                      <option value="On the way">On the way</option>
                      <option value="Received">Received</option>
                    </select>
                    <button className="update-button" onClick={() => handleSubmit(req.id)}>
                      Update
                    </button>
                    {updatedStatus[req.id] && <FaCheck className="success-icon" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

