import axios from 'axios';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button, TextField, MenuItem, Checkbox, FormControlLabel,
    FormGroup, FormLabel, FormControl, FormHelperText
} from "@mui/material";
import useAuthStore from "../store/authStore.ts";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

const API_BASE = 'http://localhost:4941/api/v1';

const NewBlogPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = useAuthStore(state => state.token);
    const userId = useAuthStore(state => state.userId);

    const [title, setTitle] = React.useState(location.state?.title ?? '');
    const [desc, setDesc] = React.useState(location.state?.desc ?? '');
    const [series, setSeries] = React.useState(location.state?.series ?? '');
    const [cityId, setCityId] = React.useState<number | ''>('');
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);
    const [imageFile, setImageFile] = React.useState<File | null>(null);

    const [categoryOptions, setCategoryOptions] = React.useState<Category[]>([]);
    const [cityOptions, setCityOptions] = React.useState<City[]>([]);
    const [seriesOptions, setSeriesOptions] = React.useState<string[]>([]);

    const [titleError, setTitleError] = React.useState('');
    const [descError, setDescError] = React.useState('');
    const [cityError, setCityError] = React.useState('');
    const [categoryError, setCategoryError] = React.useState('');
    const [imageError, setImageError] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const formRef = React.useRef<HTMLFormElement>(null);

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleRemoveImage = () => {
        setImageFile(null);
        setImageError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    React.useEffect(() => {
        Promise.all([
            axios.get(`${API_BASE}/blogs/categories`),
            axios.get(`${API_BASE}/blogs/cities`),
            axios.get(`${API_BASE}/blogs`, { params: { creatorId: userId } }),
        ]).then(([cats, cities, blogs]) => {
            setCategoryOptions(cats.data);
            setCityOptions(cities.data);
            const userSeries = [...new Set(
                (blogs.data.blogs as any[])
                    .map(b => b.series)
                    .filter(Boolean)
            )] as string[];
            setSeriesOptions(userSeries);
        });

    }, [userId]);

    const toggleCategory = (id: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
        setCategoryError('');
    };

    const validate = () => {
        let valid = true;
        if (!title.trim()) { setTitleError('Title is required.'); valid = false; }
        else setTitleError('');
        if (!desc.trim()) { setDescError('Description is required.'); valid = false; }
        else setDescError('');
        if (!cityId) { setCityError('Please select a city.'); valid = false; }
        else setCityError('');
        if (selectedCategoryIds.length === 0) { setCategoryError('Please select at least one category.'); valid = false; }
        else setCategoryError('');
        if (!imageFile) { setImageError('A blog image is required.'); valid = false; }
        else setImageError('');
        return valid;
    };

    const handleNewBlog = () => {
        if (!validate()) return;

        const payload = {
            title,
            description: desc,
            cityId,
            categoryIds: selectedCategoryIds,
            ...(series.trim() && { series }),
        };

        axios.post(`${API_BASE}/blogs`, payload, {
            headers: { 'X-Authorization': token }
        })
            .then(async (res) => {
                const blogId = res.data.blogId;
                if (imageFile) {
                    await axios.put(`${API_BASE}/blogs/${blogId}/image`, imageFile, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': imageFile.type,
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
        <form ref={formRef} className="form-page-wide form-blog" noValidate>
            <h1>Write a new blog</h1>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            {/* Title */}
            <div className="form-field">
                <TextField
                    label="Title"
                    required
                    fullWidth
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
                    error={!!titleError}
                    helperText={titleError}
                />
            </div>

            {/* Description */}
            <div className="form-field">
                <TextField
                    label="Description"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    value={desc}
                    onChange={(e) => { setDesc(e.target.value); setDescError(''); }}
                    error={!!descError}
                    helperText={descError}
                />
            </div>

            {/* Image */}
            <div className="form-field">
                <FormControl error={!!imageError}>
                    <FormLabel required>Profile Image</FormLabel>

                    <div style={{ position: 'relative', marginTop: 8 }}>

                        {/* Show existing OR selected preview */}
                        {(imageFile) && (
                            <div style={{ marginBottom: 8 }}>
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="profile"
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        display: 'block'
                                    }}
                                />
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setImageFile(file);
                                setImageError('');
                            }}
                            style={{ width: '100%' }}
                        />

                        {(imageFile) && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                aria-label="Remove image"
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    lineHeight: '20px',
                                    background: '#e0e0e0',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {imageError && <FormHelperText>{imageError}</FormHelperText>}
                </FormControl>
            </div>

            {/* City */}
            <div className="form-field">
                <TextField
                    select
                    label="City"
                    required
                    fullWidth
                    value={cityId}
                    onChange={(e) => { setCityId(Number(e.target.value)); setCityError(''); }}
                    error={!!cityError}
                    helperText={cityError}
                >
                    <MenuItem value="">Select a city...</MenuItem>
                    {cityOptions.map((city) => (
                        <MenuItem key={city.cityId} value={city.cityId}>{city.name}</MenuItem>
                    ))}
                </TextField>
            </div>

            {/* Categories */}
            <div className="form-field">
                <FormControl error={!!categoryError} component="fieldset">
                    <FormLabel component="legend" required>Categories</FormLabel>
                    <FormGroup className="form-categories-grid">
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
                    </FormGroup>
                    {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
                </FormControl>
            </div>

            {/* Series */}
            <div className="form-field">
                <TextField
                    select
                    label="Existing series (optional)"
                    fullWidth
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                >
                    <MenuItem value="">None</MenuItem>
                    {seriesOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="New series name (optional)"
                    fullWidth
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    style={{ marginTop: 8 }}
                />
            </div>

            <div className="form-actions">
                <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
                <Button variant="contained" onClick={handleNewBlog}>Create Blog</Button>
            </div>
        </form>
    );
};

export default NewBlogPage;