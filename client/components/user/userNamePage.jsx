import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './userNamePage.css';

const UserNamePage = ({ setIsUserNameEntered }) => {
    const [name, setName] = useState("");
    const navigate = useNavigate();


    // Updates the name state when the input value changes.
    const handleInputChange = (event) => {
        setName(event.target.value);
    };


    // Function to handle the name submission.
    const setNameButton = () => {

        const trimmedName = name.trim();

        // Validates that the name is not empty.
        if (trimmedName === "") {
            alert("Vennligst skriv inn navnet ditt");
            return;
        }

        // Validates that the name is not too long (exceeding 25 characters).
        if (trimmedName.length > 25) {
            alert("Navnet er for langt");
            return;
        }

        // Validates that the name only contains allowed characters (letters, numbers, and spaces).
        const nameRegex = /^[a-zA-ZæøåÆØÅ0-9\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            alert("Nanvet kan kun inneholde bokstaver og mellomrom");
            return;
        }

        // Retrieves existing names from sessionStorage and adds the new name.
        const storedNames = JSON.parse(sessionStorage.getItem("names"))|| [];
        const updatedNames = [...storedNames, name];
        sessionStorage.setItem("names", JSON.stringify(updatedNames)); // Stores the names in sessionStorage.
        setName("");
        setIsUserNameEntered(true);
        navigate('/waitingRoom'); // User gets sent to /waitingRoom.
    };

    // Function that allows the user to also press enter after typing their name in the input field
    const handleKeyPress = (event) => {
        if(event.key === "Enter") {
            setNameButton();
        }
    }


    return (
        <div className="mainBody">
            <div className="pageContainer">
                <h1 className="pageLogo">Loading...</h1>
                <h2>Skriv inn navnet ditt</h2>
                <input
                    className="inputBox"
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Navn..."
                />
                <button className="enterNameBtn" type="submit" onClick={setNameButton}>OK</button>
            </div>
        </div>    
    );
};

export default UserNamePage;
