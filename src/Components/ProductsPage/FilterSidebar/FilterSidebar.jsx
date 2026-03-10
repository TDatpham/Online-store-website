import { useTranslation } from "react-i18next";
import s from "./FilterSidebar.module.scss";

const FilterSidebar = ({
    filters,
    setFilters,
    categories = [],
    availableColors = []
}) => {
    const { t } = useTranslation();

    const handleCategoryChange = (category) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];
        setFilters({ ...filters, categories: newCategories });
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const toggleColor = (color) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter(c => c !== color)
            : [...filters.colors, color];
        setFilters({ ...filters, colors: newColors });
    };

    const resetFilters = () => {
        setFilters({
            categories: [],
            minPrice: "",
            maxPrice: "",
            colors: []
        });
    };

    return (
        <aside className={s.sidebar}>
            <h3>{t("productsPage.filterTitle") || "Filters"}</h3>

            <div className={s.filterSection}>
                <h4>{t("productsPage.filterCategory") || "Categories"}</h4>
                <div className={s.categoryList}>
                    {categories.map((cat) => (
                        <label key={cat}>
                            <input
                                type="checkbox"
                                checked={filters.categories.includes(cat)}
                                onChange={() => handleCategoryChange(cat)}
                            />
                            {cat}
                        </label>
                    ))}
                </div>
            </div>

            <div className={s.filterSection}>
                <h4>{t("productsPage.filterPrice") || "Price Range"}</h4>
                <div className={s.priceRange}>
                    <div className={s.inputs}>
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={handlePriceChange}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={handlePriceChange}
                        />
                    </div>
                </div>
            </div>

            <div className={s.filterSection}>
                <h4>{t("productsPage.filterColor") || "Colors"}</h4>
                <div className={s.colorList}>
                    {availableColors.map((color) => (
                        <div
                            key={color}
                            className={`${s.colorOption} ${filters.colors.includes(color) ? s.active : ""}`}
                            style={{ backgroundColor: color }}
                            onClick={() => toggleColor(color)}
                            title={color}
                        >
                            {filters.colors.includes(color) && <span className={s.check}>✓</span>}
                        </div>
                    ))}
                </div>
            </div>

            <button className={s.resetBtn} onClick={resetFilters}>
                {t("productsPage.resetFilters") || "Reset Filters"}
            </button>
        </aside>
    );
};

export default FilterSidebar;
