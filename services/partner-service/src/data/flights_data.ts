export interface FlightRoute {
    id: string;
    airline: string;
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
    currency: string;
    type: "Direct" | "1 Escale";
    class: "Économie" | "Affaires" | "Première";
    booking_url: string;
}

export const FLIGHTS_REAL_DATA: FlightRoute[] = [
    {
        id: "fl-par-nyc-1",
        airline: "Air France",
        origin: "Paris",
        originCode: "CDG",
        destination: "New York",
        destinationCode: "JFK",
        departure: "2024-06-15T10:30:00",
        arrival: "2024-06-15T13:00:00",
        duration: "8h 30m",
        price: 850,
        currency: "EUR",
        type: "Direct",
        class: "Affaires",
        booking_url: "https://www.airfrance.fr/search-flights?from=CDG&to=JFK&date=2024-06-15"
    },
    {
        id: "fl-par-mar-1",
        airline: "Royal Air Maroc",
        origin: "Paris",
        originCode: "ORY",
        destination: "Marrakech",
        destinationCode: "RAK",
        departure: "2024-06-16T14:20:00",
        arrival: "2024-06-16T17:35:00",
        duration: "3h 15m",
        price: 245,
        currency: "EUR",
        type: "Direct",
        class: "Économie",
        booking_url: "https://www.royalairmaroc.com/fr-fr/booking/select-flight"
    },
    {
        id: "fl-dub-lon-1",
        airline: "Emirates",
        origin: "Dubaï",
        originCode: "DXB",
        destination: "Londres",
        destinationCode: "LHR",
        departure: "2024-06-17T09:15:00",
        arrival: "2024-06-17T14:10:00",
        duration: "7h 55m",
        price: 1200,
        currency: "EUR",
        type: "Direct",
        class: "Première",
        booking_url: "https://www.emirates.com/fr/french/book/"
    },
    {
        id: "fl-tok-par-1",
        airline: "Japan Airlines",
        origin: "Tokyo",
        originCode: "HND",
        destination: "Paris",
        destinationCode: "CDG",
        departure: "2024-06-18T22:50:00",
        arrival: "2024-06-19T06:30:00",
        duration: "14h 40m",
        price: 1550,
        currency: "EUR",
        type: "Direct",
        class: "Affaires",
        booking_url: "https://www.jal.co.jp/fr/fr/"
    }
];
