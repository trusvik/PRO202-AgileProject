import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './userNamePage.css';

const UserNamePage = ({ setIsUserNameEntered }) => {
    const [name, setName] = useState("");
    const navigate = useNavigate();


    const handleInputChange = (event) => {
        setName(event.target.value);
    };


    // Funksjonen for å skrive inn navn
    const setNameButton = () => {

        const trimmedName = name.trim();

        if (trimmedName === "") {
            alert("Vennligst skriv inn navnet ditt");
            return;
        }

        if (trimmedName.length > 50) {
            alert("Navnet er for langt");
            return;
        }

        const nameRegex = /^[a-zA-ZæøåÆØÅ0-9\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            alert("Nanvet kan kun inneholde bokstaver of mellomrom");
            return;
        }

        const storedNames = JSON.parse(sessionStorage.getItem("names"))|| [];
        const updatedNames = [...storedNames, name];
        sessionStorage.setItem("names", JSON.stringify(updatedNames)); // Lagre navnene i sessionStorage
        setName("");
        setIsUserNameEntered(true);
        navigate('/waitingRoom'); // Bruker vil bli sendt til venterommet etter å skrevet inn navn
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
