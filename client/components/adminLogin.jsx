import React from "react"; 
import './adminLogin.css'

const AdminLogin = () => {
    const givenUsr = "";
    const givenPwd = "";

    return (
        <div id="admLogMainContainer">
            <h1>Admin Console Log in</h1>
            <div className="admFloater">
                <div className="inputBox">
                    <input type="text" placeholder="Username..."/>
                    <input type="text" placeholder="Password..."/>
                </div>
                <button id="loginBtn">LOGG IN</button>
            </div>

        </div>
    )
}

export default AdminLogin;