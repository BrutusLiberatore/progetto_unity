-- Prodotti iniziali per Bolt & Bone
DELETE FROM products;

INSERT INTO products (name, description, type, price_cents, image_url, is_active) VALUES 
-- Cristalli (quantità reale)
('100 Cristalli', '100 cristalli per il tuo account', 'currency', 499, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
('250 Cristalli', '250 cristalli per il tuo account', 'currency', 999, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
('500 Cristalli', '500 cristalli per il tuo account', 'currency', 1999, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
('1000 Cristalli', '1000 cristalli + 100 bonus per il tuo account', 'currency', 3499, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
('2500 Cristalli', '2500 cristalli + 500 bonus per il tuo account', 'currency', 7999, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
('5000 Cristalli', '5000 cristalli + 1000 bonus per il tuo account', 'currency', 14999, 'https://images.unsplash.com/photo-1612157870921-2735e5d34d1e?w=300', true),
-- Potenziamenti
('XP Boost 3GG', 'Bonus XP x2 per 3 giorni', 'boost', 499, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('XP Boost 7GG', 'Bonus XP x3 per 7 giorni', 'boost', 999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Drop Boost 7GG', 'Bonus drop x2 per 7 giorni', 'boost', 1499, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('XP Boost 30GG', 'Bonus XP x3 per 30 giorni', 'boost', 2999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Drop Boost 30GG', 'Bonus drop x2 per 30 giorni', 'boost', 3999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Account VIP', 'Status VIP permanente', 'boost', 9999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true);

-- Classifica: inserisci dati test (verra usato se esistono utenti)
-- Per funzionare, serve prima un utente nel DB