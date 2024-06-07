import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './resultPage.css';

const UserResultPage = () => {
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            const scenarioId = localStorage.getItem('scenarioId'); // Retrieve scenarioId from localStorage
            const playId = localStorage.getItem('playId');

            if (!scenarioId) {
                console.error("No scenarioId found in localStorage");
                return;
            }

            console.log(`Fetching results with playId: ${playId} and scenarioId: ${scenarioId}`);

            try {
                const response = await fetch(`/admin/plays/results/${playId}/${scenarioId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401) {
                    console.error("Unauthorized");
                    navigate('/userlogin'); // Adjust the route if there's a user login
                    return;
                } else if (!response.ok) {
                    console.error('Failed to fetch results');
                    return;
                }

                const data = await response.json();
                console.log("Fetched data:", data); // Log fetched data to verify its structure
                setResults(data.choices || []); // Adjust to your data structure
            } catch (error) {
                console.error("Error fetching results", error);
            }
        };

        fetchResults();

        const timer = setTimeout(() => {
            navigate('/waitingRoom');
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Results</h1>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>User</p> {/* Adjust user name if needed */}
                </div>
            </header>

            <div id="resultContainer">
                {results.length === 0 ? (
                    <p>No results to display</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={results}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="description" /> {/* Ensure this matches your data */}
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="votes" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                <button onClick={() => navigate('/waitingRoom')} id="goBackButton">Go Back</button>
            </div>
        </>
    );
}

export default UserResultPage;
