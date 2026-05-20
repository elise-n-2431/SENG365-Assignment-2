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


const SimilarBlogs = ({ blog }: { blog: Blog }) => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);

    React.useEffect(() => {
        const requests = [
            axios.get(`${API_BASE}/blogs`, { params: { creatorId: blog.creatorId } }),
            axios.get(`${API_BASE}/blogs`, { params: { categoryIds: blog.categoryIds } }),
            axios.get(`${API_BASE}/blogs`, { params: { cityId: blog.cityId } }),
            axios.get(`${API_BASE}/blogs/categories`),
            axios.get(`${API_BASE}/blogs/cities`),
        ];

        Promise.all(requests)
            .then(([byCreator, byCategory, byCity, cats, cityList]) => {
                const seen = new Set<number>();
                const merged: (Blog & { score: number })[] = [];

                for (const b of [...byCreator.data.blogs, ...byCategory.data.blogs, ...byCity.data.blogs]) {
                    if (!seen.has(b.blogId) && b.blogId !== blog.blogId) {
                        seen.add(b.blogId);

                        // Count how many things this blog has in common
                        let score = 0;
                        if (b.creatorId === blog.creatorId) score++;
                        if (b.cityId === blog.cityId) score++;
                        if (b.categoryIds.some((id: number) => blog.categoryIds.includes(id))) score++;

                        merged.push({ ...b, score });
                    }
                }

                // Sort by score, with a random tiebreaker so same-score blogs aren't always in the same order
                merged.sort((a, b) => b.score - a.score || Math.random() - 0.5);

                setBlogs(merged.slice(0, 4));
                setCategories(cats.data);
                setCities(cityList.data);
            })
            .catch(() => setErrorFlag(true));
    }, [blog.blogId]);

    if (errorFlag) return <div>Failed to load similar blogs.</div>;
    if (!blogs.length) return <div>No similar blogs found.</div>;

    return (
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 30 }}>
            <h3>Similar Blogs</h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                width: '90%',
                margin: '0 auto',
            }}>
                {blogs.map((b) => (
                    <Link key={b.blogId} to={`/blogs/${b.blogId}`} style={{ textDecoration: 'none' }}>
                        <BlogCard blog={b} categories={categories} cities={cities} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarBlogs;