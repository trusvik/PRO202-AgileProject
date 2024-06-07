import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './play.css';

const Play = () => {
    const { playId, scenarioId } = useParams();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [votes, setVotes] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();
    const ws = useRef(null); // Use a ref to hold the WebSocket instance

    const connectWebSocket = () => {
        const wsUrl = process.env.NODE_ENV === 'production'
            ? 'wss://loading-19800d80be43.herokuapp.com/'
            : `ws://${window.location.hostname}:${window.location.port}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'RESET_VOTES') {
                console.log('Resetting votes and clearing voting flags');
                localStorage.removeItem(`hasVoted_${playId}_${scenarioId}`);
            } else if (message.type === 'ADMIN_START_GAME' && message.playId === playId && message.scenarioId === scenarioId) {
                setTimer(parseInt(message.countdown) || 30); // Set the timer from the message
            }
        };
    };

    useEffect(() => {
        const fetchScenario = async () => {
            try {
                const response = await fetch(`/play/scenario/${playId}/${scenarioId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401) {
                    console.error("Unauthorized");
                    navigate('/userNamePage');
                    return;
                } else if (!response.ok) {
                    console.error('Failed to fetch scenario');
                }

                const data = await response.json();
                setQuestion(data.question);
                setOptions(data.choices.map(choice => choice.description));
                setVotes(new Array(data.choices.length).fill(0)); // Initialize votes array
                localStorage.setItem('scenarioId', scenarioId); // Save scenarioID to localStorage
                localStorage.setItem('playId', playId);
            } catch (error) {
                console.error("Error fetching scenario", error);
            }
        };

        fetchScenario();
        connectWebSocket();

        const countdown = parseInt(localStorage.getItem('countdown')) || 30; // Default to 30 seconds if not set
        setTimer(countdown);

        const interval = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    navigate('/resultPage');
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => {
            if (ws.current) ws.current.close();
            clearInterval(interval);
        };
    }, [playId, scenarioId, navigate]);

    const handleAnswer = (selectedOptionIndex) => {
        const hasVoted = localStorage.getItem(`hasVoted_${playId}_${scenarioId}`);
        if (hasVoted) {
            alert("You have already voted in this scenario.");
            return;
        }

        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);

        const message = {
            type: 'USER_VOTE',
            playId,
            scenarioId,
            choiceIndex: selectedOptionIndex
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }

        // Store votes and mark the user as having voted
        localStorage.setItem('votes', JSON.stringify(newVotes));
        localStorage.setItem(`hasVoted_${playId}_${scenarioId}`, 'true');
        setHasVoted(true); // Update the state to indicate the user has voted
    };

    return (
        <div className="questionContainer">
            <div className="timer">Time remaining: {timer} seconds</div>
            {hasVoted ? (
                <div>Din stemme er sendt...</div>
            ) : (
                <>
                    <h2 className="loadingText">LOADING..</h2>
                    <h3 className="questionText">{question}</h3>
                    <div className="optionsContainer">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className={`optionBtn option-${index}`}
                                onClick={() => handleAnswer(index)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Play;
