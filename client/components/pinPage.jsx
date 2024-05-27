import React, { useState } from "react";
import { useCookies } from "react-cookie";
import './pinPage.css';

const PinPage = () => {

    // Variable for the PIN code
    const [pin, setPin] = useState("");
    const [cookie, setCookie] = useCookies(['userPin']); //initialize cookie

    // Update useState when the user enters the PIN.
    const inputChange = (event) => {
        const { value } = event.target;
        if (/^\d*$/.test(value)) {
            setPin(value);
        }
    };

    // Handle when the user clicks the button (send to DB - compare with PIN?).
    // Set a session cookie if the PIN is valid
    const showPin = () => {
        if (/^\d+$/.test(pin)) { // Ensure the pin is not empty and only consists of digits

            const expires = new Date(); 
            expires.setTime(expires.getTime() + 12 * 60 * 60 * 1000); //Set expiration to 12 hours from now
            setCookie('userPin', pin, {path: '/', expires}); 
            alert(`Pin-kode: ${pin}`);
        } else {
            alert('Vennligst skriv inn en gyldig PIN-kode.');
        }
    }

    return (
        <div className="pinPageBody">
            <div className="pinPageContainer">
                <h1>Skriv inn PIN-koden</h1>

                {/* Input field for entering PIN */}
                <input
                    type="text"
                    className="pinPageInput"
                    value={pin}
                    onChange={inputChange}
                    placeholder="Skriv inn PIN-kode"
                    pattern="\d*"
                />

                {/* Button to submit the PIN */}
                <button className="pinPageButton" onClick={showPin}>Bli med i spillet!</button>
            </div>
        </div>
    );
}

export default PinPage;
