import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './resultPage.css';

function ResultPage() {
  const { playId, scenarioId } = useParams();
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [countDownDone, setCountDownDone] = useState(false);
  const navigate = useNavigate();
  const ws = useRef(null);

  const connectWebSocket = () => {
    const wsUrl = process.env.NODE_ENV === 'production'
        ? 'wss://loading-19800d80be43.herokuapp.com/'
        : `ws://${window.location.hostname}:${window.location.port}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data); // Log the data
        if (countDownDone) {
          console.log("countdown is over, will not take in results anymore");
          return; // Prevent updating results after countdown
        }
        if (data.type === 'UPDATE_RESULTS' && data.playId === playId && data.scenarioId === scenarioId) {
          console.log('Updating results with WebSocket data:', data.updatedVotes); // Log the update
          setResults(data.updatedVotes);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Try to reconnect after a delay
      setTimeout(connectWebSocket, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error', error);
      ws.current.close();
    };
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/admin/plays/results/${playId}/${scenarioId}`, {
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
        console.log('Initial fetch results:', data); // Log the data
        setResults(data.choices);
      } catch (error) {
        console.error("Error fetching results", error);
      }
    };

    fetchResults();
    connectWebSocket();

    let countdown = parseInt(localStorage.getItem('countdown'), 10) || 30; // Default to 30 seconds if not set
    setTimer(countdown);

    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCountDownDone(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      if (ws.current) ws.current.close();
      clearInterval(interval);
    };
  }, [playId, scenarioId, navigate]);

  useEffect(() => {
    if (countDownDone && results.length > 0) {
      handleAnswers();
    }
  }, [countDownDone, results]);

  const handleAnswers = () => {
    console.log("Handling answers");

    if (results.length === 0) {
      console.log('No results available');
      return;
    }

    console.log('Results:', results); // Log the results to verify structure

    let mostVoteIndex = 0;
    for (let i = 1; i < results.length; i++) {
      if (results[i] && results[i].votes != null && !isNaN(results[i].votes)) {
        if (results[mostVoteIndex].votes < results[i].votes) {
          mostVoteIndex = i;
        }
      } else {
        console.warn(`Result at index ${i} has invalid votes property:`, results[i]);
      }
    }

    if (results[mostVoteIndex] && results[mostVoteIndex].votes != null) {
      console.log('The answer with the most votes', results[mostVoteIndex]);
      if (results[mostVoteIndex].nextStage != null) {
        console.log(results[mostVoteIndex].nextStage);
        let nextStageIndex = parseInt(results[mostVoteIndex].nextStage, 10) - 1;
        localStorage.setItem('nextStageIndex', nextStageIndex);
      } else {
        console.warn('nextStage is not defined for the most voted result:', results[mostVoteIndex]);
      }
    } else {
      console.log('No valid results found');
    }
  }

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
          <div className="timer">Time remaining: {timer} seconds</div>
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
                  <XAxis dataKey="description" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
          )}
          <button onClick={() => {
            navigate(`/admin/plays/start/${playId}`);
          }} id="goBackButton">Go Back</button>
        </div>
      </>
  );
}

export default ResultPage;
