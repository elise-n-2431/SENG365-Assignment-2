import axios from 'axios';
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { Button } from "@mui/material";


const API_BASE = 'http://localhost:4941/api/v1';

const SignUp = ({ onLogin }: { onLogin?: () => void }) => {
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const location = useLocation();
    const [email, setEmail] = React.useState(location.state?.email ?? '');
    const [password, setPassword] = React.useState(location.state?.password ?? '');
    const [firstName, setFirst] = React.useState(location.state?.firstName ?? '');
    const [lastName, setLast] = React.useState(location.state?.lastName ?? '');
    const [imageFile, setImageFile] = React.useState<File | null>(null);


    const handleSignUp = () => {
        axios.post(`${API_BASE}/users/register`, { email, password, firstName, lastName })
            .then(() => {
                return axios.post(`${API_BASE}/users/login`, { email, password });
            })
            .then(async (res) => {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('firstName', firstName);
                localStorage.setItem('lastName', lastName);
                setErrorFlag(false);

                if (imageFile) {
                    await axios.put(`${API_BASE}/users/${res.data.userId}/image`, imageFile, {
                        headers: {
                            'X-Authorization': res.data.token,
                            'Content-Type': imageFile.type,  // e.g. "image/png", "image/jpeg", "image/gif"
                        }
                    });
                }

                onLogin?.();
                navigate('/');


            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.response?.data?.message ?? err.toString());
            });
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, alignSelf: 'center'}}>
            <h1>Register</h1>

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
            <div style={{ marginBottom: 8 }}>
                <label>First Name</label><br />
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 8 }}>
                <label>Last Name</label><br />
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 8 }}>
                <label>Image (optional)</label><br />
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
            </div>

            {/* Add image url handling */}

            <Button variant="contained" style={{ margin: 8}} onClick={handleSignUp}>
                Sign Up
            </Button>
        </div>
    );
}

export default SignUp;