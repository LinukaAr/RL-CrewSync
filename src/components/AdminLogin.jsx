import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../assets/styles/AdminLogin.css";
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from useAuth

  //admin authentication
  const handleLogin = async () => {
    try {
      const docRef = doc(db, "admin", "credentials");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const storedUsername = data.username;
        const storedPassword = data.password;

        if (username === storedUsername && password === storedPassword) {
          login(); // Call login function from AuthContext
          navigate("/admin-dashboard");
        } else {
          alert("Invalid credentials");
        }
      } else {
        alert("No admin credentials found in Firestore");
      }
    } catch (error) {
      console.error("Error fetching admin credentials:", error);
      alert("Error fetching admin credentials");
    }
  };

  return (
    <div className="admin-login">
      <a href="/" className="back-button">
        <FaArrowLeft /> 
      </a>
      <div className="login-card">
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default AdminLogin;