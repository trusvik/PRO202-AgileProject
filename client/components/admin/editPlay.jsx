import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './editPlay.css';
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";

function EditPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const [scenarios, setScenarios] = useState([{ question: '', choices: [{ description: '', nextStage: '' }], isOpen: false }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                const response = await fetch(`/admin/plays/get/${id}`, {
                    credentials: 'include',
                });
                if (response.status === 401) {
                    navigate('/adminlogin');
                    return;
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPlay(data.play);
                setScenarios(data.scenarios.map(scenario => ({ ...scenario, isOpen: false })));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching play:', error);
                setError('Failed to load play');
                setLoading(false);
            }
        };

        fetchPlay();
    }, [id, navigate]);

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
        setScenarios([...scenarios, { question: '', choices: [{ description: '', nextStage: '' }], isOpen: false }]);
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

    const handleIconClick = (index) => {
        const newScenarios = [...scenarios];
        newScenarios[index].isOpen = !newScenarios[index].isOpen;
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
            const response = await fetch(`/admin/plays/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: play, scenarios })
            });

            if (response.ok) {
                alert('Play updated successfully');
                navigate('/admin');
            } else {
                const errorData = await response.json();
                alert(`Failed to update play: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating play:', error);
            alert('Failed to update play');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Edit</h1>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} id='parentElementEdit'>
                <div id='playNameDiv'>
                    <label>
                        <p id='fontSize'>Play Name:</p>
                        <input type="text" value={play} onChange={handlePlayNameChange} required id='sizeInputAdmin' />
                    </label>
                </div>
                {scenarios.map((scenario, scenarioIndex) => (
                    <div key={scenarioIndex} id='scenarioQuestionDiv'>
                        <label>
                            <div className='scenarioDivElement'>
                                {scenario.isOpen ? (
                                    <FaAngleDown
                                        size={20}
                                        className="centeredIcon"
                                        onClick={() => handleIconClick(scenarioIndex)}
                                    />
                                ) : (
                                    <FaAngleRight
                                        size={20}
                                        className="centeredIcon"
                                        onClick={() => handleIconClick(scenarioIndex)}
                                    />
                                )}
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
                            </div>
                        </label>

                        {scenario.isOpen && scenario.choices.map((choice, choiceIndex) => (
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
                                        type="number"
                                        min={0}
                                        value={choice.nextStage}
                                        onChange={(e) => handleChoiceChange(scenarioIndex, choiceIndex, 'nextStage', e.target.value)}
                                    />
                                </label>
                                <button type="button" id='removeChoiceButton' onClick={() => handleRemoveChoice(scenarioIndex, choiceIndex)}>
                                    -
                                </button>
                            </div>
                        ))}
                        {scenario.isOpen && (
                            <div id='addChoiceButtonDiv'>
                                <button type="button" onClick={() => handleAddChoice(scenarioIndex)} id='addChoiceButton'>
                                    Add Choice
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div id='saveButtonDiv'>
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <button type="button" onClick={handleAddScenario} id='addScenarioButton'>
                        Add Scenario
                    </button>

                    <button type="submit" id='saveButton'>Save</button>
                </div>
            </form>
        </>
    );
}

export default EditPlay;
