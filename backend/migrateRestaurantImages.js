/** Maps cuisines to image URLs */

require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');

/** Mapping of cuisine types to representative image URLs */
const CUISINE_IMAGES = {
    "North Indian":        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Chinese":             "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    "Continental":         "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Fast Food":           "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    "Italian":             "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    "Desserts":            "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
    "Seafood":             "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    "South Indian":        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    "Asian":               "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    "Mughlai":             "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Mexican":             "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    "Finger Food":         "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
    "Oriental":            "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    "Shakes":              "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
    "Pizza":               "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    "Thai":                "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    "Bakery and Confectionary": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
    "Ice Cream":           "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=80",
    "European":            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "American":            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    "Coffee":              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    "Biryani":             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
    "Street Food":         "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    "Tea":                 "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
    "Barbecue":            "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
    "Japanese":            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    "Mediterranean":       "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80",
    "Health Food":         "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Mithai":              "https://images.unsplash.com/photo-1611272964423-e11ecf51c0f5?w=800&q=80",
    "Waffle":              "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80",
    "Tibetan":             "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    "Drinks":              "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    "Andhra":              "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    "Modern Indian":       "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Bengali":             "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    "Gujarati":            "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    "Kerala":              "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
    "Tex Mex":             "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    "Lebanese":            "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80",
    "Arabian":             "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80",
    "Sushi":               "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80",
    "Goan":                "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    "Burger":              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    "Maharashtrian":       "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Rajasthani":          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Doughnuts":           "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    "Juice":               "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
    "Indian Cuisine":      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Hyderabadi":          "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
    "Sizzlers":            "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
    "Korean":              "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
    "Fusion":              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Chettinad":           "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    "Malvani":             "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    "Chaat":               "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    "Malaysian":           "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    "Coastal":             "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    "Awadhi":              "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "French":              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Punjabi":             "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80",
    "Sandwich":            "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
    "Cafe":                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    "Vegan":               "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Vegetarian":          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Cantonese":           "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    "Burmese":             "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    "Western":             "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Assamese":            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Greek":               "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80",
    "Middle Eastern":      "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80",
    "Nepalese":            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "German":              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Iranian":             "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80",
    "Mangalorean":         "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    "Deli":                "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
    "Turkish":             "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80",
    "Lucknowi":            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Portuguese":          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Parsi":               "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Kashmiri":            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "Spanish":             "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "South American":      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    "African":             "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "Vietnamese":          "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    "Multi-Cuisine":       "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "World Cuisine":       "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

/** Generic cuisine labels to skip in first pass - prefer specific cuisines */
const GENERIC = new Set(["Multi-Cuisine", "World Cuisine", "Fusion", "Continental", "European", "Western", "Health Food"]);
/** Fallback image URL if no cuisine match found */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80";

/**
 * Get appropriate image URL for a restaurant based on its cuisines
 * @param {Array<string>} cuisines - Array of cuisine types
 * @returns {string} Image URL for the cuisine
 */
function getImageForCuisines(cuisines) {
    if (!cuisines || cuisines.length === 0) return FALLBACK_IMAGE;
    // First pass: look for specific (non-generic) cuisines
    for (const c of cuisines) {
        if (!GENERIC.has(c) && CUISINE_IMAGES[c]) return CUISINE_IMAGES[c];
    }
    // Second pass: accept generic
    for (const c of cuisines) {
        if (CUISINE_IMAGES[c]) return CUISINE_IMAGES[c];
    }
    return FALLBACK_IMAGE;
}

/**
 * Migration function: updates all restaurant documents with image URLs
 * Connects to MongoDB, determines best image for each restaurant
 * Uses bulk write operations for efficiency
 */
async function migrate() {
    try {
        // Connect to MongoDB 
        await mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 30000,
});
        console.log('Connected to MongoDB');

        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants — updating all imageurl fields...`);

        const bulkOps = restaurants.map(r => ({
            updateOne: {
                filter: { _id: r._id },
                update: { $set: { imageurl: getImageForCuisines(r.Cuisine) } }
            }
        }));

        const result = await Restaurant.bulkWrite(bulkOps);
        console.log(`✅ Done! Modified ${result.modifiedCount} restaurant records.`);
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        mongoose.connection.close();
    }
}

migrate();
