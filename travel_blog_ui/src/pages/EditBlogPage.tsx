import axios from 'axios';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    MenuItem,
    TextField
} from "@mui/material";
import useAuthStore from "../store/authStore.ts";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

const API_BASE = 'http://localhost:4941/api/v1';

const EditBlogPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const token = useAuthStore(state => state.token);

    const [title, setTitle] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [series, setSeries] = React.useState('');
    const [hasSeries, setHasSeries] = React.useState(false);
    const [cityId, setCityId] = React.useState<number | ''>('');
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);

    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [categoryOptions, setCategoryOptions] = React.useState<Category[]>([]);
    const [cityOptions, setCityOptions] = React.useState<City[]>([]);

    const [titleError, setTitleError] = React.useState('');
    const [descError, setDescError] = React.useState('');
    const [cityError, setCityError] = React.useState('');
    const [categoryError, setCategoryError] = React.useState('');
    const [imageError, setImageError] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
        Promise.all([
            axios.get(`${API_BASE}/blogs/${id}`),
            axios.get(`${API_BASE}/blogs/categories`),
            axios.get(`${API_BASE}/blogs/cities`),
        ]).then(([blogRes, categoriesRes, citiesRes]) => {
            const blog = blogRes.data;
            setCategoryOptions(categoriesRes.data);
            setCityOptions(citiesRes.data);

            setTitle(blog.title);
            setDesc(blog.description);
            setCityId(blog.cityId);
            setSelectedCategoryIds(blog.categoryIds);
            if (blog.series) {
                setSeries(blog.series);
                setHasSeries(true);
            }
        });

        axios.get(`${API_BASE}/blogs/${id}/image`, {
            responseType: 'blob'
        })
            .then((res) => {
                const imageUrl = URL.createObjectURL(res.data);
                setImagePreviewUrl(imageUrl);
            })
            .catch(() => {
                setImagePreviewUrl(null);
            });
    }, [id]);

    const toggleCategory = (catId: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
        setCategoryError('');
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

        if (!imageFile && !imagePreviewUrl) {
            setImageError('A blog image is required.');
            valid = false;
        } else {
            setImageError('');
        }

        return valid;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validate()) return;

        const payload: any = {
            title,
            description: desc,
            cityId,
            categoryIds: selectedCategoryIds,
        };

        if (!hasSeries && series.trim()) {
            payload.series = series;
        }

        try {
            await axios.patch(`${API_BASE}/blogs/${id}`, payload, {
                headers: { 'X-Authorization': token }
            });

            if (imageFile) {
                await axios.put(`${API_BASE}/blogs/${id}/image`, imageFile, {
                    headers: {
                        'X-Authorization': token,
                        'Content-Type': imageFile.type,
                    }
                });
            }

            navigate(`/blogs/${id}`);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message ?? 'Something went wrong.');
        }
    };

    return (
        <form className="form-page-wide" noValidate onSubmit={handleSave}>
            <h1>Edit Blog</h1>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

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
                        <MenuItem key={city.cityId} value={city.cityId}>
                            {city.name}
                        </MenuItem>
                    ))}
                </TextField>
            </div>

            <div className="form-field">
                <FormControl error={!!imageError}>
                    <FormLabel required>Blog Image</FormLabel>

                    <div style={{ position: 'relative', marginTop: 8 }}>
                        {(imageFile || imagePreviewUrl) && (
                            <div style={{ marginBottom: 8 }}>
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : imagePreviewUrl!}
                                    alt="blog backdrop"
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

                        {(imageFile || imagePreviewUrl) && (
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

            <div className="form-field">
                <FormControl error={!!categoryError} component="fieldset">
                    <FormLabel component="legend" required style={{ marginBottom: 8 }}>Categories</FormLabel>
                    <div className="form-categories-grid">
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
                    {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
                </FormControl>
            </div>

            <div className="form-field">
                <TextField
                    label={`Series ${hasSeries ? '(cannot be changed once set)' : '(optional)'}`}
                    fullWidth
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    disabled={hasSeries}
                />
            </div>

            <div className="form-actions">
                <Button variant="contained" type="submit">Save Changes</Button>
                <Button variant="outlined" type="button" onClick={() => navigate(`/blogs/${id}`)}>Cancel</Button>
            </div>
        </form>
    );
};

export default EditBlogPage;