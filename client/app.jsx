import React from "react";
import { Link, Route, Routes} from "react-router-dom";
import FrontPage from "./components/frontPage";
import ProductPage from "./components/productPage";
import AboutPage from "./components/aboutPage";
import "./app.css";

export function App() {
    return (
        <div id={"page_container"}>
            <nav>
                <h2>
                    <Link to={`/frontPage/`}>Home</Link>
                    <Link to={`/productPage/`}>Products</Link>
                    <Link to={`/aboutPage/`}>About</Link>
                </h2>
            </nav>
            <Routes>
                <Route path="/frontPage/" element={<FrontPage />} />
                <Route path="/productPage/" element={<ProductPage />} />
                <Route path="/aboutPage/" element={<AboutPage />} />
            </Routes>
        </div>
    );
}
export default App;