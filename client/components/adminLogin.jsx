import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './adminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const [showSettings, setShowSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/verify-token', {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies are sent with the request
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Token verified successfully:", data);
                    setMessage(`Welcome back, ${data.username}`);
                    navigate("/admin");
                } else {
                    console.log("Token verification failed.");
                }
            } catch (error) {
                console.error("Token verification error:", error);
            }
        };
        verifyToken();
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures cookies are sent with the request
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                console.log("Login successful. Redirecting to /admin.");
                setMessage("Login successful!");
                setUsername("");
                setPassword("");
                navigate("/admin");
            } else {
                const data = await response.json();
                console.log("Login failed with message:", data.error);
                setMessage(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("An error occurred. Please try again.");
        }
    };


    const handleChangePassword = async () => {
        console.log("Passord endring");
    }

    return (
        <div id="admLogMainContainer">
            <h1 id="logo">Loading..</h1>
            <h3 id="adminLogin">Admin login</h3>
            <form className="admFloater" onSubmit={handleLogin}>
                <div className="inputBox">
                    <input
                        id="adminUsername"
                        type="text"
                        placeholder="Username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        id="adminPassword"
                        type="password"
                        placeholder="Password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button id="loginBtn" type="submit">LOGIN</button>
                <div id="adminMessage">
                    {message && <p id="adminPTagMessage">{message}</p>}
                </div>
            </form>
            
            
            <button id="settingsBtn" onClick={() => setShowSettings(true)}>Innstillinger</button>
            {showSettings && (
                <div className="settingsPopup">
                    <div className="settingsContent">
                        <h3>Innstillinger</h3>
                        <button className="closeBtn" onClick={() => setShowSettings(false)}>Lukk</button>
                        <div className="settingOption">
                            <button className="changePasswordBtn" onClick={() => setShowChangePassword(true)}>Endre passord</button>
                        </div>
                        
                    </div>
                </div>
            )}

            
            {showChangePassword && (
                <div className="changePasswordPopup">
                    <div className="changePasswordContainer">
                        <h3>Bytt passord</h3>
                        <input
                            type="password"
                            placeholder="Nytt passord"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        >
                         </input>

                         <input
                            type="password"
                            placeholder="Gjenta passord"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value) }
                             ></input>

                             <button onClick={handleChangePassword}>Bekreft</button>
                             <button className="closeBtn" onClick={() => setShowChangePassword(false)}>Lukk</button>
                        
                    </div>
                </div>
            )}
            {message && <div id="adminMessage">{message}</div>}
            

        </div>
    );
}

export default AdminLogin;
