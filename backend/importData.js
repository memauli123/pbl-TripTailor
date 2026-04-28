/**
 * Imports restaurant and monument data from JSON datasets into MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Restaurant = require('./models/Restaurant');
const Monument = require('./models/Monument');

async function importData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data first to prevent duplicates
        await Restaurant.deleteMany({});
        console.log('Cleared existing restaurants');
        await Monument.deleteMany({});
        console.log('Cleared existing monuments');

        // Import restaurants
        const restaurantsData = JSON.parse(fs.readFileSync('../datasets/restaurants.json', 'utf8'));
        await Restaurant.insertMany(restaurantsData, { ordered: false });
        console.log(`Restaurants imported: ${restaurantsData.length}`);

        // Import monuments
        const monumentsData = JSON.parse(fs.readFileSync('../datasets/monuments.json', 'utf8'));
        await Monument.insertMany(monumentsData, { ordered: false });
        console.log(`Monuments imported: ${monumentsData.length}`);

        console.log('✅ Data import completed successfully');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        mongoose.connection.close();
    }
}

importData();