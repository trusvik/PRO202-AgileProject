import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './resultPage.css';

function ResultPage() {
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch('/admin/plays/results', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401) {
                    console.error("Unauthorized");
                    navigate('/adminlogin');
                    return;
                } else if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Error fetching results", error);
            }
        };

        fetchResults();
    }, [navigate]);

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Results</h1>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <div id="resultContainer">
                {results.length === 0 ? (
                    <p>No results to display</p>
                ) : (
                    results.map(result => (
                        <div key={result._id} className="resultItem">
                            <h3>Play: {result.playName}</h3>
                            <p>Scenario: {result.scenarioQuestion}</p>
                            <p>Choice: {result.choiceDescription}</p>
                            <p>Votes: {result.votes}</p>
                            <p></p>
                        </div>
                    ))
                )}
                <button onClick={() => navigate('/admin')} id="goBackButton">Go Back</button>
            </div>
        </>
    );
}

export default ResultPage;
