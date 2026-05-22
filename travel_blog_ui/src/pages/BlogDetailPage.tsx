import React from 'react';
import {Typography, Chip, Avatar, Button} from '@mui/material';
import axios from 'axios';
import {Link, useNavigate, useParams} from 'react-router-dom';
import CommentSection from "../components/CommentSection.tsx";
import SimilarBlogs from "../components/SimilarBlogsSection.tsx";
import {ConfirmDialog, ErrorDialog} from "../components/PopUp.tsx";
import useAuthStore from "../store/authStore.ts";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }
interface Blog {
    blogId: number;
    title: string;
    description: string;
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

    const token = useAuthStore(state => state.token);
    const loggedInUserId = useAuthStore(state => state.userId);

    const [blog, setBlog] = React.useState<Blog | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [imgError, setImgError] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [currentReaction, setCurrentReaction] = React.useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [errorOpen, setErrorOpen] = React.useState(false);
    const [signInOpen, setSignInOpen] = React.useState(false);

    const [reactions, setReactions] = React.useState<{userId: number, reaction: string}[]>([]);
    const [ownBlogOpen, setOwnBlogOpen] = React.useState(false);


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

    const handleDeleteBlog = () => {
        axios.delete(`${API_BASE}/blogs/${id}`, { headers: { 'X-Authorization': token } })
            .then(() => {
                navigate(`/users/${loggedInUserId}`);
            })
            .catch(() => {
                setErrorOpen(true);
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

    React.useEffect(() => {
        setImgError(false);
        setAvatarError(false);
    }, [id]);

    if (errorFlag) return <div>Blog not found.</div>;
    if (!blog) return <div>Loading...</div>;

    const cityName = cities.find((c) => c.cityId === blog.cityId)?.name ?? `City ${blog.cityId}`;
    const creatorImageUrl = `${API_BASE}/users/${blog.creatorId}/image`;
    const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;
    const isAuthorised = Number(loggedInUserId) === Number(blog.creatorId);
    const canReact = Number(loggedInUserId) !== Number(blog.creatorId) && !!token;
    const blogImageUrl = `${API_BASE}/blogs/${blog.blogId}/image`;


    return (
        <>
        <div className="blog-detail">
            <div className="blog-detail-layout">
                {!imgError ? (
                    <img
                        src={blogImageUrl}
                        alt={blog.title}
                        className="blog-detail-image"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="blog-detail-no-image">
                        <Typography variant="body2">No image</Typography>
                    </div>
                )}
                <div className="blog-detail-content">
                    <Typography variant="h6">{blog.title}</Typography>
                    <Typography variant="body2">{blog.description}</Typography>

                    <Link to={`/users/${blog.creatorId}`} className="blog-detail-creator-row">
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
                </div>
            </div>
            <div className="blog-detail-chips">
                {blog.series && (
                    <Chip className="blog-detail-series" key="series" label={blog.series} size="small" />
                )}
                {blog.categoryIds.map((catId) => {
                    const name = categories.find((c) => c.categoryId === catId)?.name ?? `Cat ${catId}`;
                    return <Chip key={catId} label={name} size="small" />;
                })}
            </div>

            <div className="blog-detail-reactions">
                {REACTIONS.map(({ value, label }) => {
                    const count = reactions.filter(r => r.reaction === value).length;
                    return (
                        <Button
                            className="reaction-button"
                            key={value}
                            variant={currentReaction === value ? 'contained' : 'outlined'}
                            onClick={() => {
                                if (isAuthorised) setOwnBlogOpen(true);
                                else if (canReact) handleReaction(value);
                                else setSignInOpen(true);
                            }}
                            style={{ minWidth: 64 }}
                        >
                            {label} {count > 0 && <span style={{ marginLeft: 4 }}>{count}</span>}
                        </Button>
                    );
                })}
            </div>

            <ConfirmDialog
                open={signInOpen}
                title="Sign In"
                message="User sign in is required to perform this task"
                confirmLabel="Sign In"
                onConfirm={() => { navigate(`/login`); setSignInOpen(false); }}
                onCancel={() => setSignInOpen(false)}
            />

            <ErrorDialog
                open={ownBlogOpen}
                title="Can't React"
                message="You cannot react to your own blog."
                confirmLabel="OK"
                onConfirm={() => setOwnBlogOpen(false)}
            />


            {isAuthorised && (
                <>
                    <ConfirmDialog
                        open={dialogOpen}
                        title="Delete Blog"
                        message="Are you sure you want to delete this blog?"
                        confirmLabel="Delete Blog"
                        onConfirm={() => { handleDeleteBlog(); setDialogOpen(false); }}
                        onCancel={() => setDialogOpen(false)}
                    />
                    <ErrorDialog
                        open={errorOpen}
                        title="Error"
                        message="Blogs with comments cannot be deleted."
                        confirmLabel="Ok"
                        onConfirm={() => setErrorOpen(false)}
                    />
                    <div className="blog-detail-actions">
                        <Link to={`/blogs/${id}/edit`}>
                            <Button variant="contained">Edit Blog</Button>
                        </Link>
                        <Button variant="contained" color="error" onClick={() => setDialogOpen(true)}>
                            Delete Blog
                        </Button>
                    </div>
                </>
            )}
        </div>
            <SimilarBlogs blog={blog} />
            <CommentSection blogId={Number(id)} userId={blog.creatorId} />
    </>
    );
};

export default BlogDetailPage;