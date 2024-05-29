import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './waitingRoom.css';


const WaitingRoom = () => {

    const [nameList, setNameList] = useState([]);
    const [showWaitingMessage, setShowWaitingMessage] = useState(true);
    const navigate = useNavigate();
    

    useEffect(() => {
        const storedNames = JSON.parse(sessionStorage.getItem("names")); // Henter navn fra sessionStorage
        if(storedNames && storedNames.length > 0) {
            setNameList(storedNames);
        } else {
            navigate('/userNamePage');
        }

        const timer = setTimeout(() => {
            setShowWaitingMessage(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);
    
    

    return (
        <div className="waitingBody">
            <div className="roomContainer">
                <h1>Venterom</h1>
                {showWaitingMessage ? ( // Vis ventemelding hvis showWaitingMessage er true
                    <div className="statusMessage">
                        <p>Spillet starter straks. Vennligst vent...</p>
                    </div>
                ) : ( // Ellers vis ekstra melding
                    <div className="statusMessage">
                        <p>Venter på flere spillere...</p>
                    </div>
                )}
                <div className="nameList">
                    {nameList.map((name, index) => (
                        <div key={index} className="displayName">{name}</div> // Viser hvert navn i nameList
                    ))}
                </div>
            </div>
        </div>
    );    
};

export default WaitingRoom;
