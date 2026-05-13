import React from 'react';
import {Avatar, Button} from '@mui/material';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from 'axios';
import {Link, useNavigate, useParams} from 'react-router-dom';
import BlogSeries from "../components/BlogSeriesSection.tsx";

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
    const [user, setUser] = React.useState<User | null>(null);
    // const [imgError, setImgError] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);

    const userId = Number(id);

    React.useEffect(() => {
        axios.get(`${API_BASE}/users/${id}`)
            .then((res) => setUser(res.data))
            .catch(() => setErrorFlag(true));
    }, [id]);

    if (!id) {
        navigate('/');
        return null;
    }

    if (errorFlag) return <div>Something went wrong</div>;
    if (!user) return <div>Loading...</div>;

    const userImageUrl = `${API_BASE}/users/${id}/image`;
    const userName = `${user.firstName} ${user.lastName}`;


    const loggedInUserId = localStorage.getItem("userId");
    const isAuthorised = Number(loggedInUserId) === Number(id);

    return (<div>
        <h1>{userName}</h1>

        <div style={{ display: 'flex', gap: 8, width: 300 }}>
            <Avatar
                src={avatarError ? undefined : userImageUrl}
                alt={userName}
                style={{ width: 300, height: 300, fontSize: 14, alignItems: 'center', justifyContent: 'center' }}
                onError={() => setAvatarError(true)}
            >
                {userName[0]}
            </Avatar>
        </div>

        {/* only if auth user */}
        {isAuthorised && (
            <><Link to={`/users/${id}/edit`}>
                <Button variant="contained" style={{margin: 8}}>
                    Edit Profile
                </Button>
            </Link><Link to="/blogs/create">
                <Button variant="contained">New Blog</Button>
            </Link>
            </>
        )}

        {isAuthorised && (
            <p>{user.email}</p>
        )}

        <BlogSeries id={userId} />

    </div>)
}

export default UserProfilePage;