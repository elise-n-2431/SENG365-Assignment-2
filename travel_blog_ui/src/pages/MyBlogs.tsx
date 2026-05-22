import axios from 'axios';
import React from 'react';
import BlogCard from '../components/BlogCard';
import {Link} from "react-router-dom";
import useAuthStore from "../store/authStore.ts";

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
    relation: string;
}

const API_BASE = 'http://localhost:4941/api/v1';

const MyBlogsPage = () => {
    const userId = useAuthStore(state => state.userId);
    const token = useAuthStore(state => state.token);

    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [loading, setLoading] = React.useState(false);


    React.useEffect(() => {
        if (!userId || !token) { setBlogs([]); return; }

        setLoading(true);
        const headers = { 'X-Authorization': token };

        Promise.all([
            axios.get(`${API_BASE}/blogs`, { params: { creatorId: userId }, headers })
                .then(res => (res.data.blogs as Blog[]).map(b => ({ ...b, relation: 'Author' }))),

            axios.get(`${API_BASE}/blogs`, { headers })
                .then(async res => {
                    const allBlogs = res.data.blogs as Blog[];

                    const results = await Promise.all(
                        allBlogs.map(async b => {
                            const [reactionsRes, commentsRes] = await Promise.all([
                                axios.get(`${API_BASE}/blogs/${b.blogId}/react`, { headers }),
                                axios.get(`${API_BASE}/blogs/${b.blogId}/comments`, { headers }),
                            ]);

                            const hasReacted = reactionsRes.data
                                .some((r: any) => r.userId === userId);
                            const hasCommented = commentsRes.data
                                .some((c: any) => c.commenterId === userId);

                            if (hasReacted && hasCommented) return { ...b, relation: 'Commented' }; // Commented > Reacted
                            if (hasCommented) return { ...b, relation: 'Commented' };
                            if (hasReacted) return { ...b, relation: 'Reacted' };
                            return null;
                        })
                    );

                    return results.filter(Boolean) as Blog[];
                }),

            axios.get(`${API_BASE}/blogs/categories`, { headers }),
            axios.get(`${API_BASE}/blogs/cities`, { headers }),
        ])
            .then(([posted, commentedOrReacted, cats, cityList]) => {
                const priority: Record<string, number> = { Author: 3, Commented: 2, Reacted: 1 };
                const seen = new Map<number, Blog>();

                for (const blog of [...posted, ...commentedOrReacted]) {
                    const existing = seen.get(blog.blogId);
                    if (!existing || priority[blog.relation] > priority[existing.relation]) {
                        seen.set(blog.blogId, blog);
                    }
                }

                setBlogs(Array.from(seen.values()).sort((a, b) =>
                    new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
                ));
                setCategories(cats.data);
                setCities(cityList.data);
                setErrorFlag(false);
            })
            .catch(() => setErrorFlag(true))
            .finally(() => setLoading(false));
    }, [userId, token]);

    if (errorFlag) return <div>Failed to load activity.</div>;
    if (loading) return <div style={{ marginTop:60 }}>Loading...</div>;

    return (
        <div className="my-blogs-wrapper">
            <h1>MY ACTIVITY</h1>
            {!blogs.length && (
                <div>
                    <h6>No activity found.</h6>
                    <Link to="/" >Find blogs</Link>
                </div>
            )}
            <div className="my-blogs-grid">
                {blogs.map((b) => (
                    <Link key={b.blogId} to={`/blogs/${b.blogId}`} style={{ textDecoration: 'none' }}>
                        <BlogCard blog={b} categories={categories} cities={cities} relation={b.relation} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MyBlogsPage;