import React, { useState, useEffect } from "react";
import "./play.css";
import { useNavigate } from "react-router-dom";

const Play = () => {
    const [gameState, setGameState] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getState = async () => {
            try {
                const response = await fetch("/gameState", {
                    method: "GET",
                });
                if (response.status !== 200) {
                    console.error("MODDAFOKKA");
                    return;
                }
                const data = await response.json();
                setGameState(data);
                console.log('Game state set');
            } catch (err) {
                console.error("ERROR", err);
            }
        };
        getState();
    }, []);

    useEffect(() => {
        const getPlayData = async () => {
            if (gameState && gameState.playId) {
                try {
                    const response = await fetch(`/admin/plays/get/${gameState.playId}`, {
                        method: "GET",
                    });
                    if (!response.ok) {
                        console.error("NOE GIKK GAALT FAKK DET HER");
                    }
                    const data = await response.json();
                    setGameData(data);

                    // Set questions based on gameData
                    const formattedQuestions = data.scenarios.map(scenario => ({
                        question: scenario.question,
                        options: scenario.choices.map(choice => choice.description)
                    }));
                    setQuestions(formattedQuestions);
                } catch (err) {
                    console.error("dddd", err);
                }
            }
        };
        getPlayData();
    }, [gameState]);

    useEffect(() => {
        console.log(gameState);
        console.log(gameData);
    }, [gameState, gameData]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [votes, setVotes] = useState([0, 0, 0, 0]);

    const handleAnswer = (selectedOptionIndex) => {
        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            localStorage.setItem("votes", JSON.stringify(newVotes));
            navigate("/resultPage");
        }
    };

    if (questions.length === 0) {
        return <div className="questionContainer"><h2 className="loadingText">LOADING..</h2></div>;
    }

    return (
        <div className="questionContainer">
            <h3 className="questionText">{questions[currentQuestionIndex].question}</h3>
            <div className="optionsContainer">
                {questions[currentQuestionIndex].options.map((option, index) => (
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
};

export default Play;
