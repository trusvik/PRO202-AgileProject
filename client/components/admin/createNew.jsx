import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createNew.css'

function CreateNew() {
    // State hooks for managing play name, scenarios, and error messages.
    const [play, setPlay] = useState('');
    const [scenarios, setScenarios] = useState([{ question: '', choices: [''] }]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handler to update play name state.
    const handlePlayNameChange = (e) => {
        setPlay(e.target.value);
    };

    // Handler to update scenario question state.
    const handleScenarioChange = (index, value) => {
        const newScenarios = [...scenarios];
        newScenarios[index].question = value;
        setScenarios(newScenarios);
    };

    // Handler to update choice text state for a specific scenario.
    const handleChoiceChange = (scenarioIndex, choiceIndex, value) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices[choiceIndex] = value;
        setScenarios(newScenarios);
    };

    // Handler to add a new scenario.
    const handleAddScenario = () => {
        setScenarios([...scenarios, { question: '', choices: [''] }]);
    };

    // Handler to remove a scenario by index.
    const handleRemoveScenario = (index) => {
        const newScenarios = scenarios.filter((_, i) => i !== index);
        setScenarios(newScenarios);
    };

    // Handler to add a new choice to a specific scenario.
    const handleAddChoice = (scenarioIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices.push('');
        setScenarios(newScenarios);
    };

    // Handler to remove a choice from a specific scenario.
    const handleRemoveChoice = (scenarioIndex, choiceIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices = newScenarios[scenarioIndex].choices.filter((_, i) => i !== choiceIndex);
        setScenarios(newScenarios);
    };

    // Handler for form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (play.trim() === '') {
            setError('Play name cannot be empty');
            return;
        }

        setError(''); // Clear error if validation passes

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
                navigate('/admin'); // Redirect to admin page after successful creation
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
                                        value={choice}
                                        onChange={(e) => handleChoiceChange(scenarioIndex, choiceIndex, e.target.value)}
                                        required
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