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
        clearGameState();
    }, [navigate])
    
    return (
        <div id="end-screen-container">
            <p>THE GAME IS OVER</p>
        </div>
    )
}

export default PlayOver;