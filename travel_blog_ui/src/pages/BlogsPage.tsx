import axios from 'axios';
import React from 'react';
import BlogCard from '../components/BlogCard';

interface Category {
    categoryId: number;
    name: string;
}
interface City {
    cityId: number;
    name: string;
}

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
const PAGE_SIZE = 10;

const BlogsPage = () => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [total, setTotal] = React.useState(0);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const [search, setSearch] = React.useState('');
    const [sortBy, setSortBy] = React.useState('CREATED_DESC');
    const [page, setPage] = React.useState(1);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    React.useEffect(() => {
        const params: Record<string, string | number> = {
            sortBy,
            count: PAGE_SIZE,
            startIndex: (page - 1) * PAGE_SIZE,
        };
        if (search) params.q = search;

        axios.get(`${API_BASE}/blogs`, { params })
            .then((res) => {
                setErrorFlag(false);
                setErrorMessage('');
                setBlogs(res.data.blogs);   // <-- check this key matches the API response
                setTotal(res.data.count);   // <-- check this key matches the API response
            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.toString());
            });
    }, [search, sortBy, page]);

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/categories`).then((res) => setCategories(res.data));
        axios.get(`${API_BASE}/blogs/cities`).then((res) => setCities(res.data));
    }, []);

    if (errorFlag) {
        return (
            <div>
                <h1>Blogs</h1>
                <div style={{ color: 'red' }}>{errorMessage}</div>
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Blogs</h1>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    style={{ marginLeft: 8 }}
                >
                    <option value="CREATED_DESC">Newest first</option>
                    <option value="CREATED_ASC">Oldest first</option>
                    <option value="TITLE_ASC">Title A–Z</option>
                    <option value="TITLE_DESC">Title Z–A</option>
                    <option value="REACTIONS_ASC">Reactions (low → high)</option>
                    <option value="REACTIONS_DESC">Reactions (high → low)</option>
                </select>
            </div>

            {/* Blog list */}
            {blogs.length === 0 ? (
                <p>No blogs found.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {blogs.map((blog) => (
                        <BlogCard key={blog.blogId} blog={blog} categories={categories} cities={cities} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={{ marginTop: 16 }}>
                <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
                <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ marginLeft: 4 }}>Prev</button>
                <span style={{ margin: '0 8px' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={{ marginRight: 4 }}>Next</button>
                <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</button>
            </div>
        </div>
    );
};

export default BlogsPage;