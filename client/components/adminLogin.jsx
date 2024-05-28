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
            <h1>Admin Konsoll Innlogging</h1>
            <div className="admFloater">
                <div className="inputBox">
                    {/* Controlled input for username */}
                    <input
                        type="text"
                        placeholder="Username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {/* Controlled input for password */}
                    <input
                        type="password"
                        placeholder="Password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {/* Button to trigger login and set cookies */}
                <button id="loginBtn" onClick={handleLogin}>LOG IN</button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default AdminLogin;
