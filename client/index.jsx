import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {CookiesProvider} from "react-cookie"
import {App} from "./app";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <CookiesProvider>
    <BrowserRouter>
        <App/>
    </BrowserRouter>
    </CookiesProvider>
);