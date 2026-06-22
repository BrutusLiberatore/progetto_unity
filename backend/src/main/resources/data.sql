-- Prodotti iniziali per Bolt & Bone
DELETE FROM products;

INSERT INTO products (name, description, type, price_cents, image_url, is_active) VALUES 
-- Doboloni d'Oro
('100 Doboloni', '100 doboloni d''oro per il tuo account', 'currency', 499, '/assets/images/doboloni_1.png', true),
('250 Doboloni', '250 doboloni d''oro per il tuo account', 'currency', 999, '/assets/images/doboloni_1.png', true),
('500 Doboloni', '500 doboloni d''oro per il tuo account', 'currency', 1999, '/assets/images/doboloni_2.png', true),
('1000 Doboloni', '1000 doboloni + 100 bonus d''oro per il tuo account', 'currency', 3499, '/assets/images/doboloni_2.png', true),
('2500 Doboloni', '2500 doboloni + 500 bonus d''oro per il tuo account', 'currency', 7999, '/assets/images/doboloni_3.png', true),
('5000 Doboloni', '5000 doboloni + 1000 bonus d''oro per il tuo account', 'currency', 14999, '/assets/images/doboloni_3.png', true),
-- Potenziamenti
('XP Boost 3GG', 'Bonus XP x2 per 3 giorni', 'boost', 499, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('XP Boost 7GG', 'Bonus XP x3 per 7 giorni', 'boost', 999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Drop Boost 7GG', 'Bonus drop x2 per 7 giorni', 'boost', 1499, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('XP Boost 30GG', 'Bonus XP x3 per 30 giorni', 'boost', 2999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Drop Boost 30GG', 'Bonus drop x2 per 30 giorni', 'boost', 3999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true),
('Account VIP', 'Status VIP permanente', 'boost', 9999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', true);

-- Classifica: inserisci dati test (verra usato se esistono utenti)
-- Per funzionare, serve prima un utente nel DB