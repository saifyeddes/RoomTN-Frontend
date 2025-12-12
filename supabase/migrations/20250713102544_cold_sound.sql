/*
  # Données d'exemple pour Room.tn

  1. Catégories par défaut
  2. Produits d'exemple pour chaque catégorie
  3. Utilisateur administrateur par défaut
*/

-- Insert default categories
INSERT INTO categories (name, image_url) VALUES
  ('T-Shirts', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
  ('Pantalons', 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg'),
  ('Robes', 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg'),
  ('Chemises', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'),
  ('Vestes', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),
  ('Chaussures', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
WITH category_ids AS (
  SELECT name, id FROM categories
)
INSERT INTO products (name, description, price, category_id, images, sizes, colors, gender, stock_quantity, is_featured) VALUES
  -- T-Shirts
  (
    'T-Shirt Classique Coton Bio',
    'T-shirt en coton biologique, coupe moderne et confortable. Parfait pour un look décontracté.',
    45.000,
    (SELECT id FROM category_ids WHERE name = 'T-Shirts'),
    '["https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg", "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"]',
    '["XS", "S", "M", "L", "XL", "XXL"]',
    '["Blanc", "Noir", "Gris", "Marine"]',
    'unisexe',
    50,
    true
  ),
  (
    'T-Shirt Graphique Tendance',
    'T-shirt avec design graphique moderne, idéal pour exprimer votre style unique.',
    55.000,
    (SELECT id FROM category_ids WHERE name = 'T-Shirts'),
    '["https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"]',
    '["S", "M", "L", "XL"]',
    '["Blanc", "Noir", "Rouge"]',
    'homme',
    30,
    true
  ),
  
  -- Pantalons
  (
    'Jean Slim Fit',
    'Jean moderne avec coupe slim, fabriqué dans un denim de qualité supérieure.',
    120.000,
    (SELECT id FROM category_ids WHERE name = 'Pantalons'),
    '["https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg"]',
    '["28", "30", "32", "34", "36", "38", "40"]',
    '["Bleu", "Noir", "Gris"]',
    'homme',
    25,
    false
  ),
  (
    'Pantalon Chino Élégant',
    'Pantalon chino polyvalent, parfait pour un look casual-chic.',
    85.000,
    (SELECT id FROM category_ids WHERE name = 'Pantalons'),
    '["https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"]',
    '["28", "30", "32", "34", "36", "38"]',
    '["Beige", "Marine", "Kaki"]',
    'homme',
    40,
    true
  ),
  
  -- Robes
  (
    'Robe d\'Été Florale',
    'Robe légère et élégante avec motifs floraux, idéale pour les beaux jours.',
    95.000,
    (SELECT id FROM category_ids WHERE name = 'Robes'),
    '["https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg"]',
    '["XS", "S", "M", "L", "XL"]',
    '["Bleu", "Rose", "Jaune"]',
    'femme',
    20,
    true
  ),
  (
    'Robe de Soirée Élégante',
    'Robe sophistiquée pour les occasions spéciales, coupe ajustée et tissu premium.',
    180.000,
    (SELECT id FROM category_ids WHERE name = 'Robes'),
    '["https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg"]',
    '["XS", "S", "M", "L"]',
    '["Noir", "Rouge", "Marine"]',
    'femme',
    15,
    false
  ),
  
  -- Chemises
  (
    'Chemise Oxford Classique',
    'Chemise intemporelle en coton Oxford, parfaite pour le bureau ou les sorties.',
    75.000,
    (SELECT id FROM category_ids WHERE name = 'Chemises'),
    '["https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"]',
    '["S", "M", "L", "XL", "XXL"]',
    '["Blanc", "Bleu", "Rose"]',
    'homme',
    35,
    false
  ),
  (
    'Chemisier Femme Moderne',
    'Chemisier élégant et moderne, coupe flatteuse pour toutes les morphologies.',
    68.000,
    (SELECT id FROM category_ids WHERE name = 'Chemises'),
    '["https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg"]',
    '["XS", "S", "M", "L", "XL"]',
    '["Blanc", "Noir", "Bleu"]',
    'femme',
    28,
    true
  ),
  
  -- Vestes
  (
    'Veste en Jean Vintage',
    'Veste en jean au style vintage, parfaite pour compléter votre look décontracté.',
    110.000,
    (SELECT id FROM category_ids WHERE name = 'Vestes'),
    '["https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"]',
    '["S", "M", "L", "XL"]',
    '["Bleu", "Noir"]',
    'unisexe',
    22,
    true
  ),
  (
    'Blazer Professionnel',
    'Blazer élégant pour un look professionnel, coupe moderne et finitions soignées.',
    165.000,
    (SELECT id FROM category_ids WHERE name = 'Vestes'),
    '["https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"]',
    '["S", "M", "L", "XL"]',
    '["Noir", "Marine", "Gris"]',
    'homme',
    18,
    false
  )
ON CONFLICT DO NOTHING;