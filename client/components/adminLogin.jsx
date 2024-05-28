import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import './adminLogin.css';

const AdminLogin = () => {
    // State to manage user input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isTokenValid, setIsTokenValid] = useState(false);

    // useCookies hook for managing cookies
    const [cookies, setCookie, removeCookie] = useCookies(['token']); // Initialize cookie
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            console.log("Verifying token");
            if (cookies.token) {
                try {
                    const response = await fetch('http://localhost:3000/verify-token', {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setMessage(`Welcome back, ${data.username}`);
                        setIsTokenValid(true);
                        navigate("/admin");
                    } else {
                        removeCookie('token');
                    }
                } catch (error) {
                console.error("token verification error:", error);
                removeCookie('token');
                }
            }
        };
        verifyToken();

    }, [cookies, removeCookie, navigate]);


    
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store username or authentication token in cookies
                setCookie('token', data.token, { path: '/'});

                setMessage("Login successful!");
                setUsername("");
                setPassword("");
                console.log('Logged in with user: ', username);
                console.log('Token', data.token);
                setIsTokenValid(true);
                navigate("/admin");
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
            <form className="admFloater" onSubmit={handleLogin}>
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
            </form>
        </div>
    );
}

export default AdminLogin;
