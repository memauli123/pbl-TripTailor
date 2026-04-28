const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Monument = require('../models/Monument');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const { query, type, city, category } = req.query;
        let queryRes = {};
        let queryMon = {};

        if (query) {
            queryRes.$or = [
                { Name: new RegExp(query, 'i') },
                { City: new RegExp(query, 'i') }
            ];
            queryMon.$or = [
                { name: new RegExp(query, 'i') },
                { city: new RegExp(query, 'i') }
            ];
        }

        if (city) {
            queryRes.City = new RegExp(city, 'i');
            queryMon.city = new RegExp(city, 'i');
        }

        if (category) {
            const categoryMap = {
                'historical': ['Monument', 'Fort', 'Palace', 'Temple', 'Museum'],
                'nature': ['National Park', 'Wildlife Sanctuary', 'Hill Station', 'Beach', 'Lake'],
                'religious': ['Temple', 'Mosque', 'Church', 'Gurudwara', 'Shrine'],
                'adventure': ['Hill Station', 'National Park', 'Fort', 'Adventure Sport'],
                'food': [],
                'shopping': ['Market', 'Bazaar', 'Mall']
            };

            if (categoryMap[category] && categoryMap[category].length > 0) {
                queryMon.type = { $in: categoryMap[category] };
            }
        }

        let restaurants = [];
        let monuments = [];

        if (category === 'food') {
            restaurants = await Restaurant.find(queryRes).limit(20);
        } else {
            if (!type || type === 'all' || type === 'restaurants') {
                restaurants = await Restaurant.find(queryRes).limit(20);
            }
            if (!type || type === 'all' || type === 'monuments') {
                monuments = await Monument.find(queryMon).limit(20);
            }
        }

        res.json({ restaurants, monuments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/top-cities', async (req, res) => {
    try {
        const topCities = await Monument.aggregate([
            // Sort by rating first so $first picks the best image per city
            { $sort: { reviewrating: -1 } },
            {
                $group: {
                    _id: '$city',
                    avgRating: { $avg: '$reviewrating' },
                    count: { $sum: 1 },
                    // $first now picks the highest-rated monument's image for that city
                    imageurl: { $first: '$imageurl' }
                }
            },
            {
                $match: {
                    _id: { $nin: ['Kolhapur', null, ''] },
                    imageurl: { $exists: true, $ne: '' }
                }
            },
            { $sort: { count: -1, avgRating: -1 } },
            { $limit: 10 },
            {
                $project: {
                    city: '$_id',
                    avgRating: 1,
                    count: 1,
                    imageurl: 1,
                    _id: 0
                }
            }
        ]);

        const shuffled = topCities.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        res.json(selected);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/cities', async (req, res) => {
    try {
        const cities = await Monument.distinct('city');
        res.json(cities.sort());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/save/:id', auth, async (req, res) => {
    try {
        const itemId = req.params.id;
        const user = await User.findById(req.user.id);

        const monument = await Monument.findById(itemId);
        const restaurant = await Restaurant.findById(itemId);

        if (monument) {
            if (!user.savedDestinations.includes(itemId)) {
                user.savedDestinations.push(itemId);
                await user.save();
            }
        } else if (restaurant) {
            if (!user.savedRestaurants.includes(itemId)) {
                user.savedRestaurants.push(itemId);
                await user.save();
            }
        } else {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item saved successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/save/:id', auth, async (req, res) => {
    try {
        const itemId = req.params.id;
        const user = await User.findById(req.user.id);

        const monument = await Monument.findById(itemId);
        const restaurant = await Restaurant.findById(itemId);

        if (monument) {
            user.savedDestinations = user.savedDestinations.filter(id => id.toString() !== itemId);
        } else if (restaurant) {
            user.savedRestaurants = user.savedRestaurants.filter(id => id.toString() !== itemId);
        } else {
            return res.status(404).json({ message: 'Item not found' });
        }

        await user.save();
        res.json({ message: 'Item unsaved successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;