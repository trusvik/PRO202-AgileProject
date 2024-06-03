import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

function Admin() {
    // State hooks for managing plays data and various IU states.
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changePasswordMessage, setChangePasswordMessage] = useState(""); // Message for password change.
    const navigate = useNavigate(); // Initialize useNavigate hook

    // useEffect hook to fetch plays data from the server.
    useEffect(() => {
        const fetchPlays = async () => {
            try {
                const response = await fetch('/admin/plays/get', {
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

    // Displays a loading message while data is being fetched.
    if (loading) {
        return <div>Loading...</div>;
    }

    // Handler for creating a new play.
    const handleCreateNew = () => {
        navigate('/admin/plays/new');
    };

    // Handler for removing a play.
    const handleRemove = async (playId) => {
        try {
            const response = await fetch(`/admin/plays/delete/${playId}`, {
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

    // Handler for editing a play.
    const handleEdit = (playId) => {
        navigate(`/admin/plays/edit/${playId}`);
    };

    // Handler for changing the admin password.
    const handleChangePassword = async (event) => {
        event.preventDefault(); // Prevent form from submitting normally
        if (!newPassword || !confirmPassword) {
            setChangePasswordMessage("Begge passordfeltene må fylles ut.");
            setNewPassword(""); // Feltene tømmes etter feilmeldingen
            setConfirmPassword("");
            return;
        }

        if (newPassword !== confirmPassword) {
            setChangePasswordMessage("Passordene stemmer ikke overens.");
            setNewPassword("");
            setConfirmPassword("");
            return;
        }

        try {
            const response = await fetch("/admin/change-password", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            if (response.ok) {
                setChangePasswordMessage("Passordet er endret!");
                setNewPassword("");
                setConfirmPassword("");
                setShowChangePassword(false);
            } else {
                setChangePasswordMessage("Noe gikk galt under endring av passordet.");
            }
        } catch (error) {
            console.error("Feil ved passordendring:", error);
            setChangePasswordMessage("En feil oppstod under passordendringen. Vennligst prøv igjen senere.");
        }
    };

    // Handler for stating a play.
    const handleStart = (playId) => {
        navigate(`/admin/plays/start/${playId}`)
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/adminlogin');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
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
                            <button id='play' onClick={() => handleStart(play._id)}>Play</button>
                            <button id='edit' onClick={() => handleEdit(play._id)}>Edit</button>
                            <button id='remove' onClick={() => handleRemove(play._id)}>Remove</button>
                        </div>
                    </section>
                ))}
            </section>

            <button id="settingsBtn" onClick={() => setShowSettings(true)}>Settings</button>
            {showSettings && (
                <div className="settingsPopup">
                    <div className="settingsContent">
                        <h3>Settings</h3>
                        <button className="closeBtn" onClick={() => setShowSettings(false)}>Close</button>
                        <div className="settingOption">
                            <button className="changePasswordBtn" onClick={() => setShowChangePassword(true)}>Change password</button>
                            <button className="logoutBtn" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {showChangePassword && (
                <div className="changePasswordPopup">
                    <div className="changePasswordContainer">
                        <h3>Change password</h3>
                        <form onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                placeholder="Nytt passord"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Gjenta passord"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button type="submit">Submit</button>
                        </form>
                        {changePasswordMessage && <div className="popupMessage">{changePasswordMessage}</div>}
                        <button className="closeBtn" onClick={() => setShowChangePassword(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Admin;
