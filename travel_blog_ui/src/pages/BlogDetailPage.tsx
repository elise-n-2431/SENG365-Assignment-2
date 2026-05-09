import React from 'react';
import { Typography, Chip, Avatar } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

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

const API_BASE = 'http://localhost:4941/api/v1';

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-NZ', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Pacific/Auckland',
    });

const BlogDetailPage = () => {
    const { id } = useParams();
    // const navigate = useNavigate();

    const [blog, setBlog] = React.useState<Blog | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [imgError, setImgError] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/${id}`)
            .then((res) => setBlog(res.data))
            .catch(() => setErrorFlag(true));
    }, [id]);

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

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ThumbUpIcon fontSize="small" />
                <Typography variant="body2">{blog.numReactions}</Typography>
            </div>
        </div>




    //     Similar blogs
    //     Comments
    //     Reactions
    );
};

export default BlogDetailPage;