import axios from 'axios';
import React from 'react';
import BlogCard from '../components/BlogCard';
import SideBar from "../components/SideBar.tsx";

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

    const [lowerBound, setLowerBound] = React.useState(0);
    const [upperBound, setUpperBound] = React.useState(100);

    const [appliedCategories, setAppliedCategories] = React.useState<number[]>([]);
    const [appliedCities, setAppliedCities] = React.useState<number[]>([]);
    const [appliedLower, setAppliedLower] = React.useState(0);
    const [appliedUpper, setAppliedUpper] = React.useState(100);

    const applyFilters = () => {
        setAppliedCategories(selectedCategories);
        setAppliedCities(selectedCities);
        setAppliedLower(lowerBound);
        setAppliedUpper(upperBound);
        setPage(1);
    };

    React.useEffect(() => {
        const params: Record<string, any> = {
            sortBy,
            count: PAGE_SIZE,
            startIndex: (page - 1) * PAGE_SIZE,
        };
        if (search) params.q = search;
        if (appliedCategories.length > 0) params.categoryIds = appliedCategories;
        if (appliedCities.length > 0) params.cityIds = appliedCities;

        axios.get(`${API_BASE}/blogs`, { params, paramsSerializer: p =>
                new URLSearchParams(
                    Object.entries(p).flatMap(([k, v]) =>
                        Array.isArray(v) ? v.map(i => [k, String(i)]) : [[k, String(v)]]
                    )
                ).toString()
        })
            .then((res) => {
                setErrorFlag(false);
                setErrorMessage('');
                setBlogs(res.data.blogs);
                setTotal(res.data.count);
            })
            .catch((err) => {
                setErrorFlag(true);
                setErrorMessage(err.toString());
            });
    }, [search, sortBy, page, appliedCategories, appliedCities, appliedLower, appliedUpper]);

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
        <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            <SideBar selectedCategories={selectedCategories}
                     selectedCities={selectedCities}
                     reactionLower = {0}
                     reactionUpper = {100}
                     onToggleCategory={toggleCategory}
                     onToggleCity={toggleCity}
                     onUpdateLower={setLowerBound}
                     onUpdateUpper={setUpperBound}
                     onApply={applyFilters}/>
            <main style={{ flex: 1, padding: '20px' }}>
                <h1>Blogs</h1>

                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
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
            </main>
        </div>
    );

//     Filtering
};

export default BlogsPage;