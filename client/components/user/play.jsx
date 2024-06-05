import React, {useState, useEffect} from "react";
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
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            
            setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
        }, 1000); 
  
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            localStorage.setItem('votes', JSON.stringify(votes));
            navigate('/resultPage');
        }
    }, [timeLeft, votes, navigate]);


    const handleAnswer = (selectedOptionIndex) => {
        const newVotes = [...votes];
        newVotes[selectedOptionIndex]++;
        setVotes(newVotes);
        setSelectedOption(selectedOptionIndex);


        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            localStorage.setItem('votes', JSON.stringify(newVotes));

            setTimeout(() => {
                navigate('/resultPage');
            }, 3000);
        }
    };

    return (
        <div className="questionContainer">
            <h1 className="loadingText">LOADING..</h1>
            <h2 className="timer">Tid igjen: {timeLeft} sekunder</h2>
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
            {selectedOption !== null && (
                <p className="selectedOptionText">Du valgte: {questions[currentQuestionIndex].options[selectedOption]}</p>
            )}
        </div>

    );

}


export default Play;
