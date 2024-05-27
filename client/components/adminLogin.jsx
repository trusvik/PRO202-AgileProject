import React, {useState} from "react";
import { useCookies } from "react-cookie"; 
import './adminLogin.css'

const AdminLogin = () => {
    //state to manage user input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    //useCookies hook for managing cookies
    const [cookies, setCookie] = useCookies(['Admin']); //initialize cookie 

    const handleLogin = () => {
        setCookie('username', username, {path: '/' });
        setCookie('password', password, {path: '/' });

        console.log('Logged in with user: ', username);
    }

    return (
        <div id="admLogMainContainer">
            <h1>Admin Console Log in</h1>
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
            </div>
        </div>
    );
}

export default AdminLogin;