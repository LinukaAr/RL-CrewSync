"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUserShield, FaCamera, FaChevronRight } from "react-icons/fa"
import "../assets/styles/MainLogin.css"
import logo from "../assets/images/RL-logo.png"

const MainLogin = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState("")
  const modalRef = useRef(null)
  const navigate = useNavigate()

  const handleCameraCrewClick = () => {
    setShowModal(true)
  }

  //close modal when clicked outside
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false)
    }
  }

  //handle camera selection
  const handleCameraSelect = () => {
    if (selectedCamera) {
      setShowModal(false)
      navigate(`/request-form?cameraNo=${selectedCamera}`)
    }
  }

  //add event listener when modal is shown
  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal])

  return (
    <div className="main-login">
      <div className="login-container">
        <div className="logo-container">
          <img src={logo || "/placeholder.svg"} alt="RL CrewSync Logo" className="logo" />
          <h1>RL CrewSync</h1>
        </div>

        <div className="login-options">
          <div className="login-option camera-option" onClick={handleCameraCrewClick}>
            <div className="option-icon">
              <FaCamera />
            </div>
            <h3>Camera Crew</h3>
          </div>

          <Link to="/admin-login" className="login-option admin-option">
            <div className="option-icon">
              <FaUserShield />
            </div>
            <h3>Admin Login</h3>
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <h2>Select Camera</h2>
            <div className="select-wrapper">
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="camera-select"
              >
                <option value="">Select Camera</option>
                <option value="1">Camera 1</option>
                <option value="2">Camera 2</option>
                <option value="3">Camera 3</option>
                <option value="4">Camera 4</option>
                <option value="5">Camera 5</option>
                <option value="6">Camera 6</option>
                <option value="7">Camera 7</option>
                <option value="8">Camera 8</option>
                <option value="0">Other</option>
              </select>
            </div>
            <button
              onClick={handleCameraSelect}
              className={`next-button ${!selectedCamera ? "disabled" : ""}`}
              disabled={!selectedCamera}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLogin

