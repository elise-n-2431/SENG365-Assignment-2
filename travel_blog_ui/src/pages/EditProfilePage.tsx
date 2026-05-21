import {Button} from "@mui/material";
import React from "react";
import { useNavigate, useParams} from "react-router-dom";
import axios from "axios";
const API_BASE = 'http://localhost:4941/api/v1';


const EditProfilePage = ({ onProfileUpdate }: { onProfileUpdate?: () => void }) => {
    const { id } = useParams();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const [imageFile, setImageFile] = React.useState<File | null>(null);

    const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);
    const [removeImage, setRemoveImage] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Pre-fill form with current values
    React.useEffect(() => {
        axios.get(`${API_BASE}/users/${id}`, {
            headers: { 'X-Authorization': token }
        }).then((res) => {
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);
            setEmail(res.data.email);
        });

        const url = `${API_BASE}/users/${id}/image`;
        axios.get(url, { responseType: 'blob' })
            .then(() => setCurrentImageUrl(url))
            .catch(() => setCurrentImageUrl(null)); // No image exists
    }, [id]);

    const previewUrl = imageFile
        ? URL.createObjectURL(imageFile)
        : (!removeImage && currentImageUrl) ? currentImageUrl : null;

    const handleSave = () => {
        axios.patch(`${API_BASE}/users/${id}`,
            { firstName, lastName, email },
            { headers: { 'X-Authorization': token } }
        )
            .then(async () => {
                // Update localStorage so navbar reflects changes
                localStorage.setItem('firstName', firstName);
                localStorage.setItem('lastName', lastName);

                if (removeImage && !imageFile) {
                    await axios.delete(`${API_BASE}/users/${id}/image`, {
                        headers: { 'X-Authorization': token }
                    });
                } else if (imageFile) {
                    await axios.put(`${API_BASE}/users/${id}/image`, imageFile, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': imageFile.type,
                        }
                    });
                }
                onProfileUpdate?.();
                navigate(`/users/${id}`);

            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.response?.data?.message ?? err.toString());
            });
    };

    return (
        <div className="form-page">
            <h1>Edit Profile</h1>

            {errorFlag && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <label>First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-field">
                <label>Profile Image</label>
                {previewUrl
                    ? <img src={previewUrl} alt="Profile preview" className="form-image-preview" />
                    : <div className="form-image-placeholder">No image</div>
                }
                <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }}
                       onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); setRemoveImage(false); }} />
                <div className="form-actions">
                    <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                        {currentImageUrl || imageFile ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {(currentImageUrl || imageFile) && (
                        <Button variant="outlined" size="small" color="error" onClick={() => {
                            setImageFile(null);
                            setRemoveImage(true);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }}>
                            Remove Image
                        </Button>
                    )}
                </div>
            </div>

            <Button variant="contained" onClick={handleSave}>Save</Button>
        </div>
    );
};

export default EditProfilePage;