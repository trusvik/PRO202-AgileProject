import React from "react";
import { Link, Route, Routes} from "react-router-dom";
import AdminLogin from "./components/adminLogin";
import PinPage from "./components/pinPage"
import Admin from "./components/admin";
import EditPlay from "./components/editPlay";
import UserNamePage from "./components/userNamePage";
import WaitingRoom from "./components/waitingRoom";
import "./app.css";

export function App() {
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
                <Route path="/pinPage/" element={<PinPage/>} />
                <Route path="/admin/" element={<Admin/>} />
                <Route path="/admin/edit/new" element={<EditPlay />} />
                <Route path="/userNamePage" element={<UserNamePage />} />
                <Route path="/waitingRoom" element={<WaitingRoom />} />

            </Routes>
        </div>
    );
}
export default App;