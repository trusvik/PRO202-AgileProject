import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createNew.css'

function CreateNew() {
    const [play, setPlay] = useState('');
    const [scenarios, setScenarios] = useState([{ question: '', choices: [{ description: '', nextStage: '' }] }]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePlayNameChange = (e) => {
        setPlay(e.target.value);
    };

    const handleScenarioChange = (index, value) => {
        const newScenarios = [...scenarios];
        newScenarios[index].question = value;
        setScenarios(newScenarios);
    };

    const handleChoiceChange = (scenarioIndex, choiceIndex, field, value) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices[choiceIndex][field] = value;
        setScenarios(newScenarios);
    };

    const handleAddScenario = () => {
        setScenarios([...scenarios, { question: '', choices: [{ description: '', nextStage: '' }] }]);
    };

    const handleRemoveScenario = (index) => {
        const newScenarios = scenarios.filter((_, i) => i !== index);
        setScenarios(newScenarios);
    };

    const handleAddChoice = (scenarioIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices.push({ description: '', nextStage: '' });
        setScenarios(newScenarios);
    };

    const handleRemoveChoice = (scenarioIndex, choiceIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices = newScenarios[scenarioIndex].choices.filter((_, i) => i !== choiceIndex);
        setScenarios(newScenarios);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (play.trim() === '') {
            setError('Play name cannot be empty');
            return;
        }

        setError('');

        try {
            const response = await fetch('/admin/plays/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: play, scenarios })
            });

            if (response.ok) {
                alert('Play created successfully');
                navigate('/admin');
            } else {
                const errorData = await response.json();
                alert(`Failed to create play: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating play:', error);
            alert('Failed to create play');
        }
    };

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Create</h1>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} id='parentElementEdit'>
                <div id='playNameDiv'>
                    <label>
                        <p id='fontSize'>Play Name:</p>
                        <input type="text" id='sizeInputAdmin' value={play} onChange={handlePlayNameChange} required />
                    </label>
                </div>
                {scenarios.map((scenario, scenarioIndex) => (
                    <div key={scenarioIndex} id='scenarioQuestionDiv'>
                        <label>
                            <p id='fontSize'>Scenario Question:</p>
                            <input
                                id='sizeInputAdmin'
                                type="text"
                                value={scenario.question}
                                onChange={(e) => handleScenarioChange(scenarioIndex, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => handleRemoveScenario(scenarioIndex)}>
                                Remove Scenario
                            </button>
                        </label>
                        {scenario.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} id='choiceDiv'>
                                <label>
                                    <p id='fontSizeChoice'>Choice {choiceIndex + 1}:</p>
                                    <input
                                        id='sizeInputAdmin'
                                        type="text"
                                        value={choice.description}
                                        onChange={(e) => handleChoiceChange(scenarioIndex, choiceIndex, 'description', e.target.value)}
                                        required
                                    />
                                    <p id='fontSizeChoice'>Next Stage:</p>
                                    <input
                                        id='sizeInputAdmin'
                                        type="text"
                                        value={choice.nextStage}
                                        onChange={(e) => handleChoiceChange(scenarioIndex, choiceIndex, 'nextStage', e.target.value)}
                                    />
                                </label>
                                <button type="button" id='removeChoiceButton' onClick={() => handleRemoveChoice(scenarioIndex, choiceIndex)}>
                                    -
                                </button>
                            </div>
                        ))}
                        <div id='addChoiceButtonDiv'>
                            <button type="button" onClick={() => handleAddChoice(scenarioIndex)} id='addChoiceButton'>
                                Add Choice
                            </button>
                        </div>
                    </div>
                ))}
                <div id='saveButtonDiv'>
                    {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}

                    <button type="button" onClick={handleAddScenario} id='addScenarioButton'>
                        Add Scenario
                    </button>

                    <button type="submit" id='saveButton'>Save</button>
                </div>
            </form>
        </>
    );
}

export default CreateNew;
