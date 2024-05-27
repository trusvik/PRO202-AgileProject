import React, {useState} from "react";
import './adminLogin.css'

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage("Login successful!");
            // Redirect to admin dashboard or another page
        } else {
            setMessage(data.error || "Login failed");
        }
    };

    return (
        <div id="admLogMainContainer">
            <h1>Admin Console Log in</h1>
            <div className="admFloater">
                <div className="inputBox">
                    <input
                        type="text"
                        placeholder="Username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button id="loginBtn" onClick={handleLogin}>LOGG IN</button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};
export default AdminLogin;