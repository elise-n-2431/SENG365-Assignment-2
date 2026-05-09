import React from 'react';
import {Link,} from 'react-router-dom';
import { Card, CardContent, CardMedia, CardActionArea, Typography, Chip, Avatar } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

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

    const blogImageUrl = `${API_BASE}/blogs/${blog.blogId}/image`;
    const creatorImageUrl = `${API_BASE}/users/${blog.creatorId}/image`;
    const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;

    return (
        <Card style={{ width: 350 }}>
            <CardActionArea component={Link} to={`/blogs/${blog.blogId}`}>

                {/* Blog image */}
                {!imgError ? (
                    <CardMedia
                        component="img"
                        height="160"
                        image={blogImageUrl}
                        alt={blog.title}
                        onError={() => setImgError(true)}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ height: 160, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">No image</Typography>
                    </div>
                )}

                <CardContent>
                    {/* Title */}
                    <Typography variant="h6" gutterBottom>{blog.title}</Typography>

                    {/* Creator row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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

                    {/* City & date */}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {cityName} · {formatDate(blog.creationDate)}
                    </Typography>

                    {/* Categories */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {blog.categoryIds.map((id) => {
                            const name = categories.find((c) => c.categoryId === id)?.name ?? `Cat ${id}`;
                            return <Chip key={id} label={name} size="small" />;
                        })}
                    </div>

                    {/* Reaction count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbUpIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{blog.numReactions}</Typography>
                    </div>
                </CardContent>

            </CardActionArea>
        </Card>
    );
};

export default BlogCard;