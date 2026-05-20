import axios from 'axios';
import React from 'react';
import BlogCard from '../components/BlogCard';
import {Link} from "react-router-dom";

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

const MyBlogsPage = () => {
    const [blogs, setBlogs] = React.useState<Blog[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);

    // const [user, setUser] = React.useState<User | null>(null);
    const userId = localStorage.getItem("userId");



    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs`, { params: { creatorId: userId } })
        .then((res) => {
            setErrorFlag(false);
            setErrorMessage('');
            setBlogs(res.data.blogs);
        })
        .catch((err) => {
            setErrorFlag(true);
            setErrorMessage(err.toString());
        });
    }, []);

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
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 30 }}>
            <h3>Blogs</h3>
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




//     Filtering
};

export default MyBlogsPage;