import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BarChart from "./BarChart";
import './resultPage.css';

const UserResultPage = () => {
    const { playId } = useParams();
    const [results, setResults] = useState([]);
    const [chartData, setChartData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`/admin/plays/results/${playId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401) {
                    console.error("Unauthorized");
                    return;
                } else if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                setResults(data);
                transformChartData(data);
            } catch (error) {
                console.error("Error fetching results", error);
            }
        };

        fetchResults();
    }, [playId, navigate]);

    const transformChartData = (data) => {
        const labels = data.map(result => `${result.playName} - ${result.choiceDescription}`);
        const votes = data.map(result => result.votes);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Votes',
                    data: votes,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };

        setChartData(chartData);
    };

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
                {chartData ? (
                    <BarChart data={chartData} />
                ) : (
                    <p>No results to display</p>
                )}
                <button onClick={() => navigate('')} id="goBackButton">Go Back</button>
            </div>
        </>
    );
}

export default UserResultPage;
