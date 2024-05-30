import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

function Admin() {
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changePasswordMessage, setChangePasswordMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlays = async () => {
            try {
                const response = await fetch('/admin/plays/get', {
                    credentials: 'include',
                });
                if (response.status === 401) {
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

    const handleCreateNew = () => {
        navigate('/admin/plays/new');
    };

    const handleRemove = async (playId) => {
        try {
            const response = await fetch(`/admin/plays/delete/${playId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.status === 401) {
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

    const handleEdit = (playId) => {
        navigate(`/admin/plays/edit/${playId}`);
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setChangePasswordMessage("Both password fields must be filled out.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setChangePasswordMessage("Passwords do not match.");
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
                setChangePasswordMessage("Password changed successfully!");
                setNewPassword("");
                setConfirmPassword("");
                setShowChangePassword(false);
            } else {
                setChangePasswordMessage("Error changing password.");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setChangePasswordMessage("An error occurred. Please try again later.");
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
                            <button id='play'>Play</button>
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
                            <button className="changePasswordBtn" onClick={() => setShowChangePassword(true)}>Change Password</button>
                        </div>
                    </div>
                </div>
            )}

            {showChangePassword && (
                <div className="changePasswordPopup">
                    <div className="changePasswordContainer">
                        <h3>Change Password</h3>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button onClick={handleChangePassword}>Submit</button>
                        {changePasswordMessage && <div className="popupMessage">{changePasswordMessage}</div>}
                        <button className="closeBtn" onClick={() => setShowChangePassword(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Admin;
