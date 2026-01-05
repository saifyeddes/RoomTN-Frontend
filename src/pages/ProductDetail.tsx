import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, Truck, Shield, RotateCcw, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { showToast } from '../components/ToastNotification';
import { products as productsApi, ASSETS_BASE } from '../services/api';
import type { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Omit<Product, 'gender'> & { gender?: string } | null>(null);
  const [related, setRelated] = useState<Array<Omit<Product, 'gender'> & { gender?: string }>>([]);

  type BackendImage = { url: string; alt?: string };
  type BackendColor = { name?: string; code?: string } | string;
  type BackendProduct = {
    _id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    colors?: BackendColor[];
    sizes?: string[];
    images?: BackendImage[];
    stock?: number;
    is_featured?: boolean;
    createdAt: string;
  };

  const handleQuickAdd = (p: Product) => {
    const size = p.sizes?.[0] || '';
    const color = p.colors?.[0] || '';
    if (!size || !color) {
      showToast('Sélection non disponible. Ouvrez le produit pour choisir taille/couleur', 'error');
      return;
    }
    addToCart(p, size, color, 1);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data: BackendProduct = await productsApi.getById(id);
        const mapped: Product = {
          id: data._id,
          name: data.name,
          description: data.description,
          price: data.price,
          category_id: data.category || '',
          category: data.category ? { id: data.category, name: data.category, image_url: '', created_at: data.createdAt } : undefined,
          images: Array.isArray(data.images) ? data.images.map((img) => `${ASSETS_BASE}${img.url}`) : [],
          sizes: data.sizes || [],
          colors: Array.isArray(data.colors) ? data.colors.map((c) => (typeof c === 'string' ? c : c.name || c.code || '')) : [],
          stock: data.stock ?? 0,
          is_featured: !!data.is_featured,
          created_at: data.createdAt,
          rating: 5,
        };
        setProduct(mapped);
        setIsFavorited(isFavorite(mapped.id));
      } catch (e) {
        console.error('Failed to load product', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isFavorite]);

  // Fonction pour mapper un produit du backend vers le format frontend
  const mapBackendToProduct = useCallback((p: BackendProduct): Omit<Product, 'gender'> & { gender?: string } => ({
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    category_id: p.category || 'uncategorized',
    category: { 
      id: p.category || 'uncategorized', 
      name: p.category || 'Non catégorisé', 
      image_url: '', 
      created_at: p.createdAt 
    },
    images: Array.isArray(p.images) ? p.images.map((img) => `${ASSETS_BASE}${img.url}`) : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) 
      ? p.colors.map((c) => (typeof c === 'string' ? c : c.name || c.code || '')) 
      : [],
    stock: p.stock ?? 0,
    is_featured: !!p.is_featured,
    created_at: p.createdAt,
    rating: 5,
    gender: (p as any).gender || 'unisex' // Ajout d'une valeur par défaut pour le genre
  }), []);

  // Charger les produits associés (même catégorie si dispo, sinon best-sellers)
  useEffect(() => {
    const loadRelated = async () => {
      try {
        if (product?.category_id) {
          // Charger les produits de la même catégorie
          const data: BackendProduct[] = await productsApi.getAll({ 
            category: product.category_id 
          });
          
          const filteredData = Array.isArray(data) ? data : [];
          const relatedItems: (Omit<Product, 'gender'> & { gender?: string })[] = filteredData
            .filter((p): p is BackendProduct => p && p._id && p._id !== product?.id)
            .map(mapBackendToProduct);
            
          setRelated(relatedItems.slice(0, 8));
        } else {
          // Si pas de catégorie, charger les meilleures ventes
          const best = await productsApi.getBest(8);
          const bestItems: (Omit<Product, 'gender'> & { gender?: string })[] = 
            Array.isArray(best) 
              ? best.map(mapBackendToProduct) 
              : [];
          setRelated(bestItems);
        }
      } catch (e) {
        console.error('Failed to load related products', e);
        setRelated([]);
      }
    };
    
    if (product) {
      loadRelated();
    }
  }, [product, mapBackendToProduct]);

  // Check if product is in favorites on component mount
  useEffect(() => {
    if (product) {
      setIsFavorited(isFavorite(product.id));
    }
  }, [product, isFavorite]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    setIsAnimating(true);
    
    if (isFavorited) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
    
    setIsFavorited(!isFavorited);
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Réinitialiser la sélection quand le produit change
  useEffect(() => {
    if (product) {
      console.log('Product loaded:', product);
      console.log('Available sizes:', product.sizes);
      
      // Sélectionner la première taille disponible si aucune n'est sélectionnée
      if (product.sizes && product.sizes.length > 0) {
        // Vérifier si la taille actuelle est toujours valide
        if (!product.sizes.includes(selectedSize)) {
          setSelectedSize(product.sizes[0]);
          console.log('Default size selected:', product.sizes[0]);
        }
      } else {
        setSelectedSize('');
      }
      
      // Sélectionner la première couleur disponible si aucune n'est sélectionnée
      if (product.colors && product.colors.length > 0) {
        if (!selectedColor || !product.colors.includes(selectedColor)) {
          setSelectedColor(product.colors[0]);
        }
      } else {
        setSelectedColor('');
      }
    }
  }, [product, selectedSize, selectedColor]);

  if (!loading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">Chargement du produit...</div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      if (!selectedSize) {
        document.getElementById('size-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (!selectedColor) {
        document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('⚠️ Veuillez sélectionner une taille et une couleur avant d\'ajouter au panier', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    // Rediriger vers le panier après l'ajout
    navigate('/cart');
  };

  const getColorStyle = (color: string) => {
    // Support hex and rgb(a) directly
    const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(color);
    if (isHex) return color;
    const isRgb = /^rgba?\(/i.test(color);
    if (isRgb) return color;

    // Map common French color names; fallback to CSS basic names if they exist
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
    // Try exact, then capitalized, then lowercase English CSS color names
    if (colorMap[color]) return colorMap[color];
    const cap = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    if (colorMap[cap]) return colorMap[cap];
    // As a last attempt, return the string itself (in case it's a valid CSS color keyword)
    return color || '#CCCCCC';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><button onClick={() => navigate('/')} className="hover:text-gray-700">Accueil</button></li>
            <li>/</li>
            <li className="truncate max-w-[40ch] text-gray-700">{product.name}</li>
          </ol>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-8">
            {/* Images du produit */}
            <div>
              <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Image précédente"
                      onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/5 transition"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      aria-label="Image suivante"
                      onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/5 transition"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
                      {product.images.map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${selectedImage === i ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-yellow-600 ring-2 ring-yellow-200' : 'border-transparent hover:border-gray-200'
                      }`}
                      aria-label={`Voir l'image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Détails du produit */}
            <div className="lg:pl-2">
              <div className="lg:sticky lg:top-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                    <button
                      onClick={handleFavoriteClick}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        isFavorited 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      } ${isAnimating ? 'scale-125' : 'scale-100'}`}
                      aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {isFavorited ? (
                        <Heart className="h-6 w-6 fill-current text-red-500" />
                      ) : (
                        <Heart className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-3 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-gray-600">(4.8) • 124 avis</span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-100">En stock: {product.stock}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Sélection de la couleur */}
                <div id="color-section" className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Couleur {selectedColor ? null : <span className="ml-2 align-middle text-xs text-red-500">Sélectionnez une couleur</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={`Choisir la couleur ${color}`}
                        className={`p-1 rounded-full border transition ${
                          selectedColor === color
                            ? 'border-yellow-600 ring-2 ring-yellow-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="block h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: getColorStyle(color) }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sélection de la taille */}
                <div id="size-section" className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Taille: {selectedSize ? (
                      <span className="text-yellow-600 font-bold">{selectedSize}</span>
                    ) : (
                      <span className="text-red-500">Sélectionnez une taille</span>
                    )}
                  </h3>
                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => {
                            console.log('Size selected:', size);
                            setSelectedSize(size);
                          }}
                          className={`px-4 py-2 border rounded-xl font-medium transition-all ${
                            selectedSize === size
                              ? 'border-yellow-600 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200 shadow-sm'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune taille disponible pour ce produit</p>
                  )}
                </div>

                {/* Quantité */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantité</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </button>
                  <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    <Heart className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Truck className="h-5 w-5" />
                    <span>Livraison gratuite en Tunisie</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <RotateCcw className="h-5 w-5" />
                    <span>Retour gratuit sous 14 jours</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Shield className="h-5 w-5" />
                    <span>Garantie qualité</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Produits associés */}
      {related.length > 0 && (
        <div className="mt-10 px-2 sm:px-0">
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Produits associés</h2>
              <span className="text-xs text-gray-500">Sélection inspirée</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((rp) => (
                <div key={rp.id} className="group rounded-xl bg-white border border-gray-100 ring-1 ring-gray-100 p-3 hover:shadow-md hover:-translate-y-0.5 transition-transform">
                  <Link to={`/product/${rp.id}`} className="block">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-yellow-700 transition-colors">{rp.name}</h3>
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(rp.price)}</span>
                    <button
                      onClick={() => handleQuickAdd(rp)}
                      className="p-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
                      aria-label={`Ajouter ${rp.name}`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {rp.colors?.[0] && (
                      <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300" style={{ backgroundColor: rp.colors[0] }} title={rp.colors[0]} />
                    )}
                    {rp.sizes?.[0] && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{rp.sizes[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;