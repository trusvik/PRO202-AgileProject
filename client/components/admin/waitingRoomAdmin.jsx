import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WaitingRoomAdmin = () => {
    const { playId } = useParams();
    const navigate = useNavigate();
    const ws = useRef(null);

    const connectWebSocket = () => {
        const wsUrl = process.env.NODE_ENV === 'production'
            ? 'wss://loading-19800d80be43.herokuapp.com/'
            : `ws://${window.location.hostname}:${window.location.port}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            ws.current.send(JSON.stringify({ type: 'ADMIN_WAITING_ROOM', playId }));
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Message from server:', data);
                if (data.type === 'REDIRECT_TO_PLAY' && data.playId === playId) {
                    const url = `/admin/resultPage/${data.playId}/${data.scenarioId}`;
                    console.log('Redirecting to results page...', url);
                    navigate(url);
                }
            } catch (e) {
                console.error('Error parsing message', e);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => {
                console.log('Reconnecting...');
                connectWebSocket();
            }, 3000);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error', error);
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [playId, navigate]);

    return (
        <div className="waitingBody">
            <div className="roomContainer">
                <h1>Venterom</h1>
                <div className="statusMessage">
                    <p>Venter på resultater...</p>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoomAdmin;
