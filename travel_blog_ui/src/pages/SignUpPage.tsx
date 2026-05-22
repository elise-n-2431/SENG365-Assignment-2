import axios from 'axios';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from "../store/authStore.ts";
import { Button, TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE = 'http://localhost:4941/api/v1';

const SignUp = ({ onLogin }: { onLogin?: () => void }) => {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const location = useLocation();

    const [email, setEmail] = React.useState(location.state?.email ?? '');
    const [password, setPassword] = React.useState(location.state?.password ?? '');
    const [firstName, setFirst] = React.useState(location.state?.firstName ?? '');
    const [lastName, setLast] = React.useState(location.state?.lastName ?? '');
    const [imageFile, setImageFile] = React.useState<File | null>(null);

    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [firstNameError, setFirstNameError] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

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

        if (!firstName.trim()) {
            setFirstNameError('First name is required.');
            valid = false;
        } else {
            setFirstNameError('');
        }

        if (!lastName.trim()) {
            setLastNameError('Last name is required.');
            valid = false;
        } else {
            setLastNameError('');
        }

        return valid;
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage('');

        if (!validate()) return;

        axios.post(`${API_BASE}/users/register`, { email, password, firstName, lastName })
            .then(() => axios.post(`${API_BASE}/users/login`, { email, password }))
            .then(async (res) => {
                login(res.data.token, res.data.userId, firstName, lastName);

                if (imageFile) {
                    await axios.put(`${API_BASE}/users/${res.data.userId}/image`, imageFile, {
                        headers: {
                            'X-Authorization': res.data.token,
                            'Content-Type': imageFile.type,
                        }
                    });
                }
                onLogin?.();
                navigate('/');
            })
            .catch((err) => {
                const status = err.response?.status;

                if (status === 403) {
                    setEmailError('This email address is already in use.');
                } else {
                    setErrorMessage(err.response?.data?.message ?? 'Please check your details and try again.');
                }
                setPassword('');
            });
    };

    return (
        <form ref={formRef} className="form-page" noValidate onSubmit={handleSignUp}>
            <h1>Register</h1>

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

            <div className="form-field">
                <TextField
                    label="First Name"
                    type="text"
                    required
                    fullWidth
                    value={firstName}
                    onChange={(e) => { setFirst(e.target.value); setFirstNameError(''); }}
                    error={!!firstNameError}
                    helperText={firstNameError}
                />
            </div>

            <div className="form-field">
                <TextField
                    label="Last Name"
                    type="text"
                    required
                    fullWidth
                    value={lastName}
                    onChange={(e) => { setLast(e.target.value); setLastNameError(''); }}
                    error={!!lastNameError}
                    helperText={lastNameError}
                />
            </div>

            <div className="form-field">
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Image (optional)</label>
                <input type="file" accept="image/png, image/jpeg, image/gif"
                       onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="form-actions">
                <Button variant="contained" type="submit">Sign Up</Button>
            </div>
        </form>
    );
}

export default SignUp;