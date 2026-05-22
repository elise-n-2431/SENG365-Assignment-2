import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import useAuthStore from "../store/authStore.ts";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const API_BASE = 'http://localhost:4941/api/v1';

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const login = useAuthStore(state => state.login);
    const formRef = React.useRef<HTMLFormElement>(null);
    const [showPassword, setShowPassword] = React.useState(false);

    const validate = () => {
        let valid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password.trim()) {
            setPasswordError('Password is required.');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        if (!validate()) return;

        axios.post(`${API_BASE}/users/login`, { email, password })
            .then((res) => {
                const { token, userId } = res.data;
                return axios.get(`${API_BASE}/users/${userId}`, {
                    headers: { 'X-Authorization': token }
                }).then((userRes) => {
                    login(token, userId, userRes.data.firstName, userRes.data.lastName);
                });
            })
            .then(() => {
                navigate('/');
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    setErrorMessage('Invalid email or password.');
                } else {
                    setErrorMessage(err.response?.data?.message ?? 'Something went wrong.');
                }
            });
    };

    const handleSignUp = () => {
        navigate('/register', { state: { email, password } });
    };

    return (
        <form ref={formRef} className="form-page" noValidate onSubmit={handleLogin}>
            <h1>Log In</h1>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <TextField
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    error={!!emailError}
                    helperText={emailError}
                />
            </div>

            <div className="form-field">
                <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    error={!!passwordError}
                    helperText={passwordError}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </div>

            <div className="form-actions">
                <Button variant="contained" type="submit">Login</Button>
                <Button variant="contained" type="button" onClick={handleSignUp}>Sign Up</Button>
            </div>
        </form>
    );
};

export default LoginPage;