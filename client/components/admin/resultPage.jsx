import React, { useEffect, useState } from 'react';
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
  }, [playId, scenarioId, navigate]);

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
        <button onClick={() => navigate('/admin')} id="goBackButton">Go Back</button>
      </div>
    </>
  );
}

export default ResultPage;
