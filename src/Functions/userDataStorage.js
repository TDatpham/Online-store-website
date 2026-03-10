/**
 * Utility: per-user localStorage storage for user-specific data like favorites and wishlist.
 * Data is stored under keys: "userFavorites_{userId}" and "userWishList_{userId}"
 */

/**
 * Returns the localStorage key for a user-specific data type.
 * @param {string} type - "favoritesProducts" or "wishList"
 * @param {string|number} userId - The user's unique ID
 */
export function getUserDataKey(type, userId) {
    return `${type}_${userId}`;
}

/**
 * Load user-specific array (favorites or wishlist) from localStorage.
 * @param {string} type - "favoritesProducts" or "wishList"
 * @param {string|number} userId - The user's unique ID
 * @returns {Array} - Array of products, or empty array if none found
 */
export function loadUserData(type, userId) {
    if (!userId) return [];
    try {
        const key = getUserDataKey(type, userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save user-specific array (favorites or wishlist) to localStorage.
 * @param {string} type - "favoritesProducts" or "wishList"
 * @param {string|number} userId - The user's unique ID
 * @param {Array} data - Array of products to save
 */
export function saveUserData(type, userId, data) {
    if (!userId) return;
    try {
        const key = getUserDataKey(type, userId);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save user data to localStorage:", e);
    }
}
