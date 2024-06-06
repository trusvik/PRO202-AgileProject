import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './userNamePage.css';

const UserNamePage = ({ setIsUserNameEntered }) => {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch('/verify-user-token', {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies are sent with the request
                });

                if (response.ok) {
                    const data = await response.json();
                    if (!data.valid) {
                        navigate("/pinPage");
                    }
                } else {
                    console.log("User token verification failed.");
                    navigate("/pinPage");
                }
            } catch (error) {
                console.error("User token verification error:", error);
                navigate("/pinPage");
            }
        };

        verifyToken();

        // Add an event listener for when the user comes back to the tab
        window.addEventListener('focus', verifyToken);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('focus', verifyToken);
        };
    }, [navigate]);

    const handleInputChange = (event) => {
        setName(event.target.value);
    };

    const setNameButton = () => {
        const trimmedName = name.trim();

        if (trimmedName === "") {
            alert("Vennligst skriv inn navnet ditt");
            return;
        }

        if (trimmedName.length > 25) {
            alert("Navnet er for langt");
            return;
        }

        const nameRegex = /^[a-zA-ZæøåÆØÅ0-9\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            alert("Navnet kan kun inneholde bokstaver og mellomrom");
            return;
        }

        const storedNames = JSON.parse(sessionStorage.getItem("names")) || [];
        const updatedNames = [...storedNames, name];
        sessionStorage.setItem("names", JSON.stringify(updatedNames));
        setName("");
        setIsUserNameEntered(true);
        navigate('/waitingRoom');
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            setNameButton();
        }
    };

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
