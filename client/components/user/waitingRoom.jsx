import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './waitingRoom.css';

const WaitingRoom = () => {
    const [nameList, setNameList] = useState([]);
    const [showWaitingMessage, setShowWaitingMessage] = useState(true);
    const navigate = useNavigate();
    let ws;

    // Function to establish a WebSocket-connection.
    const connectWebSocket = () => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsHost = window.location.hostname;
        const wsPort = window.location.port ? `:${window.location.port}` : '';
        const wsUrl = `${wsProtocol}://${wsHost}${wsPort}`;
        ws = new WebSocket(wsUrl);

        // Event handler for WebSocket-connection open event.
        ws.onopen = () => {
            console.log('WebSocket connected');
            const storedNames = JSON.parse(sessionStorage.getItem("names"));
            ws.send(JSON.stringify({ type: 'JOIN_ROOM', names: storedNames }));
        };

        // Event handler for WebSocket message event.
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Message from server:', data);
                if (data.type === 'UPDATE_NAMES') {
                    setNameList(data.names);
                    // The else if statement will in the future redirect the user to the game lobby when it's ready
                }  else if (data.type === 'LOBBY_READY') {
                navigate('/lobby');
            }
            } catch (e) {
                console.log('Received non-JSON message:', event.data);
            }
        };

        // Event handler for WebSocket close event.
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

        // Cleanup function to clear timer and close WebSocket.
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
