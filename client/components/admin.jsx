import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

function Admin() {
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
        const fetchPlays = async () => {
            try {
                const response = await fetch('http://localhost:3000/admin/plays/get', {
                    credentials: 'include', // Ensure cookies are sent with the request
                });
                if (response.status === 401) {
                    // If unauthorized, redirect to login page
                    navigate('/adminlogin');
                    return;
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPlays(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching plays:', error);
                setLoading(false);
            }
        };

        fetchPlays();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Handle create new button click
    const handleCreateNew = () => {
        navigate('/admin/plays/new');
    };

    // Handle remove button click
    const handleRemove = async (playId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/plays/delete/${playId}`, {
                method: 'DELETE',
                credentials: 'include', // Ensure cookies are sent with the request
            });

            if (response.status === 401) {
                // If unauthorized, redirect to login page
                navigate('/adminlogin');
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to delete play');
            }

            setPlays((prevPlays) => prevPlays.filter(play => play._id !== playId));
        } catch (error) {
            console.error('Error deleting play:', error);
        }
    };

    // Handle edit button click
    const handleEdit = (playId) => {
        navigate(`/admin/plays/edit/${playId}`);
    };

    return (
        <>
            <header id="containerHeader">
                <div id="flexContainerLeft">
                    <h1 id='logo'>Plays</h1>
                </div>
                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                    <img alt="Admin" id='profilePicture'/>
                </div>
            </header>

            <section id='parent-margin'>
                <section id='containerSectionButton'>
                    <button id='createNewButton' onClick={handleCreateNew}>Create new</button>
                </section>

                <section id='containerSectionName'>
                    <div id='start'>
                        <div id='one'><p>Id</p></div>
                        <div id='two'><p>Name</p></div>
                        <div id='three'><p>Number of scenarios</p></div>
                    </div>
                    <div id='end'>
                        <p>Edit</p>
                    </div>
                </section>

                {plays.map(play => (
                    <section key={play._id} id='containerSectionName'>
                        <div id='start'>
                            <div id='one'><p>{play._id}</p></div>
                            <div id='two'><p>{play.name}</p></div>
                            <div id='three'><p>{play.numberOfScenarios}</p></div>
                        </div>
                        <div id='end'>
                            <button id='play'>Play</button>
                            <button id='edit' onClick={() => handleEdit(play._id)}>Edit</button>
                            <button id='remove' onClick={() => handleRemove(play._id)}>Remove</button>
                        </div>
                    </section>
                ))}
            </section>
        </>
    );
}

export default Admin;
