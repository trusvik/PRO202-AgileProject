import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


function StartPlay() {
    // State and hook initializations.
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const navigate = useNavigate();

    // useEffect hook to fetch play data when component mounts or the ID changes.
    useEffect(() => {
        const fetchPlay = async () => {
            try {
                const response = await fetch(`/admin/plays/${id}`,{
                    credentials: 'include', // Ensure cookies are sent with the request.
                });
                switch (response.status) {
                    case 401:
                       console.error("Unauthorized");
                       navigate('/adminLogin'); // Redirect to /adminLogin if unauthorized.
                       return;
                    case 200:
                        break;
                }
                const data = await response.json();
                setPlay(data.play); // Set the play name from the fetched data.
            } catch (error) {
                console.error("Error fetching play", error);
            }
        }
        fetchPlay();
    }, [id, navigate]);

    return (
        <>
            <div>A play has been started...</div>
            <div>The play is called {play}</div>
        </>
    )
}

export default StartPlay;