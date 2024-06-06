import React, {useState} from "react";
import {Link, Navigate, Route, Routes} from "react-router-dom";
import AdminLogin from "./components/admin/adminLogin";
import PinPage from "./components/user/pinPage"
import Admin from "./components/admin/admin";
import UserNamePage from "./components/user/userNamePage";
import WaitingRoom from "./components/user/waitingRoom";
import CreateNew from "./components/admin/createNew";
import EditPlay from "./components/admin/editPlay";
import StartPlay from "./components/admin/startPlay";
import UserResultPage from "./components/user/resultPage";
import "./app.css";
import Play from "./components/user/play";
import ResultPage from './components/admin/resultPage';



export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUserNameEntered, setIsUsernameEntered] = useState(false);

    return (
        <div id={"page_container"}>
            <nav>
                <Link to={`/adminLogin/`}>Admin Login</Link>
                <Link to={`/pinPage/`}>Pin Page</Link>
                <Link to={`/admin/`}>Admin Page</Link>
                <Link to={`/userNamePage/`}>Username page</Link>

            </nav>
            <Routes>
                <Route path="/adminLogin/" element={<AdminLogin />} />
                <Route path="/pinPage/" element={<PinPage setIsAuthenticated={setIsAuthenticated}/>} />
                <Route path="/admin/" element={<Admin/>} />
                <Route path="/admin/plays/new" element={<CreateNew />} />
                <Route path="/userNamePage" element={isAuthenticated ? <UserNamePage setIsUserNameEntered={setIsUsernameEntered}/> : <Navigate to="/pinPage" />} />
                <Route path="/waitingRoom" element={isUserNameEntered ? <WaitingRoom /> : <Navigate to="/userNamePage" />} />
                <Route path="/" element={<Navigate to="/pinPage" />} />
                <Route path="/admin/plays/edit/:id" element={<EditPlay />} />
                <Route path="/admin/plays/start/:id" element={<StartPlay />} />
                <Route path="/resultPage/" element={<UserResultPage />} />
                <Route path="/play/" element={<Play />} />
                <Route path="/admin/resultPage" element={<ResultPage />} />
                <Route path="/admin/resultPage/:playId/:scenarioId" element={<ResultPage />} />
                <Route path="/play/:playId/:scenarioId" element={<Play />} />
            </Routes>
        </div>
    );
}
export default App;