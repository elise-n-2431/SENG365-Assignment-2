import axios from 'axios';
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { Button, Checkbox, FormControlLabel } from "@mui/material";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

const API_BASE = 'http://localhost:4941/api/v1';

const NewBlogPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [title, setTitle] = React.useState(location.state?.title ?? '');
    const [desc, setDesc] = React.useState(location.state?.desc ?? '');
    const [series, setSeries] = React.useState(location.state?.series ?? '');
    const [cityId, setCityId] = React.useState<number | ''>('');
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);

    const [categoryOptions, setCategoryOptions] = React.useState<Category[]>([]);
    const [cityOptions, setCityOptions] = React.useState<City[]>([]);

    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
        axios.get(`${API_BASE}/blogs/categories`).then((res) => setCategoryOptions(res.data));
        axios.get(`${API_BASE}/blogs/cities`).then((res) => setCityOptions(res.data));
    }, []); // ← empty array so it only runs once, not on every render

    const toggleCategory = (id: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleNewBlog = () => {
        if (!title.trim() || !desc.trim() || !cityId || selectedCategoryIds.length === 0) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }
        const token = localStorage.getItem('authToken');
        axios.post(`${API_BASE}/blogs`, {
            title,
            description: desc,
            cityId,
            categoryIds: selectedCategoryIds,
            ...(series.trim() && { series }),
        }, {
            headers: { 'X-Authorization': token }
        })
            .then(() => navigate('/'))
            .catch((err) => {
                setErrorMessage(err.response?.data?.message ?? 'Something went wrong.');
            });
    };

    return (
        <div style={{ padding: 20, maxWidth: 700, alignSelf: 'center' }}>
            <h1>Write a new blog</h1>

            {errorMessage && <div style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</div>}

            <div style={{ marginBottom: 8 }}>
                <label>Title</label><br />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: 8 }}>
                <label>Description</label><br />
                <textarea
                    value={desc}
                    rows={4}
                    cols={40}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: 8 }}>
                <label>City</label><br />
                <select
                    value={cityId}
                    onChange={(e) => setCityId(Number(e.target.value))}
                    style={{ width: '100%' }}
                >
                    <option value="">Select a city...</option>
                    {cityOptions.map((city) => (
                        <option key={city.cityId} value={city.cityId}>
                            {city.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: 8 }}>
                <label>Categories</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 4 }}>
                    {categoryOptions.map((cat) => (
                        <FormControlLabel
                            key={cat.categoryId}
                            label={cat.name}
                            control={
                                <Checkbox
                                    checked={selectedCategoryIds.includes(cat.categoryId)}
                                    onChange={() => toggleCategory(cat.categoryId)}
                                />
                            }
                        />
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: 8}}>
                <label>Series (optional)</label><br />
                <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="e.g. Arts, Travel..."
                    style={{ width: '100%' }}
                />
            </div>

            <Button variant="contained" style={{ margin: 8 }} onClick={handleNewBlog}>
                Create Blog
            </Button>
        </div>
    );
};

export default NewBlogPage;