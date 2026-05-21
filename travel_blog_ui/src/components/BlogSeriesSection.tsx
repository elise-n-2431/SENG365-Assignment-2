import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';

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

const BlogSeries = ({ id }: { id: number }) => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs`, { params: { creatorId: id } })
            .then((res) => setBlogs(res.data.blogs))
            .catch(() => setErrorFlag(true));
        axios.get(`${API_BASE}/blogs/categories`).then((res) => setCategories(res.data));
        axios.get(`${API_BASE}/blogs/cities`).then((res) => setCities(res.data));
    }, [id]);

    if (errorFlag) return <div>Failed to load blogs.</div>;
    if (!blogs.length) return <div>No blogs yet.</div>;

    // Group blogs by series name, null series goes into 'No Series'
    const grouped = new Map<string, Blog[]>();
    for (const blog of blogs) {
        const key = blog.series ?? 'No Series';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(blog);
    }

    // Sort each group newest to oldest
    for (const group of grouped.values()) {
        group.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }

    // Sort series alphabetically, with 'No Series' always last
    const sortedKeys = [...grouped.keys()]
        .filter((k) => k !== 'No Series')
        .sort();
    if (grouped.has('No Series')) sortedKeys.push('No Series');

    return (
        <div className="blog-series-wrapper">
            {sortedKeys.map((seriesName) => (
                <div key={seriesName} className="blog-series-group">
                    <h3>{seriesName}</h3>
                    <div className="blog-series-grid">
                        {grouped.get(seriesName)!.map((blog) => (
                            <Link key={blog.blogId} to={`/blogs/${blog.blogId}`} style={{ textDecoration: 'none' }}>
                                <BlogCard blog={blog} categories={categories} cities={cities} />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BlogSeries;