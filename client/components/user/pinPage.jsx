import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import './pinPage.css';

const PinPage = ({ setIsAuthenticated }) => {
    const [pin, setPin] = useState("");
    const navigate = useNavigate();

    const inputChange = (event) => {
        const { value } = event.target;
        if (/^\d*$/.test(value)) {
            setPin(value);
        }
    };

    const checkPin = () => {
        if (/^\d+$/.test(pin)) {
            setIsAuthenticated(true);
            alert(`Pin-kode: ${pin}`);
            navigate("/userNamePage");
        } else {
            alert('Vennligst skriv inn en gyldig PIN-kode.');
        }
    }

    const checkEnter = (event) => {
        if (event.key === 'Enter') {
            checkPin();
        }
    }

    return (
        <div className="pinPageBody">
            <Helmet>
                <meta 
                    name="viewport" 
                    content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" 
                />
            </Helmet>
            <div className="pinPageContainer">
                <h1 className="pageLogo">LOADING...</h1>
                <input
                    type="text"
                    className="pinPageInput"
                    value={pin}
                    onChange={inputChange}
                    onKeyDown={checkEnter}
                    placeholder="Skriv inn PIN-kode"
                    pattern="\d*"
                />
                <button className="pinPageButton" onClick={checkPin}>Bli med i spillet!</button>
            </div>
        </div>
    );
}

export default PinPage;
