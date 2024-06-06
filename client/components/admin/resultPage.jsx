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
  const navigate = useNavigate();
  const ws = useRef(null); // Use a ref to hold the WebSocket instance
  let countDownDone = false;


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
        if (countDownDone) {
          console.log("countdown is over, will not take in results anymore");
        }
        if (data.type === 'UPDATE_RESULTS' && data.playId === playId && data.scenarioId === scenarioId) {
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
        setResults(data.choices);
      } catch (error) {
        console.error("Error fetching results", error);
      }
    };

    fetchResults();
    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [playId, scenarioId, navigate]);

  const handleAnswers = () => {
    console.log("Handlign answers");
    let mostVoteIndex = 0;
    for (let i = 1; i < results.length; i++) {
        if (results[i] && results[mostVoteIndex].votes < results[i].votes) {
            mostVoteIndex = i;
        }
    } 
    console.log('The answer with the most votes', results[mostVoteIndex]);
    if (results && results[mostVoteIndex]) {
      console.log(results[mostVoteIndex].nextStage);
      let nextStageIndex = parseInt(results[mostVoteIndex].nextStage, 10) -1 ;
      localStorage.setItem('nextStageIndex', nextStageIndex)
    }

  }

  const startCountdown = async () => {
      let countdown = localStorage.getItem('countdown');
      if (!countdown) return;
  
      countdown = parseInt(countdown, 10);
      const interval = setInterval(() => {
        countdown -= 1;
        localStorage.setItem('countdown', countdown);
        console.log(`Countdown: ${countdown}`);
  
        if (countdown <= 0) {
          clearInterval(interval);
          handleAnswers();
          countDownDone = true;
        }
      }, 1000);
  };
  startCountdown();

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
              if (countDownDone) {
                navigate(`/admin/plays/start/${playId}`)
              } else {
                alert('The countdown is not finished!')
              }
            } 
          } id="goBackButton">Go Back</button>
        </div>
      </>
  );
}

export default ResultPage;
