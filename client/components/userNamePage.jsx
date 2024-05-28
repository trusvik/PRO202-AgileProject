import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './userNamePage.css';

const UserNamePage = () => {
    const [name, setName] = useState("");
    const navigate = useNavigate();


    const handleInputChange = (event) => {
        setName(event.target.value);
    };

    const setNameButton = () => {
        if (name.trim() !== "") {
            const storedNames = JSON.parse(sessionStorage.getItem("names"))|| [];
            const updatedNames = [...storedNames, name];
            sessionStorage.setItem("names", JSON.stringify(updatedNames));
            setName(""); // Clear the input field
            navigate('/waitingRoom'); // Navigate to the waiting room
        } else {
            alert("Vennligst skriv inn navnet ditt først");
        }
    };

    return (
        <div className="mainBody">
            <div className="pageContainer">
                <h1>Skriv inn navnet ditt</h1>
                <input
                    className="inputBox"
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                    placeholder="Skriv inn navnet ditt her"
                />
                <button className="onClickBtn" onClick={setNameButton}>OK</button>
            </div>
        </div>
    );
};

export default UserNamePage;
