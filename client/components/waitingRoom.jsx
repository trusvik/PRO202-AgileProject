import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const WaitingRoom = () => {

    const [nameList, setNameList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedNames = JSON.parse(sessionStorage.getItem("names")); // Henter navn fra sessionStorage
        if(storedNames && storedNames.length > 0) {
            setNameList(storedNames);
        } else {
            navigate('/userNamePage');
        }
        
    }, [navigate]);


    return (
        <div className="waitingBody">
            <div className="roomContainer">
            <h1>Venterom:</h1>
            <div className="nameList">
            {nameList.map((name, index) => (
                 <div key={index} className="displayName">{name}</div> //Viser hvert navn i nameList
              ))}
            </div>
            </div>
        </div>
    );
};
export default WaitingRoom;
