import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import './pinPage.css';

const PinPage = ({ setIsAuthenticated }) => {

    // Variable for the PIN code ja
    const [pin, setPin] = useState("");
    const [cookie, setCookie] = useCookies(['userPin']); //initialize cookie
    const navigate = useNavigate();

    // Update useState when the user enters the PIN.
    const inputChange = (event) => {
        const { value } = event.target;
        if (/^\d*$/.test(value)) {
            setPin(value);
        }
    };

    // Handle when the user clicks the button (send to DB - compare with PIN?).
    // Set a session cookie if the PIN is valid
    const checkPin = () => {
        if (/^\d+$/.test(pin)) { // Ensure the pin is not empty and only consists of digits

            const expires = new Date(); 
            expires.setTime(expires.getTime() + 12 * 60 * 60 * 1000); //Set expiration to 12 hours from now
            setCookie('userPin', pin, {path: '/', expires});
            setIsAuthenticated(true);
            alert(`Pin-kode: ${pin}`);
            navigate("/userNamePage"); // Sends to frontPage until the waiting page is ready.
        } else {
            alert('Vennligst skriv inn en gyldig PIN-kode.');
        }
    }

    // Handles if the user presses Enter
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
