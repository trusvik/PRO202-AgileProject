import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import './adminLogin.css';

const AdminLogin = () => {
    // State to manage user input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // useCookies hook for managing cookies
    const [cookies, setCookie] = useCookies(['token']); // Initialize cookie

    useEffect(() => {
        if (cookies.token) {
            const decodedToken = parseJwt(cookies.token);
            if (decodedToken) {
                setMessage()
                setMessage(`Welcome back, ${decodedToken.username}`);
            }
        }
    }, [cookies]);

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
    
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
                setCookie('toen', data.token, { path: '/'});

                setMessage("Login successful!");
                setUsername("");
                setPassword("");
                console.log('Logged in with user: ', username);
                console.log('Token', data.token);
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
            <form className="admFloater" onSubmit={handleLogin}>
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
            </form>
        </div>
    );
}

export default AdminLogin;
