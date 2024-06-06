import React, { useState, useEffect } from "react";
import "./play.css";
import { useNavigate } from "react-router-dom";

const Play = () => {
    const [gameState, setGameState] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [votes, setVotes] = useState([0, 0, 0, 0]); // Tracks votes for each option
    const [selectedOption, setSelectedOption] = useState(null); // Tracks the selected option
    const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem('countdown'), 10) || 60); // Timer for the game
    const navigate = useNavigate();
    const [selectedOptionText, setSelectedOptionText] = useState(""); // Stores text of the selected option

    useEffect(() => {
        const getState = async () => {
            try {
                const response = await fetch("/gameState", { method: "GET" });
                if (response.status !== 200) {
                    console.error("Failed to fetch game state.");
                    return;
                }
                const data = await response.json();
                setGameState(data);
            } catch (err) {
                console.error("Failed to load game state:", err);
            }
        };

        getState();
    }, []);

    useEffect(() => {
        if (gameState && gameState.playId) {
            const getPlayData = async () => {
                try {
                    const response = await fetch(`/admin/plays/get/${gameState.playId}`, { method: "GET" });
                    if (!response.ok) {
                        console.error("Failed to fetch play data.");
                        return;
                    }
                    const data = await response.json();
                    setGameData(data);
                    const formattedQuestions = data.scenarios.map(scenario => ({
                        question: scenario.question,
                        options: scenario.choices.map(choice => choice.description)
                    }));
                    setQuestions(formattedQuestions);
                } catch (err) {
                    console.error("Error fetching play data:", err);
                }
            };

            getPlayData();
        }
    }, [gameState]);

    
    useEffect(() => {
        const timer = timeLeft > 0 ? setInterval(() => {
            setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
        }, 1000): navigate ('/resultPage');

        return () => clearInterval(timer);
    }, [timeLeft, navigate]);


    // Redirects to result page when time is up
    useEffect(() => {
        if (timeLeft === 0) {
            localStorage.setItem('votes', JSON.stringify(votes));
            navigate('/resultPage');
        }
    }, [timeLeft, votes, navigate]);
    


    // Handles user selection on an option
    const handleAnswer = (selectedOptionIndex) => {
        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);
        setSelectedOption(selectedOptionIndex);
        setSelectedOptionText(questions[currentQuestionIndex].options[selectedOptionIndex]);

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            localStorage.setItem('votes', JSON.stringify(newVotes));
            navigate('/resultPage');
        }
    };

    if (questions.length === 0) {
        return <div className="questionContainer"><h2 className="loadingText">LOADING..</h2></div>;
    }

    return (
        <div className="questionContainer">
            <h1 className="loadingText">LOADING..</h1>
            <h2 className="timer">Tid igjen: {timeLeft} sekunder</h2>
            <h3 className="questionText">{questions[currentQuestionIndex].question}</h3>
            <div className="optionsContainer">
                {questions[currentQuestionIndex].options.map((option, index) => (
                    <button key={index} className={`optionBtn option-${index}`} onClick={() => handleAnswer(index)}>
                        {option}
                    </button>
                ))}
            </div>
            {selectedOption !== null && (
                <p className="selectedOptionText">Du valgte: {selectedOptionText}</p>
            )}
        </div>
    );
};

export default Play;
