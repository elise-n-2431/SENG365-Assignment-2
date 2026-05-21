import axios from 'axios';
import React from 'react';
import BlogCard from '../components/BlogCard';
import SideBar from "../components/SideBar.tsx";
import { FormControl, Select, MenuItem, TextField, Button } from '@mui/material';

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

    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
    const [selectedCities, setSelectedCities] = React.useState<number[]>([]);

    const toggleCategory = (id: number) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleCity = (id: number) => {
        setSelectedCities(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const [lowerBound, setLowerBound] = React.useState('');
    const [appliedCategories, setAppliedCategories] = React.useState<number[]>([]);
    const [appliedCities, setAppliedCities] = React.useState<number[]>([]);
    const [appliedLower, setAppliedLower] = React.useState(0);

    const onUpdateReactions = (lo: string) => {
        setLowerBound(lo);
    };

    const applyFilters = () => {
        setAppliedCategories(selectedCategories);
        setAppliedCities(selectedCities);
        setAppliedLower(lowerBound === '' ? 0 : Math.max(0, parseInt(lowerBound)));
        setPage(1);
    };



    React.useEffect(() => {
        const params: Record<string, any> = {
            sortBy,
            count: 99999, // fetch all so we can filter client-side
            startIndex: 0,
        };
        if (search) params.q = search;
        if (appliedCategories.length > 0) params.categoryIds = appliedCategories;
        if (appliedCities.length > 0) params.cityIds = appliedCities;

        axios.get(`${API_BASE}/blogs`, {
            params,
            paramsSerializer: p =>
                new URLSearchParams(
                    Object.entries(p).flatMap(([k, v]) =>
                        Array.isArray(v) ? v.map(i => [k, String(i)]) : [[k, String(v)]]
                    )
                ).toString()
        })
            .then((res) => {
                setErrorFlag(false);
                setErrorMessage('');
                const filtered = appliedLower > 0
                    ? res.data.blogs.filter((b: Blog) => b.numReactions >= appliedLower)
                    : res.data.blogs;

                const startIndex = (page - 1) * PAGE_SIZE;
                setBlogs(filtered.slice(startIndex, startIndex + PAGE_SIZE));
                setTotal(filtered.length);
            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.toString());
            });
    }, [search, sortBy, page, appliedCategories, appliedCities, appliedLower]);

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/categories`).then((res) => {
            setCategories(res.data);
            setSelectedCategories(res.data.map((cat: Category) => cat.categoryId));
        });
        axios.get(`${API_BASE}/blogs/cities`).then((res) => {
            setCities(res.data);
            setSelectedCities(res.data.map((city: City) => city.cityId));
        });
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
        <div style={{ display: 'flex' }}>
            <SideBar
                selectedCategories={selectedCategories}
                selectedCities={selectedCities}
                reactionLower={lowerBound}
                onToggleCategory={toggleCategory}
                onToggleCity={toggleCity}
                onUpdateReactions={onUpdateReactions}
                onApply={applyFilters}
            />
            <main className="blogs-main">
                <h1>BLOGS</h1>

                <div className="blogs-search-bar">
                    <TextField
                        label="Search blogs"
                        value={search}
                        size="small"
                        style={{ flex: 1 }}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <FormControl size="small" style={{ marginLeft: 8, width: 150 }}>
                        <Select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        >
                            <MenuItem value="CREATED_DESC">Newest first</MenuItem>
                            <MenuItem value="CREATED_ASC">Oldest first</MenuItem>
                            <MenuItem value="TITLE_ASC">Title A–Z</MenuItem>
                            <MenuItem value="TITLE_DESC">Title Z–A</MenuItem>
                            <MenuItem value="REACTIONS_ASC">Reactions (low → high)</MenuItem>
                            <MenuItem value="REACTIONS_DESC">Reactions (high → low)</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="blogs-list-wrapper">
                    {blogs.length === 0 ? (
                        <p className="blogs-empty">No blogs found.</p>
                    ) : (
                        <div className="blogs-grid">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.blogId} blog={blog} categories={categories} cities={cities} />
                            ))}
                        </div>
                    )}

                    <div className="blogs-pagination">
                        <Button className="btn-secondary" size="small" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
                        <Button className="btn-secondary" size="small" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</Button>
                        <span>Page {page} of {totalPages}</span>
                        <Button className="btn-secondary" size="small" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</Button>
                        <Button className="btn-secondary" size="small" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogsPage;