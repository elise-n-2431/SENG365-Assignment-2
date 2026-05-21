import axios from 'axios';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import { Button } from "@mui/material";
import useAuthStore from "../store/authStore.ts";

const API_BASE = 'http://localhost:4941/api/v1';

const LoginPage = ({ onLogin }: { onLogin?: () => void }) => {
    const navigate = useNavigate();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const login = useAuthStore(state => state.login);


    const handleLogin = () => {
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
                setErrorFlag(false);
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
        <div className="form-page">
            <h1>Log in</h1>

            {errorFlag && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <label>Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-actions">
                <Button variant="contained" onClick={handleLogin}>Login</Button>
                <Button variant="contained" onClick={handleSignUp}>Sign Up</Button>
            </div>
        </div>
    );

//     Validation and error handling

};

export default LoginPage;