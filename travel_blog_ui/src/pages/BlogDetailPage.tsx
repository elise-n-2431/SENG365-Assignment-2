import React from 'react';
import {Typography, Chip, Avatar, Button} from '@mui/material';
import axios from 'axios';
import {Link, useNavigate, useParams} from 'react-router-dom';
import CommentSection from "../components/CommentSection.tsx";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }
interface Blog {
    blogId: number;
    title: string;
    cityId: number;
    creationDate: string;
    creatorId: number;
    creatorFirstName: string;
    creatorLastName: string;
    series: string | null;
    numReactions: number;
    categoryIds: number[];
}
const REACTIONS = [
    { value: 'REACTION_1', label: '😡' },
    { value: 'REACTION_2', label: '😕' },
    { value: 'REACTION_3', label: '😐' },
    { value: 'REACTION_4', label: '😊' },
    { value: 'REACTION_5', label: '🤩' },
];

const API_BASE = 'http://localhost:4941/api/v1';

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-NZ', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Pacific/Auckland',
    });

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = React.useState<Blog | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [imgError, setImgError] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [currentReaction, setCurrentReaction] = React.useState<string | null>(null);

    const [reactions, setReactions] = React.useState<{userId: number, reaction: string}[]>([]);

    const fetchReactions = () => {
        axios.get(`${API_BASE}/blogs/${id}/react`)
            .then((res) => {
                setReactions(res.data);
                const mine = res.data.find((r: any) => r.userId === Number(loggedInUserId));
                if (mine) setCurrentReaction(mine.reaction);
            });
    };

    React.useEffect(() => {
        if (!blog) return;
        fetchReactions();
    }, [id, blog]);

    const token = localStorage.getItem('token');
    const handleDeleteBlog = () => {
        axios.delete(`${API_BASE}/blogs/${id}`, { headers: { 'X-Authorization': token } })
            .then(() => {
                navigate('/');
            })
            .catch(() => {
                setErrorFlag(true)
            });
    };

    const handleReaction = (reaction: string) => {
        if (currentReaction === reaction) {
            axios.delete(`${API_BASE}/blogs/${id}/react`, { headers: { 'X-Authorization': token } })
                .then(() => { setCurrentReaction(null); fetchReactions(); });
        } else {
            axios.post(`${API_BASE}/blogs/${id}/react`, { reaction }, { headers: { 'X-Authorization': token } })
                .then(() => { setCurrentReaction(reaction); fetchReactions(); });
        }
    };

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/${id}`)
            .then((res) => setBlog(res.data))
            .catch(() => setErrorFlag(true));
    }, [id]);

    React.useEffect(() => {
        if (!token || !blog) return;
        axios.get(`${API_BASE}/blogs/${id}/react`)
            .then((res) => {
                const mine = res.data.find((r: any) => r.userId === Number(loggedInUserId));
                if (mine) setCurrentReaction(mine.reaction);
            });
    }, [id, blog]);

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/categories`).then((res) => setCategories(res.data));
        axios.get(`${API_BASE}/blogs/cities`).then((res) => setCities(res.data));
    }, []);

    // Early returns — before any derivations that depend on blog
    if (errorFlag) return <div>Blog not found.</div>;
    if (!blog) return <div>Loading...</div>;

    // Safe to derive values here — blog is guaranteed non-null
    const cityName = cities.find((c) => c.cityId === blog.cityId)?.name ?? `City ${blog.cityId}`;
    const blogImageUrl = `${API_BASE}/blogs/${blog.blogId}/image`;
    const creatorImageUrl = `${API_BASE}/users/${blog.creatorId}/image`;
    const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;
    const loggedInUserId = localStorage.getItem("userId");
    const isAuthorised = Number(loggedInUserId) === Number(blog.creatorId);
    const canReact = Number(loggedInUserId) !== Number(blog.creatorId) && !!token;

    return (
        <div>
            {!imgError ? (
                <img
                    src={blogImageUrl}
                    alt={blog.title}
                    height="160"
                    onError={() => setImgError(true)}
                    style={{ objectFit: 'cover' }}
                />
            ) : (
                <div style={{ height: 160, background: '#eee' }}>
                    <Typography variant="body2">No image</Typography>
                </div>
            )}

            <Typography variant="h6">{blog.title}</Typography>

            <Link to={`/users/${blog.creatorId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                <Avatar
                    src={avatarError ? undefined : creatorImageUrl}
                    alt={creatorName}
                    style={{ width: 28, height: 28 }}
                    onError={() => setAvatarError(true)}
                >
                    {creatorName[0]}
                </Avatar>
                <Typography variant="body2">{creatorName}</Typography>
            </Link>

            <Typography variant="body2">
                {cityName} · {formatDate(blog.creationDate)}
            </Typography>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {blog.categoryIds.map((catId) => {
                    const name = categories.find((c) => c.categoryId === catId)?.name ?? `Cat ${catId}`;
                    return <Chip key={catId} label={name} size="small" />;
                })}
            </div>

            <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                {REACTIONS.map(({ value, label }) => {
                    const count = reactions.filter(r => r.reaction === value).length;
                    return (
                        <Button
                            key={value}
                            variant={currentReaction === value ? 'contained' : 'outlined'}
                            onClick={() => canReact ? handleReaction(value) : undefined}
                            disabled={!canReact}
                            style={{ minWidth: 64 }}
                        >
                            {label} {count > 0 && <span style={{ marginLeft: 4 }}>{count}</span>}
                        </Button>
                    );
                })}
            </div>

            {isAuthorised && (
                <><Link to={`/blogs/${id}/edit`}>
                    <Button variant="contained" style={{margin: 8}}>
                        Edit Blog
                    </Button>
                </Link>
                    <Button variant="contained" onClick={handleDeleteBlog}>Delete Blog</Button>
                </>
            )}

            <CommentSection blogId={Number(id)} userId={blog.creatorId} />


        </div>




    //     Similar blogs
    //     Comments
    //     Reactions
    );
};

export default BlogDetailPage;