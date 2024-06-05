import React, {useState} from "react";
import './play.css';
import {useNavigate} from "react-router-dom";

const Play = () => {
    const questions = [
        {
            question: 'Hvordan skal karakteren reagere?',
            options: ['Forvirret', 'Sint', 'Irritert', 'Glad'],
        },

    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [votes, setVotes] = useState([0, 0, 0, 0]);
    const navigate = useNavigate();

    const handleAnswer = (selectedOptionIndex) => {
        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);


        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            localStorage.setItem('votes', JSON.stringify(newVotes));
            navigate('/resultPage');
        }
    };

    return (
        <div className="questionContainer">
            <h2 className="loadingText">LOADING..</h2>
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

}


export default Play;
