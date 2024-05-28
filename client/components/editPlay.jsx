import React, { useState } from 'react';

function EditPlay() {
    const [play, setPlay] = useState('');
    const [scenarios, setScenarios] = useState(0);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (scenarios < 0) {
            setError('Number of scenarios cannot be less than 0');
            return;
        }

        setError(''); // Clear error if validation passes

        try {
            const response = await fetch('http://localhost:3000/admin/plays/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ play, scenarios })
            });

            if (response.ok) {
                alert('Play created successfully');
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
                    <input type="text" value={play} onChange={(e) => setPlay(e.target.value)} required />
                </label>
            </div>
            <div>
                <label>
                    Number of Scenarios:
                    <input
                        type="number"
                        value={scenarios}
                        onChange={(e) => setScenarios(Number(e.target.value))}
                        required
                        min="0" // Prevents entering a negative number
                    />
                </label>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <button type="submit">Save</button>
        </form>
    );
}

export default EditPlay;
