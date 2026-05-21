import axios from 'axios';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, FormControlLabel } from "@mui/material";

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

const API_BASE = 'http://localhost:4941/api/v1';

const EditBlogPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const token = localStorage.getItem('token');

    const [title, setTitle] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [series, setSeries] = React.useState('');
    const [hasSeries, setHasSeries] = React.useState(false); // true if blog already has a series
    const [cityId, setCityId] = React.useState<number | ''>('');
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);

    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);
    const [removeImage, setRemoveImage] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [categoryOptions, setCategoryOptions] = React.useState<Category[]>([]);
    const [cityOptions, setCityOptions] = React.useState<City[]>([]);
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

            // Now set blog values — options are already loaded
            setTitle(blog.title);
            setDesc(blog.description);
            setCityId(blog.cityId);
            setSelectedCategoryIds(blog.categoryIds);
            if (blog.series) {
                setSeries(blog.series);
                setHasSeries(true);
            }
        });

        axios.get(`${API_BASE}/blogs/${id}/image`, { responseType: 'blob' })
            .then(() => setCurrentImageUrl(`${API_BASE}/blogs/${id}/image`))
            .catch(() => setCurrentImageUrl(null));
    }, [id]);

    const toggleCategory = (catId: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const previewUrl = imageFile
        ? URL.createObjectURL(imageFile)
        : (!removeImage && currentImageUrl) ? currentImageUrl : null;

    const handleSave = async () => {
        if (!title.trim() || !desc.trim() || !cityId || selectedCategoryIds.length === 0) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        const payload: any = {
            title,
            description: desc,
            cityId,
            categoryIds: selectedCategoryIds,
        };

        // Only include series if the blog didn't already have one
        if (!hasSeries && series.trim()) {
            payload.series = series;
        }

        try {
            await axios.patch(`${API_BASE}/blogs/${id}`, payload, {
                headers: { 'X-Authorization': token }
            });

            if (removeImage && !imageFile) {
                // No DELETE for blog images in the API spec — just skip
            } else if (imageFile) {
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
        <div className="form-page-wide">
            <h1>Edit Blog</h1>

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
                <label>Blog Image</label>
                {previewUrl
                    ? <img src={previewUrl} alt="Blog preview" className="form-image-preview-rect" />
                    : <div className="form-image-placeholder" style={{ borderRadius: 4 }}>No image</div>
                }
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    style={{ display: 'none' }}
                    onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); setRemoveImage(false); }}
                />
                <div className="form-actions">
                    <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                        {currentImageUrl || imageFile ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {(currentImageUrl || imageFile) && (
                        <Button variant="outlined" size="small" color="error" onClick={() => {
                            setImageFile(null);
                            setRemoveImage(true);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }}>
                            Remove Image
                        </Button>
                    )}
                </div>
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

            <div className="form-field">
                <label>Series {hasSeries ? '(cannot be changed once set)' : '(optional)'}</label>
                <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="e.g. Arts, Travel..."
                    disabled={hasSeries}
                />
            </div>

            <div className="form-actions">
                <Button variant="contained" onClick={handleSave}>Save Changes</Button>
                <Button variant="outlined" onClick={() => navigate(`/blogs/${id}`)}>Cancel</Button>
            </div>
        </div>
    );
};

export default EditBlogPage;