import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.PARTNER_PORT || 3005;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "partner-service" }));

// ── Mock Activities Data ─────────────────────────────────────────────────────
const MOCK_ACTIVITIES = [
    {
        id: "act-1",
        title: "Visite guidée du Jardin Majorelle",
        city: "Marrakech",
        country: "Maroc",
        price: 15,
        currency: "EUR",
        rating: 4.8,
        reviews: 1250,
        image_url: "https://images.unsplash.com/photo-1590001158193-7904d1efdf75?auto=format&fit=crop&w=800&q=80",
        description: "Découvrez l'oasis bleue d'Yves Saint Laurent au cœur de Marrakech.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/jardin-majorelle-balade-de-2-heures-t402633/"
    },
    {
        id: "act-2",
        title: "Balade à dos de chameau dans la Palmeraie",
        city: "Marrakech",
        country: "Maroc",
        price: 25,
        currency: "EUR",
        rating: 4.5,
        reviews: 850,
        image_url: "https://images.unsplash.com/photo-1542385151-efd9000782a6?auto=format&fit=crop&w=800&q=80",
        description: "Une expérience inoubliable au coucher du soleil dans les palmiers.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/marrakech-balade-a-dos-de-chameau-dans-la-palmeraie-t141753/"
    },
    {
        id: "act-3",
        title: "Excursion d'une journée aux Cascades d'Ouzoud",
        city: "Marrakech",
        country: "Maroc",
        price: 35,
        currency: "EUR",
        rating: 4.9,
        reviews: 2100,
        image_url: "https://images.unsplash.com/photo-1580637136009-548773950664?auto=format&fit=crop&w=800&q=80",
        description: "Admirez les plus hautes chutes d'eau d'Afrique du Nord.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/excursion-d-une-journee-aux-cascades-d-ouzoud-t32805/"
    },
    {
        id: "act-4",
        title: "Cours de cuisine marocaine traditionnelle",
        city: "Marrakech",
        country: "Maroc",
        price: 45,
        currency: "EUR",
        rating: 4.7,
        reviews: 420,
        image_url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        description: "Apprenez à cuisiner un vrai tajine dans un riad authentique.",
        booking_url: "https://www.getyourguide.fr/marrakech-l208/cours-de-cuisine-marocaine-a-marrakech-t44485/"
    }
];

// ── Endpoints ────────────────────────────────────────────────────────────────

app.get("/activities/search", (req, res) => {
    const { city } = req.query;
    console.log(`[partner-service] Searching activities for city: ${city}`);

    if (!city) {
        return res.json(MOCK_ACTIVITIES);
    }

    const results = MOCK_ACTIVITIES.filter(a =>
        a.city.toLowerCase() === (city as string).toLowerCase()
    );

    res.json(results);
});

app.listen(PORT, () => console.log(`[partner-service] running on port ${PORT}`));
