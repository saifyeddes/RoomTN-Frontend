import type { Product, Category, User, Order, Review } from '../types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Unisexe',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
    created_at: '2025-01-01T00:00:00Z'
  }
];

export const mockProducts: Product[] = [
  // T-Shirts Unisexes
  {
    id: '1',
    name: 'T-Shirt Décontracté',
    description: 'T-shirt décontracté, coupe oversize et matière douce. Idéal pour un look décontracté et tendance.',
    price: 38.000,
    category_id: '1',
    category: mockCategories[0],
    images: [
      'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blanc cassé', 'Noir', 'Gris', 'Rose poudré'],
    rating: 4.5,
    stock: 28,
    is_featured: true,
    created_at: '2025-07-18T00:00:00Z'
  },
  {
    id: '2',
    name: 'T-Shirt Graphique',
    description: 'T-shirt à manches courtes avec impression graphique. Coupe moderne et matière respirante pour un confort optimal.',
    price: 42.000,
    category_id: '1',
    category: mockCategories[0],
    images: [
      'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg',
      'https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['Noir', 'Bleu', 'Rouge'],
    rating: 4,
    stock: 30,
    is_featured: true,
    created_at: '2025-07-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'T-Shirt Col V',
    description: 'T-shirt à col V, idéal pour un look décontracté. Matière douce et résistante pour un confort optimal toute la journée.',
    price: 39.500,
    category_id: '1',
    category: mockCategories[0],
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bleu marine', 'Blanc', 'Noir'],
    rating: 4.5,
    stock: 20,
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'T-Shirt Vintage',
    description: 'T-shirt au style vintage avec impression rétro. Coton doux et confortable pour un look authentique.',
    price: 38.000,
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Beige', 'Kaki', 'Marron'],
    rating: 4.5,
    stock: 1, // Will show as 'Stock Limité' (Low Stock)
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },

  // T-Shirts Femme
  {
    id: '5',
    name: 'T-Shirt Basique Coton',
    description: 'T-shirt basique en coton doux, coupe moderne et confortable. Essentiel de la garde-robe quotidienne.',
    price: 32.000,
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Rose', 'Blanc', 'Noir', 'Lavande'],
    rating: 4.5,
    stock: 30,
    is_featured: true, // Will show as 'Nouveau' (New)
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'T-Shirt Col V',
    description: 'T-shirt à col V, idéal pour les looks décontractés. Coupe moderne et matière douce pour un confort optimal.',
    price: 35.000,
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1300551/pexels-photo-1300551.jpeg'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Noir', 'Blanc', 'Gris', 'Bleu'],
    rating: 4.5,
    stock: 22,
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'T-Shirt Manches Longues',
    description: 'T-shirt à manches longues, idéal pour les saisons froides. Confortable et stylé.',
    price: 45.000,
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Rose', 'Bleu'],
    rating: 4.5,
    stock: 0, // Will show as 'Épuisé' (Out of Stock)
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'T-Shirt Motif Floral',
    description: 'T-shirt avec joli motif floral, parfait pour le printemps. Coupe moderne et tissu respirant.',
    price: 39.000,
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Rose', 'Bleu'],
    rating: 4.5,
    stock: 4, // Will show as 'Stock Limité' (Low Stock)
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },

  // T-Shirts Enfant
  {
    id: '9',
    name: 'T-Shirt Enfant Coloré',
    description: 'T-shirt amusant pour enfants avec couleurs vives. Coton hypoallergénique et résistant aux lavages.',
    price: 22.000,
    stock: 0, // Will show as 'Épuisé' (Out of Stock)
    category_id: '1',
    category: mockCategories[0],
    images: ['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg'],
    sizes: ['2-3 ans', '4-5 ans', '6-7 ans', '8-9 ans', '10-11 ans'],
    colors: ['Rouge', 'Bleu', 'Jaune', 'Vert'],
    rating: 4.5,
    is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '10',
    name: 'T-Shirt Enfant Superhéros',
    description: 'T-shirt avec motifs de superhéros, parfait pour les petits aventuriers. Impression haute qualité.',
    price: 25.000,
    category_id: '3',
    category: mockCategories[2],
    images: ['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg'],
    sizes: ['2-3 ans', '4-5 ans', '6-7 ans', '8-9 ans'],
    colors: ['Bleu', 'Rouge', 'Noir'],
    rating: 4.5,
    stock: 30,
    is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '11',
    name: 'T-Shirt Enfant Licorne',
    description: 'T-shirt magique avec motif licorne, parfait pour les petites princesses. Paillettes qui brillent.',
    price: 27.000,
    category_id: '3',
    category: mockCategories[2],
    images: ['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg'],
    sizes: ['2-3 ans', '4-5 ans', '6-7 ans', '8-9 ans', '10-11 ans'],
    colors: ['Rose', 'Violet', 'Blanc'],
    rating: 4.5,
    stock: 25,
    is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '12',
    name: 'T-Shirt Enfant Sport',
    description: 'T-shirt de sport pour enfants actifs. Tissu technique qui évacue la transpiration.',
    price: 30.000,
    category_id: '3',
    category: mockCategories[2],
    images: ['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg'],
    sizes: ['4-5 ans', '6-7 ans', '8-9 ans', '10-11 ans', '12-13 ans'],
    colors: ['Bleu', 'Vert', 'Orange', 'Noir'],
    rating: 4.5,
    stock: 35,
    is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  }
];

export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  full_name: 'Utilisateur Test',
  role: 'customer',
  created_at: '2025-01-01T00:00:00Z'
};

export const mockAdmins: User[] = [
  {
    id: 'admin-1',
    email: 'super.admin@example.com',
    full_name: 'Super Admin',
    role: 'super_admin',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'admin-2',
    email: 'admin.user@example.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'admin-3',
    email: 'another.admin@example.com',
    full_name: 'Another Admin',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z'
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    user_id: '1',
    user: mockUser,
    product_id: '1',
    product: mockProducts[0],
    rating: 5,
    comment: 'Excellent produit, très confortable et de bonne qualité. Je recommande vivement !',
    created_at: '2025-07-11T09:00:00Z',
  },
  {
    id: 'review-2',
    user_id: '1',
    user: mockUser,
    product_id: '5',
    product: mockProducts[4],
    rating: 4,
    comment: 'Jolie couleur et tissu agréable. La taille est un peu juste, je conseillerais de prendre une taille au-dessus.',
    created_at: '2025-07-13T15:20:00Z',
  },
  {
    id: 'review-3',
    user_id: '1',
    user: mockUser,
    product_id: '9',
    product: mockProducts[8],
    rating: 5,
    comment: 'Adorable et de très bonne qualité. Mon fils adore !',
    created_at: '2025-07-14T11:45:00Z',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    user_id: '1',
    user: mockUser,
    items: [
      { id: 'item-1', order_id: 'ORD-001', product_id: '1', product: mockProducts[0], size: 'M', color: 'Noir', quantity: 1, price: 35.000 },
      { id: 'item-2', order_id: 'ORD-001', product_id: '5', product: mockProducts[4], size: 'S', color: 'Rose', quantity: 1, price: 32.000 },
    ],
    total_amount: 67.000,
    status: 'delivered',
    shipping_address: '123 Rue de la Liberté, Tunis, Tunisie',
    phone: '+216 12 345 678',
    created_at: '2025-07-10T10:30:00Z',
  },
  {
    id: 'ORD-002',
    user_id: '1',
    user: mockUser,
    items: [
      { id: 'item-3', order_id: 'ORD-002', product_id: '2', product: mockProducts[1], size: 'L', color: 'Blanc', quantity: 2, price: 42.000 },
    ],
    total_amount: 84.000,
    status: 'shipped',
    shipping_address: '456 Avenue Habib Bourguiba, Sousse, Tunisie',
    phone: '+216 98 765 432',
    created_at: '2025-07-12T14:00:00Z',
  },
  {
    id: 'ORD-003',
    user_id: '1',
    user: mockUser,
    items: [
      { id: 'item-4', order_id: 'ORD-003', product_id: '9', product: mockProducts[8], size: '4-5 ans', color: 'Rouge', quantity: 1, price: 22.000 },
    ],
    total_amount: 22.000,
    status: 'pending',
    shipping_address: '789 Boulevard de l\'Environnement, Sfax, Tunisie',
    phone: '+216 22 111 333',
    created_at: '2025-07-14T09:15:00Z',
  },
];