import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import './adminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            console.log(cookies);

            if (cookies.token) {
                console.log("Token found in cookies:", cookies.token);
                try {
                    const response = await fetch('http://localhost:3000/verify-token', {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log("Token verified successfully:", data);
                        setMessage(`Welcome back, ${data.username}`);
                        navigate("/admin");
                    } else {
                        console.log("Token verification failed. Removing token.");
                        removeCookie('token', { path: '/' });
                    }
                } catch (error) {
                    console.error("Token verification error:", error);
                    removeCookie('token', { path: '/' });
                }
            } else {
                console.log("No token found in cookies.");
            }
        };
        verifyToken();
    }, [cookies.token, removeCookie, navigate]);

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
                console.log("Login successful. Setting cookie with token:", data.token);
                setCookie('token', data.token, { path: '/' });
                setMessage("Login successful!");
                setUsername("");
                setPassword("");
                navigate("/admin");
            } else {
                console.log("Login failed with message:", data.error);
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
        </div>
    );
}

export default AdminLogin;
