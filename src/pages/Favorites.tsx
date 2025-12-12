import React from 'react';
import { Link } from 'react-router-dom';
import { Heart as HeartIcon, HeartOff, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  // Afficher directement les produits favoris stockés dans le contexte
  const favoriteProducts = favorites;

  const handleRemoveFromFavorites = (productId: string) => {
    removeFromFavorites(productId);
  };

  const handleAddToCart = (product: Product) => {
    const size = product.sizes?.[0] || '';
    const color = product.colors?.[0] || '';
    addToCart(product, size, color, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/" 
            className="flex items-center text-yellow-600 hover:text-yellow-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
            <span className="text-gray-600">
              {favoriteProducts.length} {favoriteProducts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="mx-auto flex justify-center">
              <HeartOff className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="mt-4 text-xl font-medium text-gray-900">Votre liste de favoris est vide</h2>
            <p className="mt-2 text-gray-600">
              Ajoutez des articles à vos favoris pour les retrouver facilement plus tard.
            </p>
            <Link
              to="/category"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              Parcourir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
                <button
                  onClick={() => handleRemoveFromFavorites(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md z-10 text-red-500 hover:text-red-600 transition-colors"
                  aria-label="Retirer des favoris"
                >
                  <HeartIcon className="h-5 w-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
