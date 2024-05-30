import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateNew() {
    const [play, setPlay] = useState('');
    const [scenarios, setScenarios] = useState([{ question: '', choices: [''] }]);
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

    const handleChoiceChange = (scenarioIndex, choiceIndex, value) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices[choiceIndex] = value;
        setScenarios(newScenarios);
    };

    const handleAddScenario = () => {
        setScenarios([...scenarios, { question: '', choices: [''] }]);
    };

    const handleRemoveScenario = (index) => {
        const newScenarios = scenarios.filter((_, i) => i !== index);
        setScenarios(newScenarios);
    };

    const handleAddChoice = (scenarioIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices.push('');
        setScenarios(newScenarios);
    };

    const handleRemoveChoice = (scenarioIndex, choiceIndex) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].choices = newScenarios[scenarioIndex].choices.filter((_, i) => i !== choiceIndex);
        setScenarios(newScenarios);
    };

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Play Name:
                    <input type="text" value={play} onChange={handlePlayNameChange} required />
                </label>
            </div>
            {scenarios.map((scenario, scenarioIndex) => (
                <div key={scenarioIndex}>
                    <label>
                        Scenario Question:
                        <input
                            type="text"
                            value={scenario.question}
                            onChange={(e) => handleScenarioChange(scenarioIndex, e.target.value)}
                            required
                        />
                    </label>
                    {scenario.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex}>
                            <label>
                                Choice {choiceIndex + 1}:
                                <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(scenarioIndex, choiceIndex, e.target.value)}
                                    required
                                />
                            </label>
                            <button type="button" onClick={() => handleRemoveChoice(scenarioIndex, choiceIndex)}>
                                Remove Choice
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddChoice(scenarioIndex)}>
                        Add Choice
                    </button>
                    <button type="button" onClick={() => handleRemoveScenario(scenarioIndex)}>
                        Remove Scenario
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddScenario}>
                Add Scenario
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <button type="submit">Save</button>
        </form>
    );
}

export default CreateNew;
