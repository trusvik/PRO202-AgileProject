import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './startPlay.css';
import './startPlay.css';

function StartPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const [code, setCode] = useState('');
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                    navigate('/adminlogin'); // Redirect to /adminlogin if unauthorized.
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to start play');
                }
                const data = await response.json();
                setPlay(data.play); // Set the play name from the fetched data.
                setCode(data.code); // Set the generated code from the server

                // Fetch the scenarios
                const scenariosResponse = await fetch(`/admin/plays/get/${id}`, {
                    credentials: 'include',
                });
                if (!scenariosResponse.ok) {
                    throw new Error('Failed to fetch scenarios');
                }
                const scenariosData = await scenariosResponse.json();
                setScenarios(scenariosData.scenarios); // Set the scenarios from the fetched data

                setLoading(false);
            } catch (error) {
                console.error("Error starting play", error);
                setError('Failed to load play');
                setLoading(false);
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
        const wsUrl = process.env.NODE_ENV === 'production'
            ? 'wss://loading-19800d80be43.herokuapp.com/'
            : `ws://${window.location.hostname}:${window.location.port}`;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'ADMIN_START_GAME' }));
            ws.close();
        };
        navigate('/admin/resultPage'); // Redirect to the result page after sending the WebSocket message
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

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
                {scenarios.map((scenario, index) => (
                    <div key={index} id='parentQuestionElement'>
                        <div id='leftQuestionElement'>
                            <p>{scenario.question}</p>
                        </div>
                        <div id='rightQuestionElement'>
                            <input type="number" id="startPlayInput" placeholder='Set Countdown (Sec)' />
                            <button onClick={handleShowGame}>Show</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default StartPlay;
