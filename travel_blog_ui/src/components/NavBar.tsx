import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Avatar } from '@mui/material';
import { ConfirmDialog } from "./PopUp.tsx";

const API_BASE = 'http://localhost:4941/api/v1';

const NavBar = ({ refreshKey }: { refreshKey: number }) => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = React.useState(false);


    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName') ?? '';
    const lastName = localStorage.getItem('lastName') ?? '';

    const isLoggedIn = token !== null;
    const userName = `${firstName} ${lastName}`.trim();

    // Cache-bust so the browser re-fetches after an image update
    const userImageUrl = `${API_BASE}/users/${userId}/image?t=${refreshKey}`;

    const [avatarError, setAvatarError] = React.useState(false);

    // Reset avatar error when refreshKey changes (e.g. new image uploaded)
    React.useEffect(() => {
        setAvatarError(false);
    }, [refreshKey]);

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
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
                {isLoggedIn ? (
                    <>
                        {/* Clicking avatar/name goes to profile */}
                        <Link to={`/my-blogs`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <Typography variant="body2">My Blogs</Typography>
                        </Link>

                        <Link to={`/users/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <Typography variant="body2">My Profile</Typography>

                            <Avatar
                                src={avatarError ? undefined : userImageUrl}
                                alt={userName}
                                style={{ width: 32, height: 32, fontSize: 14 }}
                                onError={() => setAvatarError(true)}
                            >
                                {userName[0]}
                            </Avatar>
                        </Link>
                        <ConfirmDialog
                            open={dialogOpen}
                            title="Log out"
                            message="Are you sure you want to log out?"
                            confirmLabel="Log out"
                            onConfirm={() => { handleLogout(); setDialogOpen(false); }}
                            onCancel={() => setDialogOpen(false)}
                        />

                        {/* rest of nav */}
                        <button onClick={() => setDialogOpen(true)}>Log out</button>
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