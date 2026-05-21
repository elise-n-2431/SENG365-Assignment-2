import axios from 'axios';
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { Button } from "@mui/material";
import useAuthStore from "../store/authStore.ts";


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
    const login = useAuthStore(state => state.login);


    const handleSignUp = () => {
        axios.post(`${API_BASE}/users/register`, { email, password, firstName, lastName })
            .then(() => {
                return axios.post(`${API_BASE}/users/login`, { email, password });
            })
            .then(async (res) => {
                login(res.data.token,  res.data.userId, firstName, lastName);

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
        <div className="form-page">
            <h1>Register</h1>

            {errorFlag && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <label>Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-field">
                <label>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLast(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Image (optional)</label>
                <input type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>

            <Button variant="contained" onClick={handleSignUp}>Sign Up</Button>
        </div>
    );
}

export default SignUp;