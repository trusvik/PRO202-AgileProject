import React, {useState} from "react";
import {Link, Navigate, Route, Routes} from "react-router-dom";
import AdminLogin from "./components/adminLogin";
import PinPage from "./components/pinPage"
import Admin from "./components/admin";
import EditPlay from "./components/editPlay";
import UserNamePage from "./components/userNamePage";
import WaitingRoom from "./components/waitingRoom";
import "./app.css";

export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <div id={"page_container"}>
            <nav>
                <h2>
                    <Link to={`/adminLogin/`}>Admin Login</Link>
                    <Link to={`/pinPage/`}>Pin Page</Link>
                    <Link to={`/admin/`}>Admin Page</Link>
                    <Link to={`/userNamePage/`}>Username page</Link>

                </h2>
            </nav>
            <Routes>
                <Route path="/adminLogin/" element={<AdminLogin />} />
                <Route path="/pinPage/" element={<PinPage setIsAuthenticated={setIsAuthenticated}/>} />
                <Route path="/admin/" element={<Admin/>} />
                <Route path="/admin/edit/new" element={<EditPlay />} />
                <Route path="/userNamePage" element={isAuthenticated ? <UserNamePage /> : <Navigate to="/pinPage" />} />
                <Route path="/waitingRoom" element={<WaitingRoom />} />
                <Route path="/" element={<Navigate to="/pinPage" />} />
            </Routes>
        </div>
    );
}
export default App;