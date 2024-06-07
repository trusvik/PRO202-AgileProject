import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './startPlay.css';

function StartPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const [code, setCode] = useState('');
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [theIndex, setTheIndex] = useState(0);
    const navigate = useNavigate();
    let ws;

    useEffect(() => {
        if (localStorage.getItem('nextStageIndex')) {
            let nxtStg = localStorage.getItem('nextStageIndex');
            if (nxtStg < 0) {
                navigate('/admin/reset')
            }
            setTheIndex(nxtStg);
            console.log("The index gotten at Startplay is ", nxtStg);
        }
    }, [navigate]);

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

    const handleShowGame = (scenarioId) => {
        const countdown = document.getElementById("startPlayInput").value;
        localStorage.setItem('countdown', countdown);

        const wsUrl = process.env.NODE_ENV === 'production'
            ? 'wss://loading-19800d80be43.herokuapp.com/'
            : `ws://${window.location.hostname}:${window.location.port}`;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            console.log('Sending ADMIN_START_GAME message...');
            ws.send(JSON.stringify({ type: 'ADMIN_START_GAME', playId: id, scenarioId, countdown })); // Include countdown
            ws.send(JSON.stringify({ type: 'REDIRECT_TO_PLAY', playId: id, scenarioId, countdown })); // Notify waiting admins
            ws.close();
        };
        navigate(`/admin/resultPage/${id}/${scenarioId}`); // Pass play and scenario IDs to the result page
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <header id="containerHeaderStartPlay">
                <div className="flexContainerLeftStartPlay">
                    <h1 id='logo'>Play: {play}</h1>
                </div>
                <div className='flexContainerMiddleStartPlay'>
                    <h1 id="logoStartPlay">Pin: {code}</h1>
                </div>
                <div className="flexContainerRightStartPlay">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <div id='sectionHolderParent'>
                <div>
                    <p>{play}</p>
                </div>
                {scenarios[theIndex] && (
                    <div key={theIndex} id='parentQuestionElement'>
                        <div id='leftQuestionElement'>
                            <p>{scenarios[theIndex].question}</p>
                        </div>
                        <div id='rightQuestionElement'>
                            <input type="number" id="startPlayInput" placeholder='Set Countdown (Sec)' min={0}/>
                            <button onClick={() => handleShowGame(scenarios[theIndex].scenario_id)}>Show</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default StartPlay;
