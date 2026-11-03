(function () {
  const D = [
    ["t1","Marrakech","Maroc","Afrique","RAK","Essentiel",650,900,80,35,["Mars","Avr","Oct","Nov"],"10 – 14 jours",4.7,["Culture","Gastronomie","Aventure"],"Cité impériale, souks et riads. Vol depuis Paris dès 80 €, riads abordables."],
    ["t2","Lisbonne","Portugal","Europe","LIS","Confort",1400,1900,60,90,["Avr","Mai","Juin","Sept"],"10 – 14 jours",4.8,["Culture","Gastronomie","Plage"],"Azulejos, fado et océan à 2 h 30 de Paris. L'un des meilleurs rapports qualité-prix d'Europe."],
    ["t3","Bali","Indonésie","Asie","DPS","Confort",1600,2400,400,40,["Avr","Mai","Juin","Sept","Oct"],"14 – 21 jours",4.9,["Plage","Nature","Bien-être"],"Rizières, temples et surf. Villas avec piscine dès 40 € la nuit."],
    ["t4","Medellín","Colombie","Amérique","MDE","Confort",1700,2300,560,35,["Déc","Jan","Fév","Juil"],"14 – 21 jours",4.6,["Culture","Aventure","Nature"],"22 °C toute l'année à 1 500 m d'altitude. Métropole culturelle et fleurie."],
    ["t5","Queenstown","Nouvelle-Zélande","Océanie","ZQN","Premium",4200,5500,900,120,["Nov","Déc","Jan","Fév"],"14 – 21 jours",4.8,["Aventure","Nature"],"Fjords, ski et sports extrêmes au bord du lac Wakatipu."],
    ["b1","Budapest","Hongrie","Europe","BUD","Essentiel",800,1200,50,45,["Avr","Mai","Juin","Sept"],"7 – 10 jours",4.6,["Culture","Bien-être","Gastronomie"],"Bains thermaux, ruin bars et architecture austro-hongroise."],
    ["b2","Tbilissi","Géorgie","Europe","TBS","Essentiel",750,1100,120,30,["Avr","Mai","Sept","Oct"],"10 – 14 jours",4.5,["Culture","Gastronomie","Aventure"],"Façades sculptées, vins naturels et gorges du Caucase."],
    ["b3","Chiang Mai","Thaïlande","Asie","CNX","Essentiel",950,1400,350,20,["Nov","Déc","Jan","Fév"],"14 – 21 jours",4.7,["Culture","Nature","Bien-être"],"Temples, jungle et massages traditionnels à petit prix."],
    ["b4","Hanoï","Vietnam","Asie","HAN","Essentiel",900,1300,380,18,["Oct","Nov","Déc","Mars"],"14 – 21 jours",4.5,["Culture","Gastronomie","Aventure"],"Vieux quartier, baie d'Halong et cuisine de rue."],
    ["b5","Cracovie","Pologne","Europe","KRK","Essentiel",700,1000,50,40,["Avr","Mai","Juin","Sept"],"5 – 8 jours",4.4,["Culture","Histoire"],"Ville médiévale, place du marché et château du Wawel."],
    ["m1","Athènes + Santorin","Grèce","Europe","ATH","Confort",2000,2800,120,90,["Mai","Juin","Sept","Oct"],"14 jours",4.8,["Culture","Plage","Gastronomie"],"L'Acropole puis les couchers de soleil d'Oia."],
    ["m2","Istanbul","Turquie","Europe","IST","Confort",1300,1900,90,65,["Avr","Mai","Sept","Oct"],"10 – 14 jours",4.7,["Culture","Gastronomie","Histoire"],"Mosquées, bazars et Bosphore, entre deux continents."],
    ["m3","Phuket & Ko Phi Phi","Thaïlande","Asie","HKT","Confort",1700,2500,350,55,["Nov","Déc","Jan","Fév"],"14 – 21 jours",4.8,["Plage","Bien-être","Aventure"],"Eaux turquoise et kayak entre falaises calcaires."],
    ["m4","Buenos Aires","Argentine","Amérique","EZE","Confort",1900,2700,600,50,["Mars","Avr","Oct","Nov"],"14 – 21 jours",4.7,["Culture","Gastronomie","Fête"],"Tango, asados et architecture néoclassique."],
    ["m5","Nairobi & Masai Mara","Kenya","Afrique","NBO","Confort",2500,3500,380,80,["Juil","Août","Sept","Jan"],"14 jours",4.9,["Nature","Aventure","Faune"],"Big Five et grande migration dans la savane."],
    ["c1","Kyoto & Tokyo","Japon","Asie","NRT","Premium",3200,4500,700,100,["Mars","Avr","Oct","Nov"],"14 – 21 jours",5.0,["Culture","Gastronomie","Bien-être"],"Temples zen, ramen et néons de Shibuya."],
    ["c2","Islande","Islande","Europe","KEF","Premium",3500,4800,120,160,["Déc","Jan","Fév","Juil"],"10 – 14 jours",4.9,["Nature","Aventure","Bien-être"],"Aurores boréales, geysers et glaciers à 3 h de Paris."],
    ["c3","New York","États-Unis","Amérique","JFK","Premium",3800,5200,350,180,["Sept","Oct","Avr","Mai"],"10 – 14 jours",4.8,["Culture","Gastronomie","Shopping"],"Manhattan, musées et Central Park."],
    ["c4","Sydney","Australie","Océanie","SYD","Premium",4000,5500,900,130,["Sept","Oct","Nov","Avr"],"21 jours",4.8,["Plage","Nature","Aventure"],"Opera House, Bondi et la Grande Barrière de corail."],
    ["l1","Maldives","Maldives","Asie","MLE","Prestige",6000,12000,700,350,["Nov","Déc","Jan","Fév"],"10 – 14 jours",5.0,["Plage","Luxe","Bien-être"],"Bungalows sur pilotis et plongée avec les raies manta."],
    ["l2","Polynésie française","France","Océanie","PPT","Prestige",7000,14000,1000,400,["Mai","Juin","Juil","Août"],"14 – 21 jours",5.0,["Plage","Luxe","Bien-être"],"Bora Bora, Moorea et leurs lagons."],
    ["l3","Dubaï","Émirats arabes unis","Asie","DXB","Prestige",4500,8000,200,250,["Oct","Nov","Déc","Jan"],"7 – 10 jours",4.6,["Luxe","Shopping","Gastronomie"],"Burj Khalifa, désert et gastronomie internationale."]
  ].map(r => ({ id:r[0], name:r[1], country:r[2], continent:r[3], code:r[4], tier:r[5], budgetMin:r[6], budgetMax:r[7], flightFrom:r[8], hotelFrom:r[9], months:r[10], duration:r[11], rating:r[12], styles:r[13], desc:r[14] }));
  const eur = n => n.toLocaleString("fr-FR") + " €";
  window.AIVANA_DATA = { destinations: D, eur, byId: id => D.find(d => d.id === id) };
})();

window.AIVANA_PHOTOS = (function () {
  const P = {
    RAK:"1539020140153-e479b8c22e70", LIS:"1555881400-74d7acaacd8b", DPS:"1537996194471-e657df975ab4", MDE:"1568632234157-ce7aecd03d0d", ZQN:"1464822759023-fed622ff2c3b",
    BUD:"1565426873118-a17ed65d74b9", TBS:"1565008576549-57569a49371d", CNX:"1528181304800-259b08848526", HAN:"1528127269322-539801943592", KRK:"1600623471616-8c1966c91ff6",
    ATH:"1570077188670-e3a8d69ac5ff", IST:"1524231757912-21f4fe3a7200", HKT:"1589394815804-964ed0be2eb5", EZE:"1612294037637-ec328d0e075e", NBO:"1516426122078-c23e76319801",
    NRT:"1493976040374-85c8e12f0c0e", KEF:"1531366936337-7c912a4589a7", JFK:"1496442226666-8d4d0e62e6e9", SYD:"1506973035872-a4ec16b8e8d9",
    MLE:"1514282401047-d79a71a590e8", PPT:"1589197331516-4d84b72ebde3", DXB:"1512453979798-5ea266f8880c",
    hero:"1506905925346-21bda4d32df4", van:"1469854523086-cc02fe5d8800", road:"1500530855697-b586d89ba3ee", lake:"1501785888041-af3ef285b470", backpack:"1503220317375-aaad61436b1b",
    hike:"1551632811-561732d1e306", friends:"1539635278303-d4002c07eae3", plane:"1436491865332-7a61a109cc05", clouds:"1500835556837-99ac94a94552",
    hotel1:"1566073771259-6a8506099945", hotel2:"1582719478250-c89cae4dc85b", hotel3:"1542314831-068cd1dbfeeb", hotel4:"1571896349842-33c89424de2d",
    food:"1504674900247-0877df9cc836", dive:"1544551763-46a013bb70d5", camp:"1504280390367-361c6d9f38f4", map:"1488646953014-85cb44e25828", boat:"1476514525535-07fb3b4ae5f1",
    desert:"1509316785289-025f5b846b35", market:"1533900298318-6b8da08a523e", paddle:"1472745942893-4b9f730c7668", balloons:"1530789253388-582c481c54b0", alley:"1527631746610-bca00a040d60",
    meadow:"1501555088652-021faa106b9b", fog:"1448375240586-882707db888b", wall:"1508804185872-d7badad00f7d", pyr:"1503177119275-0aa32b3a9368", camper:"1510312305653-8ed496efae75", sunsetGroup:"1464207687429-7505649dae38", airstream:"1523987355523-c7b5b0dd90a7", notebook:"1452421822248-d4c2b47f0c81", rafting:"1530866495561-507c9faab2ed", himalaya:"1544735716-392fe2489ffa", halong:"1528127269322-539801943592", thai:"1552465011-b4e21bf6e79a"
  };
  const url = (key, w) => P[key] ? "https://images.unsplash.com/photo-" + P[key] + "?auto=format&fit=crop&w=" + (w || 1200) + "&q=75" : "";
  return { ids: P, url };
})();
