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
    const [imageFile, setImageFile] = React.useState<File | null>(null);

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
            setErrorMessage('Please fill in all required fields.'); // should have seperate error fields for diff fields
            return;
        }
        const token = localStorage.getItem('token');
        const payload = {
            title,
            description: desc,
            cityId,
            categoryIds: selectedCategoryIds,
            ...(series.trim() && { series }),
        };
        console.log('POST payload:', JSON.stringify(payload, null, 2));
        console.log('Types:', {
            title: typeof payload.title,
            description: typeof payload.description,
            cityId: typeof payload.cityId,
            categoryIds: `array of ${typeof payload.categoryIds[0]}`,
        });

        axios.post(`${API_BASE}/blogs`, payload, {
            headers: { 'X-Authorization': token }
        })
            .then(async (res) => {
                const blogId = res.data.blogId;

                // Upload image if one was selected
                if (imageFile) {
                    await axios.put(`${API_BASE}/blogs/${blogId}/image`, imageFile, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': imageFile.type,  // e.g. "image/png", "image/jpeg", "image/gif"
                        }
                    });
                }

                navigate('/');
            })
            .catch((err) => {
                setErrorMessage(err.response?.data?.message ?? 'Something went wrong.');
            });
    };

    return (
        <div className="form-page-wide">
            <h1>Write a new blog</h1>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <div className="form-field">
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-field">
                <label>Description</label>
                <textarea value={desc} rows={4} onChange={(e) => setDesc(e.target.value)} />
            </div>

            <div className="form-field">
                <label>Image (optional)</label>
                <input type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="form-field">
                <label>City</label>
                <select value={cityId} onChange={(e) => setCityId(Number(e.target.value))}>
                    <option value="">Select a city...</option>
                    {cityOptions.map((city) => (
                        <option key={city.cityId} value={city.cityId}>{city.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-field">
                <label>Categories</label>
                <div className="form-categories-grid">
                    {categoryOptions.map((cat) => (
                        <FormControlLabel
                            key={cat.categoryId}
                            label={cat.name}
                            control={<Checkbox checked={selectedCategoryIds.includes(cat.categoryId)} onChange={() => toggleCategory(cat.categoryId)} />}
                        />
                    ))}
                </div>
            </div>

            <div className="form-field">
                <label>Series (optional)</label>
                <input type="text" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="e.g. Arts, Travel..." />
            </div>

            <Button variant="contained" onClick={handleNewBlog}>Create Blog</Button>
        </div>
    );
};

export default NewBlogPage;