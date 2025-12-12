import React, { useState } from 'react';
import type { Product } from '../../types';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import Modal from '../../components/Modal';
import ProductForm from './ProductForm';
import { products as productsApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { FormData } from 'formdata-node';
import { API_BASE_URL } from '../../config/api';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, productId: string | null}>({ show: false, productId: null });

  const API_HOST = API_BASE_URL.replace('/api', '');

  const mapFromBackend = React.useCallback((p: BackendProduct): Product => {
    // Vérifier et formater les images
    let formattedImages: string[] = [];
    if (Array.isArray(p.images)) {
      formattedImages = p.images.map(img => 
        img.url.startsWith('http') ? img.url : `${API_HOST}${img.url}`
      ).filter(Boolean);
    }

    return {
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      category_id: p.category,
      category: { id: p.category, name: p.category, image_url: '', created_at: p.createdAt },
      images: formattedImages,
      sizes: p.sizes || [],
      colors: Array.isArray(p.colors) ? p.colors.map((c) => (typeof c === 'string' ? c : c.name || c.code || '')) : [],
      stock_quantity: p.stock ?? 0,
      is_featured: !!p.is_featured,
      created_at: p.createdAt,
      rating: 5,
    };
  }, [API_HOST]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data: BackendProduct[] = await productsApi.getAll();
        const mapped: Product[] = (data || []).map((p) => mapFromBackend(p));
        setProducts(mapped);
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    load();
  }, [mapFromBackend]);

  type BackendImage = { url: string; alt?: string };
  type BackendColor = { name?: string; code?: string } | string;
  type BackendProduct = {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    colors?: BackendColor[];
    sizes?: string[];
    images?: BackendImage[];
    stock?: number;
    is_featured?: boolean;
    createdAt: string;
  };

  // Fonction pour supprimer un produit
  const handleDelete = (productId: string) => {
    // Optimistic UI
    const prev = products;
    setProducts(products.filter(p => p.id !== productId));
    productsApi.delete(productId).catch(() => setProducts(prev));
    setShowDeleteConfirm({ show: false, productId: null });
  };

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (editingProduct) {
        const updated = await productsApi.update(editingProduct.id, formData);
        const mapped = mapFromBackend(updated);
        setProducts(prev => prev.map(p => p.id === mapped.id ? mapped : p));
      } else {
        const created = await productsApi.create(formData);
        const mapped = mapFromBackend(created);
        setProducts(prev => [mapped, ...prev]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: unknown) {
      console.error('Save product failed', error);
      const message = error instanceof Error 
        ? error.message 
        : 'Erreur lors de la sauvegarde du produit';
      alert(message);
    }
  };

  // État pour la recherche et le filtre
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extraire les catégories uniques
  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))] as string[];

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Vérification de la structure */}
      {!Array.isArray(products) && (
        <div className="p-4 text-red-600">Erreur: Les produits ne sont pas chargés correctement</div>
      )}
      {/* En-tête fixe */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un produit
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="mt-4 flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Filtrer</span>
            </button>
          </div>

          {/* Filtres (mobile) */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="bg-white p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Filtrer par catégorie</h3>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full text-left px-3 py-1.5 rounded text-sm ${!selectedCategory ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Toutes les catégories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-1.5 rounded text-sm ${selectedCategory === category ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Vue grille avec 2 colonnes sur mobile/tablette et 3 sur desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="relative pb-[100%] bg-gray-100">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // En cas d'erreur de chargement de l'image
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/300x300?text=Image+non+disponible';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                    <span className="text-xs">Pas d'image</span>
                  </div>
                )}
                <div className="absolute top-1 right-1 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
                    aria-label="Modifier"
                    title="Modifier le produit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.innerWidth >= 768) { // Desktop
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                          handleDelete(product.id);
                        }
                      } else { // Mobile
                        setShowDeleteConfirm({ show: true, productId: product.id });
                      }
                    }}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-red-600 hover:bg-red-100 transition-colors duration-200"
                    aria-label="Supprimer"
                    title="Supprimer le produit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 truncate">{product.description}</p>
                  </div>
                  <span className="ml-1 text-xs font-medium text-indigo-600 whitespace-nowrap">{product.price.toFixed(3)} TND</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity}` : 'Rupture'}
                  </span>
                  {product.category?.name && (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded truncate max-w-[80px]">
                      {product.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>

      {/* Bouton flottant pour ajouter un produit */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Ajouter un produit"
        >
          <Plus className="h-6 w-6" />
          <span className="hidden md:inline ml-2 text-sm font-medium">Ajouter</span>
        </button>
      </div>

      {/* Modal d'ajout/édition */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }} 
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Popup de confirmation de suppression (mobile) */}
      <AnimatePresence>
        {showDeleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le produit</h3>
              <p className="text-sm text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, productId: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => showDeleteConfirm.productId && handleDelete(showDeleteConfirm.productId)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;

