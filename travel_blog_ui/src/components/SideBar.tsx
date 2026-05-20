import React from 'react';
import {Typography, FormControlLabel, Checkbox, Divider, Button, TextField} from '@mui/material';

const API_BASE = 'http://localhost:4941/api/v1';

interface Category { categoryId: number; name: string; }
interface City { cityId: number; name: string; }

interface Props {
    selectedCategories: number[];
    selectedCities: number[];
    reactionLower: string;
    onUpdateReactions: (lo: string) => void;
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
        fetch(`${API_BASE}/blogs/cities`).then(r => r.json()).then(setCities);
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
        <aside style={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid #ccc',
            padding: '16px',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
        }}>
            <Button variant="contained" style={{ margin: 8 }} onClick={selectAll}>Select all</Button>
            <Button variant="contained" style={{ margin: 8 }} onClick={deselectAll}>Select none</Button>

            <Button variant="contained" style={{ margin: 8 }} onClick={() => setCategoryCollapse(p => !p)}>
                {categoryCollapsed ? 'Show Categories' : 'Hide Categories'}
            </Button>
            {!categoryCollapsed && (
                <>
                    <Divider style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2" gutterBottom>Categories</Typography>
                    <Divider style={{ marginBottom: 8 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {categories.map(cat => (
                            <FormControlLabel
                                key={cat.categoryId}
                                label={cat.name}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedCategories.includes(cat.categoryId)}
                                        onChange={() => onToggleCategory(cat.categoryId)}
                                    />
                                }
                            />
                        ))}
                    </div>
                </>
            )}

            <Button variant="contained" style={{ margin: 8 }} onClick={() => setCityCollapse(p => !p)}>
                {cityCollapsed ? 'Show Cities' : 'Hide Cities'}
            </Button>
            {!cityCollapsed && (
                <>
                    <Divider style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2" gutterBottom>Cities</Typography>
                    <Divider style={{ marginBottom: 8 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {cities.map(city => (
                            <FormControlLabel
                                key={city.cityId}
                                label={city.name}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedCities.includes(city.cityId)}
                                        onChange={() => onToggleCity(city.cityId)}
                                    />
                                }
                            />
                        ))}
                    </div>
                </>
            )}

            <Button variant="contained" style={{ margin: 8 }} onClick={() => setReactionCollapse(p => !p)}>
                {reactionCollapsed ? 'Show Reactions' : 'Hide Reactions'}
            </Button>
            {!reactionCollapsed && (
                <>
                    <Divider style={{ marginBottom: 8 }} />
                    <Typography variant="subtitle2" gutterBottom>Reaction Count</Typography>
                    <Divider style={{ marginBottom: 8 }} />
                    <TextField
                        type="number"
                        label="Min reactions"
                        size="small"
                        value={reactionLower}
                        onChange={(e) => onUpdateReactions(e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        fullWidth
                    />
                </>
            )}

            <Button variant="contained" fullWidth style={{ marginTop: 16 }} onClick={onApply}>
                Apply
            </Button>
        </aside>
    );
};

export default SideBar;