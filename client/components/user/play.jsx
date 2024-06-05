import React, { useEffect, useState } from "react";
import './play.css';
import { useNavigate } from "react-router-dom";

const Play = () => {
    const [scenario, setScenario] = useState(null);
    const [votes, setVotes] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const scenarioData = JSON.parse(localStorage.getItem('scenarioData'));
        if (scenarioData) {
            setScenario(scenarioData);
            setVotes(new Array(scenarioData.options.length).fill(0));
        }
    }, []);

    const handleAnswer = (selectedOptionIndex) => {
        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < scenario.questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            localStorage.setItem('votes', JSON.stringify(newVotes));
            navigate('/resultPage');
        }
    };

    if (!scenario) {
        return <div>Loading...</div>;
    }

    return (
        <div className="questionContainer">
            <h2 className="loadingText">LOADING..</h2>
            <h3 className="questionText">{scenario.questions[currentQuestionIndex].question}</h3>
            <div className="optionsContainer">
                {scenario.questions[currentQuestionIndex].options.map((option, index) => (
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
