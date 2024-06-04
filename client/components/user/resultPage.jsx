import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './resultPage.css';

const ResultPage = () => {
    const [currentPlay, setCurrentPlay] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrentPlay = async () => {
            try {
                console.log('Fetching current play from Heroku...');
                const response = await fetch('https://loading-19800d80be43.herokuapp.com/admin/plays/getCurrent', {
                    credentials: 'include', // Ensure cookies are sent with the request
                });
                console.log('Response status:', response.status);
                if (response.status === 401) {
                    alert("Aida, det var dumt..");
                    return;
                }
                /*if (!response.ok) {
                    throw new Error('Network response was not ok');
                }*/
                const data = await response.json();
                console.log('Data fetched:', data);
                setCurrentPlay(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching current play:', error);
                setLoading(false);
            }
        };

        fetchCurrentPlay();
    }, [navigate]);

    const getChartData = (scenario) => ({
        labels: scenario.choices.map(choice => choice.description),
        datasets: [{
            label: 'Votes',
            data: scenario.choices.map(choice => choice.votes),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }]
    });

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!currentPlay) {
        return <p>No play data available</p>;
    }

    return (
        <div className="resultPageBody">
            <section id='containerSectionName'>
                <div id='choices'>
                    <h2>Choices for {currentPlay.play}</h2>
                    {currentPlay.scenarios && currentPlay.scenarios.map(scenario => (
                        <div key={scenario.scenario_id}>
                            <h4>{scenario.description}</h4>
                            <Bar
                                data={getChartData(scenario)}
                                options={{
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ResultPage;
