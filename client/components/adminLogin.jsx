import React from "react"; 
import './adminLogin.css'

const AdminLogin = () => {
    const givenUsr = "";
    const givenPwd = "";

    return (
        <div id="admLogMainContainer">
            <div className="admFloater">
                <div className="inputBox">
                    <input type="text" placeholder="Password..."/>
                    <button>TEST</button>
                </div>
                <div className="inputBox">
                    <input type="text" placeholder="Username..."/>
                    <button>TEST</button>
                </div>
            </div>

        </div>
    )
}

export default AdminLogin;