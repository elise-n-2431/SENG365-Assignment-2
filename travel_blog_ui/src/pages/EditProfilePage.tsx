import {Button} from "@mui/material";
import React from "react";
import { useNavigate, useParams} from "react-router-dom";
import axios from "axios";
const API_BASE = 'http://localhost:4941/api/v1';


const EditProfilePage = () => {
    const { id } = useParams();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    // Pre-fill form with current values
    React.useEffect(() => {
        axios.get(`${API_BASE}/users/${id}`, {
            headers: { 'X-Authorization': token }
        }).then((res) => {
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);
            setEmail(res.data.email);
        });
    }, [id]);

    const handleSave = () => {
        axios.patch(`${API_BASE}/users/${id}`,
            { firstName, lastName, email },
            { headers: { 'X-Authorization': token } }
        )
            .then(() => {
                // Update localStorage so navbar reflects changes
                localStorage.setItem('firstName', firstName);
                localStorage.setItem('lastName', lastName);
                navigate(`/users/${id}`);
            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.response?.data?.message ?? err.toString());
            });
    };

    return (
        <div style={{ padding: 20, maxWidth: 400 }}>

            {/* Give a consistent formatting template, shared with sign up page */}

            <h1>Edit Profile</h1>

            {errorFlag && <div style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</div>}

            <div style={{ marginBottom: 8 }}>
                <label>First Name</label><br />
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 8 }}>
                <label>Last Name</label><br />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 8 }}>
                <label>Email</label><br />
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <Button variant="contained" onClick={handleSave}>Save</Button>
        </div>
    );
};

export default EditProfilePage;