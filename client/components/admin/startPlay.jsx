import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './startPlay.css';

function StartPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    let ws;

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                const response = await fetch(`/admin/plays/start/${id}`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (response.status === 401) {
                    console.error("Unauthorized");
                    navigate('/adminlogin');
                    return;
                } else if (response.status !== 200) {
                    throw new Error('Failed to start play');
                }
                const data = await response.json();
                setPlay(data.play);
                setCode(data.code);
            } catch (error) {
                console.error("Error starting play", error);
            }
        };
        fetchPlay();

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsHost = window.location.hostname;
        const wsPort = window.location.port ? `:${window.location.port}` : '';
        const wsUrl = `${wsProtocol}://${wsHost}${wsPort}`;
        ws = new WebSocket(wsUrl);

        return () => {
            if (ws) ws.close();
        };
    }, [id, navigate]);

    const handleShowGame = () => {
        const ws = new WebSocket(`ws://${window.location.host}`);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'ADMIN_START_GAME' }));
            ws.close();
        };
    };

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Play: {play}</h1>
                    <h3 id="logo">Pin: {code}</h3>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <div id='sectionHolderParent'>
                <div>
                    <p>{play}</p>
                </div>
                <div id='parentQuestionElement'>
                    <div id='leftQuestionElement'>
                        <p>QUESTION HERE</p>
                    </div>
                    <div id='rightQuestionElement'>
                        <input type="number" id="startPlayInput" placeholder='Set Countdown (Sec)' />
                        <button onClick={handleShowGame}>Show</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StartPlay;
