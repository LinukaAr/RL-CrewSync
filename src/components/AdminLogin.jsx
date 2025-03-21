"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUser, FaLock, FaUserShield } from "react-icons/fa"
import "../assets/styles/AdminLogin.css"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext" // Import useAuth

function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth() // Destructure login from useAuth

  //admin authentication
  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const docRef = doc(db, "admin", "credentials")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const storedUsername = data.username
        const storedPassword = data.password

        if (username === storedUsername && password === storedPassword) {
          login() // Call login function from AuthContext
          navigate("/admin-dashboard")
        } else {
          setError("Invalid username or password")
        }
      } else {
        setError("No admin credentials found")
      }
    } catch (error) {
      console.error("Error fetching admin credentials:", error)
      setError("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-wrapper">
        <button onClick={() => navigate("/")} className="back-button">
          <FaArrowLeft />
        </button>

        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <FaUserShield />
            </div>
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the admin dashboard</p>
          </div>

          <div className="login-form">
            <div className="input-group">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="login-button" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

