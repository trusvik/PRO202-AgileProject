import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


function StartPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                const response = await fetch(`/admin/plays/${id}`,{
                    credentials: 'include',
                });
                switch (response.status) {
                    case 401:
                       console.error("Unauthorized");
                       navigate('/adminLogin'); 
                       return;
                    case 200:
                        break;
                }
                const data = await response.json();
                setPlay(data.play);
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