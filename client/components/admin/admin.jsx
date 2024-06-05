import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import { CiSettings } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";

function Admin() {
    // State hooks for managing plays data and various UI states.
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changePasswordMessage, setChangePasswordMessage] = useState(""); // Message for password change.
    const [showLogoutPopup, setShowLogoutPopup] = useState(false); // State for logout popup
    const [showRemovePopup, setShowRemovePopup] = useState(false); // State for remove popup
    const [playToRemove, setPlayToRemove] = useState(null); // State to hold the play to be removed
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
    const confirmRemove = async () => {
        try {
            const response = await fetch(`/admin/plays/delete/${playToRemove._id}`, {
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

            setPlays((prevPlays) => prevPlays.filter(play => play._id !== playToRemove._id));
            setShowRemovePopup(false);
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

    // Handler for starting a play.
    const handleStart = (playId) => {
        navigate(`/admin/plays/start/${playId}`);
    };

    // Handler for logging out.
    const confirmLogout = async () => {
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
                </div>
            </header>

            <section id='parent-margin'>
                <section id='containerSectionButton'>
                    <button id="settingsBtnAdmin" onClick={() => setShowSettings(true)}><CiSettings id='logoutIcon' size={20}/></button>
                    <button className="logoutBtn" onClick={() => setShowLogoutPopup(true)}> 
                        <IoIosLogOut id='settingsIcon'size={20}/>
                        <span className="tooltip">Logout</span>
                    </button>

                    {showSettings && (
                        <div className="settingsPopup">
                            <div className="settingsContent">
                                <h3>Settings</h3>
                                <button className="closeBtn" onClick={() => setShowSettings(false)}>Close</button>
                                <div className="settingOption">
                                    <button className="changePasswordBtn" onClick={() => setShowChangePassword(true)}>Change password</button>
                                </div>
                            </div>
                        </div>
                    )}
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
                            <button id='remove' onClick={() => {
                                setShowRemovePopup(true);
                                setPlayToRemove(play);
                            }}>Remove</button>
                        </div>
                    </section>
                ))}
            </section>

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
                            <button className='submitBtn' type="submit">Submit</button>
                        </form>
                        {changePasswordMessage && <div className="popupMessage">{changePasswordMessage}</div>}
                        <button className="closeBtn" onClick={() => setShowChangePassword(false)}>Close</button>
                    </div>
                </div>
            )}

            {showLogoutPopup && (
                <div className='logOutPopup'>
                    <div className='logOutDiv'>
                        <IoIosLogOut size={80}/>
                        <h3>Oh no! You're leaving...</h3>
                        <h3>Are you sure?</h3>
                        <div className='noLogoutAdmin'>
                            <button onClick={confirmLogout} className='yesNoButtonAdminPage'>YES</button>
                            <button onClick={() => setShowLogoutPopup(false) } className='yesNoButtonAdminPage'>NO</button>
                        </div>
                    </div>
                </div>
            )}

            {showRemovePopup && (
                <div className='removePlayPopup'>
                    <div className='removePlayDiv'>
                        <p>Are you sure you want to delete "{playToRemove?.name}"?</p>
                        <div>
                            <button className='yesRemoveButton' onClick={confirmRemove}>YES</button>
                            <button className='noRemoveButton' onClick={() => setShowRemovePopup(false)}>NO</button>
                        </div>   
                    </div>
                </div>
            )}
        </>
    );
}

export default Admin;
