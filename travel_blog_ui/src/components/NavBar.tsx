import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Avatar } from '@mui/material';

const API_BASE = 'http://localhost:4941/api/v1';

const NavBar = () => {
    const navigate = useNavigate();

    // Read auth state from localStorage — set these on login, clear on logout
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName') ?? '';
    const lastName = localStorage.getItem('lastName') ?? '';

    const isLoggedIn = token !== null;
    const userName = `${firstName} ${lastName}`.trim();
    const userImageUrl = `${API_BASE}/users/${userId}/image`;

    const [avatarError, setAvatarError] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px', borderBottom: '1px solid #ccc' }}>

            <Link to="/">Home</Link>

            {/* Push user section to the right */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                {isLoggedIn ? (
                    <>
                        {/* Clicking avatar/name goes to profile */}
                        <Link to={`/users/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <Avatar
                                src={avatarError ? undefined : userImageUrl}
                                alt={userName}
                                style={{ width: 32, height: 32, fontSize: 14 }}
                                onError={() => setAvatarError(true)}
                            >
                                {userName[0]}
                            </Avatar>
                            <Typography variant="body2">{userName}</Typography>
                        </Link>
                        <button onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Log in</Link>
                        {/*<Link to="/register">Register</Link>*/}
                    </>
                )}
            </div>

        </nav>
    );
};

export default NavBar;