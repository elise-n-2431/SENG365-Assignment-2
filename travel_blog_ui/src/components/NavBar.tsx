import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Avatar } from '@mui/material';
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
        <nav>
            <Link to="/">HOME</Link>

            <div className="nav-right">
                {isLoggedIn() ? (
                    <>
                        <Link to="/my-blogs" className="nav-link">MY BLOGS</Link>

                        <Link to={`/users/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <span className="nav-link">MY PROFILE</span>
                            <Avatar
                                src={avatarError ? undefined : userImageUrl}
                                alt={userName}
                                style={{ width: 32, height: 32, fontSize: 14, marginRight: 20}}
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

                        <Button variant="contained" className="nav-logout" onClick={() => setDialogOpen(true)}>Log out</Button>
                    </>
                ) : (
                    <Link to="/login">Log in</Link>
                )}
            </div>
        </nav>
    );
};

export default NavBar;