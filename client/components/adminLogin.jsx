import React, { useState } from "react";
import { useCookies } from "react-cookie";
import './adminLogin.css';

const AdminLogin = () => {
    // State to manage user input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // useCookies hook for managing cookies
    const [cookies, setCookie] = useCookies(['username']); // Initialize cookie

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store username or authentication token in cookies
                setCookie('username', username, { path: '/' });

                setMessage("Login successful!");
                console.log('Logged in with user: ', username);
                // Redirect or take other actions after successful login
            } else {
                setMessage(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div id="admLogMainContainer">
            <h1 id="logo">Loading..</h1>
            <h3 id="adminLogin">Admin login</h3>
            <div className="admFloater">
                <div className="inputBox">
                    {/* Controlled input for username */}
                    <input
                        id="adminUsername"
                        type="text"
                        placeholder="Username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {/* Controlled input for password */}
                    <input
                        id="adminPassword"
                        type="password"
                        placeholder="Password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {/* Button to trigger login and set cookies */}
                <button id="loginBtn" onClick={handleLogin}>LOGIN</button>
                <div id="adminMessage">
                    {message && <p id="adminPTagMessage">{message}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
