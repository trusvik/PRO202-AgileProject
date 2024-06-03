import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './pinPage.css';

const PinPage = ({ setIsAuthenticated }) => {
    const [pin, setPin] = useState("");
    const navigate = useNavigate();

    // Update the PIN-state when the user enters the PIN.
    const inputChange = (event) => {
        const { value } = event.target;
        // Allow only numeric values
        if (/^\d*$/.test(value)) {
            setPin(value);
        }
    };

    // Handle the PIN submission. If the PIN is valid, set authentication and navigate to the username page.
    const checkPin = () => {
        // Ensure the pin is not empty and only consists of digits.
        if (/^\d+$/.test(pin)) {
            setIsAuthenticated(true);
            alert(`Pin-kode: ${pin}`);
            navigate("/userNamePage");
        } else {
            // Alert the user if the PIN is invalid.
            alert('Vennligst skriv inn en gyldig PIN-kode.');
        }
    }

    // Check if the entered PIN is valid when Enter is pressed.
    const checkEnter = (event) => {
        if (event.key === 'Enter') {
            checkPin();
        }
    }

    return (
        <div className="pinPageBody">
            <div className="pinPageContainer">
                <h1 id="logo">LOADING...</h1>

                {/* Input field for entering PIN */}
                <input
                    type="text"
                    className="pinPageInput"
                    value={pin}
                    onChange={inputChange}
                    onKeyDown={checkEnter}
                    placeholder="PIN-kode ..."
                    pattern="\d*"
                />

                {/* Button to submit the PIN */}
                <button className="pinPageButton" onClick={checkPin}>Bli med i spillet!</button>
            </div>
        </div>
    );
}

export default PinPage;
