import React from "react";
import { Link, Route, Routes} from "react-router-dom";
import FrontPage from "./components/frontPage";
import ProductPage from "./components/productPage";
import AboutPage from "./components/aboutPage";
import AdminLogin from "./components/adminLogin";
import PinPage from "./components/pinPage"
import Admin from "./components/admin";
import "./app.css";

export function App() {
    return (
        <div id={"page_container"}>
            <nav>
                <h2>
                    <Link to={`/frontPage/`}>Home</Link>
                    <Link to={`/productPage/`}>Products</Link>
                    <Link to={`/aboutPage/`}>About</Link>
                    <Link to={`/adminLogin/`}>Admin Login</Link>
                    <Link to={`/pinPage/`}>Pin Page</Link>
                    <Link to={`/admin/`}>Admin Page</Link>

                </h2>
            </nav>
            <Routes>
                <Route path="/frontPage/" element={<FrontPage />} />
                <Route path="/productPage/" element={<ProductPage />} />
                <Route path="/aboutPage/" element={<AboutPage />} />
                <Route path="/adminLogin/" element={<AdminLogin />} />
                <Route path="/pinPage/" element={<PinPage/>} />
                <Route path="/admin/" element={<Admin/>} />
            </Routes>
        </div>
    );
}
export default App;