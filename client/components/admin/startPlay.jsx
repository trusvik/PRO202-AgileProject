import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function StartPlay() {
    const { id } = useParams();
    const [play, setPlay] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                const response = await fetch(`/admin/plays/start/${id}`, {
                    method: 'POST',
                    credentials: 'include', // Ensure cookies are sent with the request.
                });
                switch (response.status) {
                    case 401:
                        console.error("Unauthorized");
                        navigate('/adminlogin'); // Redirect to /adminlogin if unauthorized.
                        return;
                    case 200:
                        break;
                    default:
                        throw new Error('Failed to start play');
                }
                const data = await response.json();
                setPlay(data.play); // Set the play name from the fetched data.
                setCode(data.code); // Set the generated code from the server
            } catch (error) {
                console.error("Error starting play", error);
            }
        };
        fetchPlay();
    }, [id, navigate]);

    return (
        <>
            <div>A play has been started...</div>
            <div>The play is called {play}</div>
            <div>The access pin is: {code}</div> {/* Display the generated code */}
        </>
    );
}

export default StartPlay;
