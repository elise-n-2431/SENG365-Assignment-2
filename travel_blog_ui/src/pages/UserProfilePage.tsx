import React from 'react';
import {Avatar, Button} from '@mui/material';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from 'axios';
import {Link, useNavigate, useParams} from 'react-router-dom';
import BlogSeries from "../components/BlogSeriesSection.tsx";
import useAuthStore from "../store/authStore.ts";

interface User{
    // userId: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageFilename: string,
    authToken: string
}

const API_BASE = 'http://localhost:4941/api/v1';


const UserProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const loggedInUserId = useAuthStore(state => state.userId);

    const [user, setUser] = React.useState<User | null>(null);
    const [avatarError, setAvatarError] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);

    const userId = Number(id);
    const token = useAuthStore(state => state.token);

    React.useEffect(() => {
        axios.get(`${API_BASE}/users/${id}`, {
            headers: { 'X-Authorization': token }
        }).then((res) => setUser(res.data))
            .catch(() => setErrorFlag(true));
    }, [id, token]);

    if (!id) {
        navigate('/');
        return null;
    }

    if (errorFlag) return <div>Something went wrong</div>;
    if (!user) return <div>Loading...</div>;

    const userImageUrl = `${API_BASE}/users/${id}/image`;
    const userName = `${user.firstName} ${user.lastName}`;

    const isAuthorised = Number(loggedInUserId) === Number(id);

    return (
        <div className="profile-page">

            <div className="profile-avatar-wrapper">
                <Avatar
                    src={avatarError ? undefined : userImageUrl}
                    alt={userName}
                    onError={() => setAvatarError(true)}
                >
                </Avatar>
            </div>

            <h1>{userName}</h1>
            {isAuthorised && (
                <>
                <h3>{user.email}</h3>
                <div className="profile-actions">
                    <Link to={`/users/${id}/edit`}>
                        <Button variant="contained">Edit Profile</Button>
                    </Link>
                    <Link to="/blogs/create">
                        <Button variant="contained">New Blog</Button>
                    </Link>
                </div>
                </>
            )}

            <BlogSeries id={userId} />
        </div>
    );
}

export default UserProfilePage;