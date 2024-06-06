import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import './pinPage.css';

const PinPage = ({ setIsAuthenticated }) => {
    const [pin, setPin] = useState("");
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
                    if (data.valid) {
                        setIsAuthenticated(true);
                        navigate("/waitingRoom");
                    }
                } else {
                    console.log("User token verification failed.");
                }
            } catch (error) {
                console.error("User token verification error:", error);
            }
        };

        verifyToken();
    }, [navigate, setIsAuthenticated]);

    const inputChange = (event) => {
        const { value } = event.target;
        if (/^\d*$/.test(value)) {
            setPin(value);
        }
    };

    const checkPin = async () => {
        if (/^\d+$/.test(pin)) {
            try {
                const response = await fetch('/verify-pin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ pin }),
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                    navigate("/userNamePage");
                } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to verify PIN');
                }
            } catch (error) {
                console.error('Error verifying PIN:', error);
                alert('An error occurred. Please try again.');
            }
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
