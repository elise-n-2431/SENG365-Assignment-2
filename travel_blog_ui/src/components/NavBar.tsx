import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Avatar } from '@mui/material';
import { ConfirmDialog } from "./PopUp.tsx";
import useAuthStore from '../store/authStore.ts';

const API_BASE = 'http://localhost:4941/api/v1';

const NavBar = () => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);

    const userId    = useAuthStore(state => state.userId);
    const firstName = useAuthStore(state => state.firstName) ?? '';
    const lastName  = useAuthStore(state => state.lastName) ?? '';
    const isLoggedIn = useAuthStore(state => state.isLoggedIn);
    const logout    = useAuthStore(state => state.logout);

    const userName     = `${firstName} ${lastName}`.trim();
    const userImageUrl = `${API_BASE}/users/${userId}/image`;

    React.useEffect(() => {
        setAvatarError(false);
    }, [userId]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px', borderBottom: '1px solid #ccc' }}>

            <Link to="/">Home</Link>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
                {isLoggedIn() ? (
                    <>
                        <Link to="/my-blogs" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
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

                        <button onClick={() => setDialogOpen(true)}>Log out</button>
                    </>
                ) : (
                    <Link to="/login">Log in</Link>
                )}
            </div>

        </nav>
    );
};

export default NavBar;