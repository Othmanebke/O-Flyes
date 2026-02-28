import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'travel-engine' });
});

// 🌍 EXPLORE / PACK BUILDER
app.post('/explore/packs', (req, res) => {
    const { destination, dates, budget, pax, trip_id } = req.body;

    if (!destination || !budget) {
        return res.status(400).json({ error: "Destination et budget sont requis." });
    }

    const baseBudget = Number(budget);

    // Logic pour générer 3 packs
    const generatePack = (type: 'eco' | 'confort' | 'premium') => {
        let multiplier = 1;
        let hotelStars = 2;
        if (type === 'confort') { multiplier = 1.5; hotelStars = 4; }
        if (type === 'premium') { multiplier = 2.5; hotelStars = 5; }

        const flightPrice = Math.floor(200 * multiplier);
        const hotelPrice = Math.floor(baseBudget * 0.4 * multiplier);
        const activityPrice = Math.floor(baseBudget * 0.2 * multiplier);

        return {
            type,
            flight: {
                title: `Vol AR pour ${destination}`,
                price: flightPrice,
                provider: type === 'premium' ? 'Air France' : 'Ryanair'
            },
            hotel: {
                name: `${destination} ${type.charAt(0).toUpperCase() + type.slice(1)} Resort`,
                price: hotelPrice,
                stars: hotelStars
            },
            activities: [
                { title: "Visite guidée centre ville", price: activityPrice / 2 },
                { title: type === 'premium' ? "Dîner gastronomique" : "Dîner local", price: activityPrice / 2 }
            ],
            total_price: flightPrice + hotelPrice + activityPrice,
            currency: "EUR"
        };
    };

    const packs = {
        eco: generatePack('eco'),
        confort: generatePack('confort'),
        premium: generatePack('premium')
    };

    res.json({
        trip_id,
        destination,
        packs
    });
});

if (process.env.IS_MONOLITH !== "true") {
    app.listen(PORT, () => {
        console.log(`[travel-engine] running on port ${PORT}`);
    });
}

export default app;
