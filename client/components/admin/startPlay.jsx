import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './startPlay.css'

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
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Play: {play}</h1>
                    <h3 id="logo">Pin: {code}</h3>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                </div>
            </header>

            <div id='sectionHolderParent'>
                <div>
                    <p>{play}</p>
                </div>
                <div id='parentQuestionElement'>
                    <div id='leftQuestionElement'>
                        <p>QUESTION HERE</p>
                    </div>
                    <div id='rightQuestionElement'>
                        <input type="number" id="startPlayInput" placeholder='Set Countdown (Sec)' />
                        <button>Show</button>
                    </div>
                </div>
            </div>
            


        

        </>
    );
}

export default StartPlay;
