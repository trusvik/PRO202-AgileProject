import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import './userNamePage.css';

const UserNamePage = ({ setIsUserNameEntered }) => {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    // Oppdaterer navn-tilstanden når inputverdien endres.
    const handleInputChange = (event) => {
        setName(event.target.value);
    };

    // Funksjon for å håndtere navneinnsending.
    const setNameButton = () => {
        const trimmedName = name.trim();

        // Validerer at navnet ikke er tomt.
        if (trimmedName === "") {
            alert("Vennligst skriv inn navnet ditt");
            return;
        }

        // Validerer at navnet ikke er for langt (over 25 tegn).
        if (trimmedName.length > 25) {
            alert("Navnet er for langt");
            return;
        }

        // Validerer at navnet kun inneholder tillatte tegn (bokstaver, tall og mellomrom).
        const nameRegex = /^[a-zA-ZæøåÆØÅ0-9\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            alert("Navnet kan kun inneholde bokstaver og mellomrom");
            return;
        }

        // Henter eksisterende navn fra sessionStorage og legger til det nye navnet.
        const storedNames = JSON.parse(sessionStorage.getItem("names")) || [];
        const updatedNames = [...storedNames, name];
        sessionStorage.setItem("names", JSON.stringify(updatedNames)); // Lagrer navnene i sessionStorage.
        setName("");
        setIsUserNameEntered(true);
        navigate('/waitingRoom'); // Brukeren blir sendt til /waitingRoom.
    };

    // Funksjon som lar brukeren trykke Enter etter å ha skrevet inn navnet sitt i inputfeltet
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            setNameButton();
        }
    }

    return (
        <div className="mainBody">
            <Helmet>
                <meta 
                    name="viewport" 
                    content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" 
                />
            </Helmet>
            <div className="pageContainer">
                <h1 className="pageLogo">Loading...</h1>
                <input
                    className="inputBox"
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Skriv inn ditt navn"
                />
                <button className="enterNameBtn" type="submit" onClick={setNameButton}>Hopp i venterommet</button>
            </div>
        </div>
    );
};

export default UserNamePage;
