import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './playOver.css';

const PlayOver = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const clearGameState = async () => {
            localStorage.clear()
            const response = await fetch('/admin/reset', {
                method: 'POST',
                credentials: 'include',
            })
            if (!response.ok) {
                navigate('/adminlogin')
                return;
            }
        }
        const resetVotes = async () => {
            const response = await fetch('/admin/reset-votes', {
                method: 'POST',
                credentials: 'include',
            })
            if (!response.ok) {
                console.log("Could not reset votes");
                return;
            } else {
                console.log("VOTES RESET I THINK");
            }

        }
        clearGameState();
        resetVotes();
    }, [navigate])
    
    return (
        <div id="end-screen-container">
            <p>THE GAME IS OVER</p>
        </div>
    )
}

export default PlayOver;