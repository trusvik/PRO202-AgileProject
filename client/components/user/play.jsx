import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './play.css';

const Play = () => {
    const { playId, scenarioId } = useParams();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [votes, setVotes] = useState([]);
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

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [playId, scenarioId, navigate]);

    const handleAnswer = (selectedOptionIndex) => {
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

        // Store votes and navigate to the result page after answering
        localStorage.setItem('votes', JSON.stringify(newVotes));
        navigate('/resultPage');
    };

    return (
        <div className="questionContainer">
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
        </div>
    );
}

export default Play;
