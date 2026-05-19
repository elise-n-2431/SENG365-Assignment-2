import axios from 'axios';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import { Button } from "@mui/material";

const API_BASE = 'http://localhost:4941/api/v1';

const LoginPage = ({ onLogin }: { onLogin?: () => void }) => {
    const navigate = useNavigate();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleLogin = () => {
        axios.post(`${API_BASE}/users/login`, { email, password })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.userId);
                // fetch user details to get name for navbar
                return axios.get(`${API_BASE}/users/${res.data.userId}`, {
                    headers: { 'X-Authorization': res.data.token }
                });
            })
            .then((res) => {
                localStorage.setItem('firstName', res.data.firstName);
                localStorage.setItem('lastName', res.data.lastName);
                setErrorFlag(false);
                onLogin?.();
                navigate('/');
            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.response?.data?.message ?? err.toString());
            });
    };
    const handleSignUp = () => {
        navigate('/register', { state: { email, password } });
    }

    return (
        <div style={{ padding: 20, maxWidth: 400, alignSelf: 'center'}}>
            <h1>Log in</h1>

            {errorFlag && <div style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</div>}

            <div style={{ marginBottom: 8 }}>
                <label>Email</label><br />
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: 8 }}>
                <label>Password</label><br />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button variant="contained" style={{ margin: 8}} onClick={handleLogin}>
                Login
            </Button>
            <Button variant="contained" style={{ margin: 8}} onClick={handleSignUp}>
                Sign Up
            </Button>
        </div>
    );

//     Validation and error handling

};

export default LoginPage;