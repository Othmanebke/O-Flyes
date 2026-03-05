-- Seed some destinations (Using upsert logic by ON CONFLICT if we had unique constraints, but since we rely on UUID generation we'll just TRUNCATE and insert or insert safely).
-- A safer approach for initial dev is just direct inserts if the table is empty.

INSERT INTO public.destinations (name, country, description, best_period, estimated_budget, image_url)
VALUES 
  ('Santorini', 'Grèce', 'Profitez des paysages magnifiques avec les maisons blanches et les toits bleus.', 'Mai - Septembre', 1500, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80'),
  ('Kyoto', 'Japon', 'Une immersion totale dans la culture traditionnelle japonaise avec de magnifiques temples.', 'Mars - Mai (Cerisiers en fleurs)', 2000, 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80'),
  ('Reykjavik', 'Islande', 'Aurores boréales et geysers au programme de ce voyage nordique.', 'Septembre - Mars', 1800, 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=800&q=80'),
  ('Bali', 'Indonésie', 'Détente sur des plages paradisiaques et temples majestueux.', 'Avril - Octobre', 1200, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'),
  ('Marrakech', 'Maroc', 'Les couleurs vives des souks et la splendeur des riads.', 'Septembre - Mai', 800, 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80')
ON CONFLICT DO NOTHING;
