import React from 'react';
import {Link,} from 'react-router-dom';
import { Card, CardContent, CardMedia, CardActionArea, Typography, Chip, Avatar } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CommentIcon from '@mui/icons-material/Comment';

import axios from "axios";

interface BlogCardProps {
    blog: Blog;
    categories: Category[];
    cities: City[];
}

interface Category {
    categoryId: number;
    name: string;
}
interface City {
    cityId: number;
    name: string;
}

// Matches exactly what the API returns in the blogs list
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

interface BlogComment {
    commentId: number;
    comment: string;
    commenterId: number;
    commenterFirstName: string;
    commenterLastName: string;
    timestamp: string;
    parentId: number;
}

const API_BASE = 'http://localhost:4941/api/v1';

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-NZ', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Pacific/Auckland',
    });

const BlogCard = ({ blog, categories, cities }: BlogCardProps) => {
    const cityName = cities.find((c) => c.cityId === blog.cityId)?.name ?? `City ${blog.cityId}`;

    const [imgError, setImgError] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState(false);
    const [uniqueCommenters, setUniqueCommenters] = React.useState(0);

    const blogImageUrl = `${API_BASE}/blogs/${blog.blogId}/image`;
    const creatorImageUrl = `${API_BASE}/users/${blog.creatorId}/image`;
    const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;

    const countUnique = (comments: BlogComment[]) => {
        const uniqueIds = new Set(comments.map(c => c.commenterId));
        setUniqueCommenters(uniqueIds.size);
    }

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/${blog.blogId}/comments`)
            .then((res) => {
                countUnique(res.data);
            });
    }, []);

    return (
        <Card className="blog-card">
            <CardActionArea component={Link} to={`/blogs/${blog.blogId}`}>
                {!imgError ? (
                    <CardMedia
                        component="img"
                        height="150"
                        image={blogImageUrl}
                        alt={blog.title}
                        onError={() => setImgError(true)}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="blog-card-no-image">
                        <Typography variant="body2" color="text.secondary">No image</Typography>
                    </div>
                )}
                <CardContent>
                    <Typography variant="h6" gutterBottom>{blog.title}</Typography>
                    <div className="blog-card-creator-row">
                        <Avatar
                            src={avatarError ? undefined : creatorImageUrl}
                            alt={creatorName}
                            style={{ width: 28, height: 28, fontSize: 13 }}
                            onError={() => setAvatarError(true)}
                        >
                            {creatorName[0]}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">{creatorName}</Typography>
                    </div>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {cityName} · {formatDate(blog.creationDate)}
                    </Typography>
                    <div className="blog-card-chips">
                        {blog.series && (
                            <Chip className="blog-card-series" key="series" label={blog.series} size="small" />
                        )}
                        {blog.categoryIds.map((id) => {
                            const name = categories.find((c) => c.categoryId === id)?.name ?? `Cat ${id}`;
                            return <Chip key={id} label={name} size="small" />;
                        })}
                    </div>
                    <div className="blog-card-stats">
                        <EmojiEmotionsIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{blog.numReactions}</Typography>
                        <CommentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{uniqueCommenters}</Typography>
                    </div>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BlogCard;