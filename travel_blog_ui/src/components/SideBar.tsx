import React from 'react';
import {Typography, FormControlLabel, Checkbox, Divider, Button, TextField, IconButton} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE = 'http://localhost:4941/api/v1';

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

interface Props {
    selectedCategories: number[];
    selectedCities: number[];
    reactionLower: string;
    onUpdateReactions: (lo: string) => void;
    onToggleCategory: (id: number) => void;
    onToggleCity: (id: number) => void;
    onApply: () => void;
}

const SideBar = ({ selectedCategories, selectedCities, reactionLower, onToggleCategory, onToggleCity, onUpdateReactions, onApply}: Props) => {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [cityCollapsed, setCityCollapse] = React.useState(false);
    const [categoryCollapsed, setCategoryCollapse] = React.useState(false);
    const [reactionCollapsed, setReactionCollapse] = React.useState(false);

    React.useEffect(() => {
        fetch(`${API_BASE}/blogs/categories`).then(r => r.json()).then(setCategories);
    }, []);

    React.useEffect(() => {
        fetch(`${API_BASE}/blogs/cities`).then(r => r.json()).then(setCities)
    }, []);

    const selectAll = () => {
        categories.forEach(c => {
            if (!selectedCategories.includes(c.categoryId)) onToggleCategory(c.categoryId);
        });
        cities.forEach(c => {
            if (!selectedCities.includes(c.cityId)) onToggleCity(c.cityId);
        });
    };

    const deselectAll = () => {
        categories.forEach(c => {
            if (selectedCategories.includes(c.categoryId)) onToggleCategory(c.categoryId);
        });
        cities.forEach(c => {
            if (selectedCities.includes(c.cityId)) onToggleCity(c.cityId);
        });
    };

    return (
        <aside id="sidebar">
            <Button variant="contained" fullWidth style={{ marginBottom: 8, fontSize: 12 }} onClick={selectAll}>Select all</Button>
            <Button variant="contained" fullWidth style={{ marginBottom: 8, fontSize: 12 }} onClick={deselectAll}>Select none</Button>

            <Divider style={{ marginBottom: 8 }} />
            <div className="sidebar-section-header">
                <Typography variant="subtitle2">Categories</Typography>
                <IconButton onClick={() => setCategoryCollapse(p => !p)} size="small" style={{ transition: 'transform 0.3s ease', transform: categoryCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
            </div>
            <Divider style={{ marginBottom: 8 }} />
            {categoryCollapsed && (
                <div className="sidebar-checkbox-list">
                    {categories.map(cat => (
                        <FormControlLabel
                            key={cat.categoryId}
                            label={<span style={{ fontSize: 14 }}>{cat.name}</span>}
                            style={{ marginTop: -6, marginBottom: -6 }}
                            control={<Checkbox size="small" checked={selectedCategories.includes(cat.categoryId)} onChange={() => onToggleCategory(cat.categoryId)} />}
                        />
                    ))}
                </div>
            )}

            <Divider style={{ marginBottom: 8 }} />
            <div className="sidebar-section-header">
                <Typography variant="subtitle2">Cities</Typography>
                <IconButton onClick={() => setCityCollapse(p => !p)} size="small" style={{ transition: 'transform 0.3s ease', transform: cityCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
            </div>
            <Divider style={{ marginBottom: 8 }} />
            {cityCollapsed && (
                <div className="sidebar-checkbox-list">
                    {cities.map(city => (
                        <FormControlLabel
                            key={city.cityId}
                            label={<span style={{ fontSize: 14 }}>{city.name}</span>}
                            style={{ marginTop: -6, marginBottom: -6 }}
                            control={<Checkbox size="small" checked={selectedCities.includes(city.cityId)} onChange={() => onToggleCity(city.cityId)} />}
                        />
                    ))}
                </div>
            )}

            <Divider style={{ marginBottom: 8 }} />
            <div className="sidebar-section-header">
                <Typography variant="subtitle2">Reaction Count</Typography>
                <IconButton onClick={() => setReactionCollapse(p => !p)} size="small" style={{ transition: 'transform 0.3s ease', transform: reactionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
            </div>
            <Divider style={{ marginBottom: 8 }} />
            {reactionCollapsed && (
                <TextField type="number" label="Min reactions" size="small" value={reactionLower} onChange={(e) => onUpdateReactions(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} fullWidth />
            )}

            <Button variant="contained" fullWidth style={{ marginTop: 16, marginBottom: 20, fontSize: 12 }} onClick={onApply}>
                Apply
            </Button>
        </aside>
    );
};

export default SideBar;