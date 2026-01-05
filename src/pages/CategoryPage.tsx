import { useMemo, useState, useEffect, Fragment } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { X, Filter as FilterIcon, Check } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';
import { products as productsApi, ASSETS_BASE } from '../services/api';

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { gender } = useParams<{ gender: 'collections' | 'nouveautes' | 'meilleures-ventes' | 'all' }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  
  const { addToCart } = useCart();
  
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  // State for filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedColors, setTempSelectedColors] = useState<string[]>([]);
  const [tempSelectedSizes, setTempSelectedSizes] = useState<string[]>([]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 200]);
  const [maxPrice, setMaxPrice] = useState(200);

  // Initialize temp filters when opening the modal
  const openFilterModal = () => {
    setTempSelectedColors([...selectedColors]);
    setTempSelectedSizes([...selectedSizes]);
    setTempPriceRange([...priceRange]);
    setIsFilterModalOpen(true);
  };

  // Apply filters from modal
  const applyFilters = () => {
    setSelectedColors(tempSelectedColors);
    setSelectedSizes(tempSelectedSizes);
    setPriceRange(tempPriceRange);
    setIsFilterModalOpen(false);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setTempSelectedColors([]);
    setTempSelectedSizes([]);
    setTempPriceRange([0, 200]);
  };
  
  // Remove unused mobile detection


  // Mettre à jour l'état des filtres lorsque les paramètres d'URL changent
  useEffect(() => {
    // Cette fonction est appelée lorsque les paramètres d'URL changent
    // Pas besoin de gérer searchInput ici car la recherche est maintenant gérée dans le Header
  }, [searchQuery]);

  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState(6);
  const productsPerPage = 6;
  const [sortOption, setSortOption] = useState<string>('name-asc'); // Par défaut : tri par nom croissant

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

  useEffect(() => {
    const load = async () => {
      try {
        // Optionally can pass query params, but backend filtering by category happens with ?category=...
        const params: Record<string, string> = {};
        if (gender && gender !== 'all') {
          // Mapper les nouvelles catégories aux anciennes pour la rétrocompatibilité
          const categoryMap: Record<string, string> = {
            'collections': 'unisexe',
            'nouveautes': 'new',
            'meilleures-ventes': 'best-seller'
          };
          params.category = categoryMap[gender] || gender;
        }
        const data: BackendProduct[] = await productsApi.getAll(params);
        const mapped: Product[] = (data || []).map((p) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          price: p.price,
          category_id: p.category,
          category: { id: p.category, name: p.category, image_url: '', created_at: p.createdAt },
          images: Array.isArray(p.images) ? p.images.map((img) => `${ASSETS_BASE}${img.url}`) : [],
          sizes: p.sizes || [],
          colors: Array.isArray(p.colors) ? p.colors.map((c) => (typeof c === 'string' ? c : c.name || c.code || '')) : [],
          stock: p.stock ?? 0,
          is_featured: !!p.is_featured,
          created_at: p.createdAt,
          rating: 5,
        }));
        setFetchedProducts(mapped);
        // Update max price and widen default filters to include all
        const newMax = Math.max(200, ...mapped.map(m => m.price));
        setMaxPrice(newMax);
        // If priceRange is still the initial [0,200], expand it to [0,newMax]
        setPriceRange(prev => (prev[0] === 0 && prev[1] === 200 ? [0, newMax] : prev));
        setTempPriceRange(prev => (prev[0] === 0 && prev[1] === 200 ? [0, newMax] : prev));
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    load();
  }, [gender]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return fetchedProducts.filter((product: Product) => {
      // Filtre par catégorie
      if (gender === 'all') {
        // Si 'all', on affiche tous les produits
      } else if (gender === 'collections' && product.category_id !== 'unisexe') {
        return false;
      } else if (gender === 'nouveautes' && !product.category_id.includes('new')) {
        return false;
      } else if (gender === 'meilleures-ventes' && !product.is_featured) {
        return false;
      }
      
      // Filtre par recherche
      if (searchQuery) {
        const searchInName = product.name.toLowerCase().includes(searchQuery);
        const searchInDescription = product.description.toLowerCase().includes(searchQuery);
        const searchInColors = product.colors.some(color => 
          color.toLowerCase().includes(searchQuery)
        );
        if (!(searchInName || searchInDescription || searchInColors)) return false;
      }
      
      // Filtre par prix
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      
      // Filtre par couleur
      if (selectedColors.length > 0 && !product.colors.some(color => selectedColors.includes(color))) {
        return false;
      }
      
      // Filtre par taille
      if (selectedSizes.length > 0 && !product.sizes.some(size => selectedSizes.includes(size))) {
        return false;
      }
      
      return true;
    });
  }, [fetchedProducts, gender, searchQuery, priceRange, selectedColors, selectedSizes]);

  // Trier les produits
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch(sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortOption]);

  const handleQuickAddToCart = (product: Product) => {
    const defaultSize = product.sizes?.[0] || '';
    const defaultColor = product.colors?.[0] || '';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const getCategoryTitle = () => {
    if (searchQuery) {
      return `Résultats pour "${searchQuery}"`;
    }
    const categoryName = 
      gender === 'collections' ? 'Collections' :
      gender === 'nouveautes' ? 'Nouveautés' :
      gender === 'meilleures-ventes' ? 'Meilleures Ventes' :
      'Tous les produits';
    return categoryName;
  };

  // Map color names to their corresponding hex codes
  const getColorCode = (color: string): string => {
    // Vérifier si c'est déjà un code hexadécimal
    const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(color);
    if (isHex) return color;
    
    // Vérifier si c'est déjà une valeur RGB/RGBA
    const isRgb = /^rgba?\(/i.test(color);
    if (isRgb) return color;

    // Mappage des noms de couleurs vers leurs codes hexadécimaux
    const colorMap: { [key: string]: string } = {
      'Noir': '#000000',
      'Blanc': '#FFFFFF',
      'Gris': '#808080',
      'Marine': '#000080',
      'Rouge': '#FF0000',
      'Bleu': '#0000FF',
      'Rose': '#FFC0CB',
      'Lavande': '#E6E6FA',
      'Jaune': '#FFFF00',
      'Menthe': '#98FB98',
      'Beige': '#F5F5DC',
      'Vert': '#008000',
      'Orange': '#FFA500',
      'Violet': '#8A2BE2',
      'Kaki': '#F0E68C',
      'Marron': '#A52A2A',
      'Bordeaux': '#800020'
    };
    
    // Vérifier la couleur telle quelle
    if (colorMap[color]) return colorMap[color];
    
    // Essayer avec la première lettre en majuscule et le reste en minuscules
    const cap = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    if (colorMap[cap]) return colorMap[cap];
    
    // Retourner une couleur par défaut si non trouvée
    return '#CCCCCC';
  };

  // Options dynamiques du modal: ne montrer que couleurs/tailles disponibles selon filtres temporaires
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    const withinPrice = (p: Product) => p.price >= 0 && p.price <= (tempPriceRange?.[1] ?? maxPrice);
    const sizeMatch = (p: Product) =>
      tempSelectedSizes.length === 0 || p.sizes?.some((s) => tempSelectedSizes.includes(s));
    filteredProducts
      .filter((p) => withinPrice(p) && sizeMatch(p))
      .forEach((p) => p.colors?.forEach((c) => colors.add(c)));
    return Array.from(colors).sort();
  }, [filteredProducts, tempPriceRange, tempSelectedSizes, maxPrice]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    const withinPrice = (p: Product) => p.price >= 0 && p.price <= (tempPriceRange?.[1] ?? maxPrice);
    const colorMatch = (p: Product) =>
      tempSelectedColors.length === 0 || p.colors?.some((c) => tempSelectedColors.includes(c));
    filteredProducts
      .filter((p) => withinPrice(p) && colorMatch(p))
      .forEach((p) => p.sizes?.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [filteredProducts, tempPriceRange, tempSelectedColors, maxPrice]);

  // Count active filters
  const activeFilterCount = 
    (selectedColors.length > 0 ? 1 : 0) + 
    (selectedSizes.length > 0 ? 1 : 0) + 
    (priceRange[1] < maxPrice ? 1 : 0);
    
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (priceRange[1] < maxPrice) params.set('price', `${priceRange[0]}-${priceRange[1]}`);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedColors, selectedSizes, priceRange]);

  // Remove unused resetFilters function

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 pt-8">
          {/* Titre déplacé dans le bloc ci-dessus */}
        </div>
        
        {/* Affichage des résultats de recherche */}
        {searchQuery && (
          <div className="mb-6 max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{sortedProducts.length}</span> résultat{sortedProducts.length !== 1 ? 's' : ''} pour "<span className="text-yellow-600 font-medium">{searchQuery}</span>"
              </div>
              <button 
                onClick={() => navigate('/category/all')}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* En-tête avec compteur et tri */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle()}</h1>
            <p className="text-gray-600 mt-1">
              {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} disponible{sortedProducts.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="w-full sm:w-64">
            <div className="relative">
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none block w-full pl-4 pr-10 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

          {/* Products Grid */}
          <div className="w-full">
            {sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedProducts.slice(0, visibleProducts).map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleQuickAddToCart}
                    />
                  ))}
                </div>
                <div className="mt-8 text-center space-y-4">
                  {visibleProducts < sortedProducts.length && (
                    <button
                      onClick={() => setVisibleProducts(prev => prev + productsPerPage)}
                      className="px-6 py-2 border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors mr-4"
                    >
                      Voir plus de produits
                    </button>
                  )}
                  {visibleProducts > 6 && (
                    <button
                      onClick={() => setVisibleProducts(6)}
                      className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Voir moins
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {gender === 'nouveautes' ? 'Aucune nouveauté pour le moment' : 
                   gender === 'meilleures-ventes' ? 'Aucun best-seller pour le moment' :
                   'Aucun produit trouvé'}
                </h3>
                <p className="text-gray-600">
                  {gender === 'nouveautes' ? 'Revenez bientôt pour découvrir nos prochaines nouveautés !' :
                   gender === 'meilleures-ventes' ? 'Les meilleures ventes seront bientôt disponibles ici.' :
                   'Essayez de modifier vos critères de recherche ou de filtrage.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Filter Button - Visible on all devices */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openFilterModal}
          className="flex items-center justify-center p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-colors"
        >
          <FilterIcon className="w-6 h-6" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Modal */}
      <Transition appear show={isFilterModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsFilterModalOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Filtres</span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Prix</h4>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={tempPriceRange[1]}
                        onChange={(e) => setTempPriceRange([0, parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>0 TND</span>
                        <span>{tempPriceRange[1]} TND</span>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Couleurs</h4>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color) => {
                        const isSelected = tempSelectedColors.includes(color);
                        const colorCode = getColorCode(color);
                        
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setTempSelectedColors(prev =>
                                prev.includes(color)
                                  ? prev.filter(c => c !== color)
                                  : [...prev, color]
                              );
                            }}
                            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isSelected 
                                ? 'ring-2 ring-offset-1 ring-yellow-500 scale-110' 
                                : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300'
                            }`}
                            style={{
                              backgroundColor: colorCode,
                              border: '2px solid white',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                            title={color}
                            aria-label={`Filtrer par la couleur ${color}`}
                          >
                            {isSelected && (
                              <Check 
                                className={`h-4 w-4 ${color.toLowerCase() === 'blanc' ? 'text-gray-700' : 'text-white'}`} 
                                strokeWidth={3}
                              />
                            )}
                            <span className="sr-only">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Tailles</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setTempSelectedSizes(prev =>
                              prev.includes(size)
                                ? prev.filter(s => s !== size)
                                : [...prev, size]
                            );
                          }}
                          className={`px-3 py-1.5 text-sm rounded-md border ${
                            tempSelectedSizes.includes(size)
                              ? 'bg-yellow-600 text-white border-yellow-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
                  >
                    Réinitialiser
                  </button>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsFilterModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CategoryPage;