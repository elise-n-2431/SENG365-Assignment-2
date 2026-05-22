import axios from 'axios';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore.ts';
import {
    Button, TextField, IconButton, InputAdornment, FormControl, FormLabel, FormHelperText
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE = 'http://localhost:4941/api/v1';

const EditProfilePage = ({ onProfileUpdate }: { onProfileUpdate?: () => void }) => {
    const { id } = useParams();
    const token = useAuthStore(state => state.token);
    const update = useAuthStore(state => state.update);
    const navigate = useNavigate();

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);

    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const [wasImageDeleted, setWasImageDeleted] = React.useState(false);

    const [firstNameError, setFirstNameError] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [currentPasswordError, setCurrentPasswordError] = React.useState('');
    const [newPasswordError, setNewPasswordError] = React.useState('');
    const [imageError, setImageError] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        axios.get(`${API_BASE}/users/${id}`, {
            headers: { 'X-Authorization': token }
        }).then((res) => {
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);
            setEmail(res.data.email);
        });

        axios.get(`${API_BASE}/users/${id}/image`, {
            responseType: 'blob'
        })
            .then((res) => {
                const imageUrl = URL.createObjectURL(res.data);
                setImagePreviewUrl(imageUrl);
            })
            .catch(() => {
                setImagePreviewUrl(null);
            });
    }, [id, token]);

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageError('');
        setWasImageDeleted(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validate = () => {
        let valid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!firstName.trim()) { setFirstNameError('First name is required.'); valid = false; }
        else setFirstNameError('');

        if (!lastName.trim()) { setLastNameError('Last name is required.'); valid = false; }
        else setLastNameError('');

        if (!email.trim()) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        } else {
            setEmailError('');
        }

        if (newPassword && !currentPassword) {
            setCurrentPasswordError('Current password is required to set a new one.');
            valid = false;
        } else setCurrentPasswordError('');

        if (newPassword && newPassword.length < 6) {
            setNewPasswordError('Password must be at least 6 characters.');
            valid = false;
        } else setNewPasswordError('');

        setImageError('');

        return valid;
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validate()) return;

        const payload: any = { firstName, lastName, email };
        if (newPassword && currentPassword) {
            payload.password = newPassword;
            payload.currentPassword = currentPassword;
        }

        axios.patch(`${API_BASE}/users/${id}`, payload, {
            headers: { 'X-Authorization': token }
        })
            .then(async () => {
                update(firstName, lastName);

                if (imageFile) {
                    await axios.put(`${API_BASE}/users/${id}/image`, imageFile, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': imageFile.type,
                        }
                    });
                }
                else if (wasImageDeleted) {
                    await axios.delete(`${API_BASE}/users/${id}/image`, {
                        headers: { 'X-Authorization': token }
                    }).catch(() => {
                    });
                }

                onProfileUpdate?.();
                navigate(`/users/${id}`);
            })
            .catch((err) => {
                const status = err.response?.status;
                if (status === 403) setEmailError('This email address is already in use.');
                else if (status === 401) setCurrentPasswordError('Incorrect current password.');
                else setErrorMessage(err.response?.data?.message ?? 'Something went wrong.');
            });
    };

    return (
        <form className="form-page" noValidate onSubmit={handleSave}>
            <h1>Edit Profile</h1>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <TextField
                    label="First Name"
                    required
                    fullWidth
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setFirstNameError(''); }}
                    error={!!firstNameError}
                    helperText={firstNameError}
                />
            </div>

            <div className="form-field">
                <TextField
                    label="Last Name"
                    required
                    fullWidth
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setLastNameError(''); }}
                    error={!!lastNameError}
                    helperText={lastNameError}
                />
            </div>

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
                <FormControl error={!!imageError}>
                    <FormLabel>Profile Image (Optional)</FormLabel>

                    <div style={{ position: 'relative', marginTop: 8 }}>
                        {(imageFile || imagePreviewUrl) && (
                            <div style={{ marginBottom: 8 }}>
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : imagePreviewUrl!}
                                    alt="profile"
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        display: 'block'
                                    }}
                                />
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setImageFile(file);
                                setWasImageDeleted(false);
                                setImageError('');
                            }}
                            style={{ width: '100%' }}
                        />

                        {(imageFile || imagePreviewUrl) && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                aria-label="Remove image"
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    lineHeight: '20px',
                                    background: '#e0e0e0',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {imageError && <FormHelperText>{imageError}</FormHelperText>}
                </FormControl>
            </div>

            <div className="form-field">
                <TextField
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setCurrentPasswordError(''); }}
                    error={!!currentPasswordError}
                    helperText={currentPasswordError || 'Required only if changing your password.'}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowCurrentPassword(p => !p)} edge="end">
                                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </div>

            <div className="form-field">
                <TextField
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setNewPasswordError(''); }}
                    error={!!newPasswordError}
                    helperText={newPasswordError || 'Leave blank to keep your current password.'}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNewPassword(p => !p)} edge="end">
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </div>

            <div className="form-actions">
                <Button variant="outlined" onClick={() => navigate(`/users/${id}`)}>Cancel</Button>
                <Button variant="contained" type="submit">Save Changes</Button>
            </div>
        </form>
    );
};

export default EditProfilePage;