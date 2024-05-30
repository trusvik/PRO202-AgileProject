import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './waitingRoom.css';

const WaitingRoom = () => {
    const [nameList, setNameList] = useState([]);
    const [showWaitingMessage, setShowWaitingMessage] = useState(true);
    const navigate = useNavigate();
    let ws;

    const connectWebSocket = () => {
        ws = new WebSocket('ws://loading-19800d80be43.herokuapp.com');

        ws.onopen = () => {
            console.log('WebSocket connected');
            const storedNames = JSON.parse(sessionStorage.getItem("names"));
            ws.send(JSON.stringify({ type: 'JOIN_ROOM', names: storedNames }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Message from server:', data);
                if (data.type === 'UPDATE_NAMES') {
                    setNameList(data.names);
                }
            } catch (e) {
                console.log('Received non-JSON message:', event.data);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after a delay
            setTimeout(() => {
                console.log('Reconnecting...');
                connectWebSocket();
            }, 3000);
        };
    };

    useEffect(() => {
        const storedNames = JSON.parse(sessionStorage.getItem("names"));
        if (storedNames && storedNames.length > 0) {
            setNameList(storedNames);
        } else {
            navigate('/userNamePage');
        }

        const timer = setTimeout(() => {
            setShowWaitingMessage(false);
        }, 5000);

        connectWebSocket(); // Initialize WebSocket connection

        return () => {
            clearTimeout(timer);
            if (ws) ws.close();
        };
    }, [navigate]);

    return (
        <div className="waitingBody">
            <div className="roomContainer">
                <h1>Venterom</h1>
                {showWaitingMessage ? (
                    <div className="statusMessage">
                        <p>Spillet starter straks. Vennligst vent...</p>
                    </div>
                ) : (
                    <div className="statusMessage">
                        <p>Venter på flere spillere...</p>
                    </div>
                )}
                <div className="nameList">
                    {nameList.map((name, index) => (
                        <div key={index} className="displayName">{name}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
