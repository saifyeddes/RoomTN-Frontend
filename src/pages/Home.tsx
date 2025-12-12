import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';
import { products as productsApi, ASSETS_BASE } from '../services/api';
import Footer from '../components/Footer';

// 10 high-quality fashion images for the carousel
const heroImages = [
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
];

const Home: React.FC = () => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const mapFromBackend = React.useCallback((p: BackendProduct): Product => ({
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    category_id: p.category,
    category: { id: p.category, name: p.category, image_url: '', created_at: p.createdAt },
    images: Array.isArray(p.images) ? p.images.map((img) => `${ASSETS_BASE}${img.url}`) : [],
    sizes: p.sizes || [],
    colors: Array.isArray(p.colors) ? p.colors.map((c) => (typeof c === 'string' ? c : c.name || c.code || '')) : [],
    stock_quantity: p.stock ?? 0,
    is_featured: !!p.is_featured,
    created_at: p.createdAt,
    rating: 5,
  }), []);

  useEffect(() => {
    const load = async () => {
      try {
        const best: BackendProduct[] = await productsApi.getBest(12);
        setFeaturedProducts((best || []).map(mapFromBackend));
      } catch (e) {
        console.error('Failed to load best sellers', e);
      }
    };
    load();
  }, [mapFromBackend]);

  // Gestion du défilement pour afficher le bouton
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Change image every 2 seconds
    
    return () => clearInterval(timer);
  }, [isPaused]);

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Fonction pour faire défiler jusqu'à la section des produits
  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // search handled in Header; removing unused local handler

  const handleQuickAddToCart = (product: Product) => {
    const defaultSize = product.sizes?.[0] || '';
    const defaultColor = product.colors?.[0] || '';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };


  return (
    <div className="min-h-screen relative">
      {/* Bouton de retour en haut */}
      <motion.button
        onClick={scrollToTop}
        className={`fixed right-8 bottom-8 z-50 p-3 rounded-full bg-yellow-500 text-white shadow-lg transition-all duration-300 ${
          showScrollButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        whileHover={{ scale: 1.1, backgroundColor: '#F59E0B' }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: showScrollButton ? 0 : 20,
          opacity: showScrollButton ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label="Remonter en haut de la page"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
      
      {/* Hero Section with Carousel */}
      <section 
        className="relative h-screen flex items-center justify-center bg-black overflow-hidden -mt-16"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images Carousel */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              transform: 'scale(1.05)',
              filter: 'brightness(0.9) contrast(1.1)',
            }}
          />
        ))}


  

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="flex justify-center space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'w-8 bg-yellow-500' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Aller à la diapositive ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          {/* Logo avec effet brillant */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Room
              </span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                .tn
              </span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full shadow-lg"></div>
          </div>

          {/* Slogan principal */}
          <div className="mb-8">
            <motion.p 
              className="text-2xl md:text-4xl font-bold mb-4 text-gray-100 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              L'Élégance à Votre Image
            </motion.p>
            <motion.p 
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explorez notre collection raffinée de t-shirts unisexes, où le confort rencontre le style intemporel. 
              Des matières d'exception pour une élégance au quotidien.
            </motion.p>
          </div>

          {/* Statistiques avec animation */}
          <motion.div 
            className="grid grid-cols-3 gap-8 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { value: '200+', label: 'Modèles' },
              { value: '5K+', label: 'Clients Satisfaits' },
              { value: '24H', label: 'Livraison Express' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${stat.value}-${currentImageIndex}`}
                    className="text-3xl md:text-4xl font-bold text-yellow-400 mb-1"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.div>
                </AnimatePresence>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={scrollToProducts}
              className="group relative overflow-hidden bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-500 shadow-lg transform hover:scale-105"
            >
              <span className="relative z-10">Découvrir la Collection</span>
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
              />
            </button>
          </motion.div>
          
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nouveautés & Coups de Cœur
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez nos derniers t-shirts et les modèles les plus populaires
            </p>
          </div>

          <div className="relative">
            <div className="flex overflow-x-auto pb-6 -mx-2 px-2">
              <div className="flex space-x-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-64">
                    <ProductCard
                      product={product}
                      onAddToCart={handleQuickAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          </div>

          {/* Bouton Voir tous les t-shirts */}
          <div className="text-center mt-12">
            <Link
              to="/category/all"
              className="inline-flex items-center bg-yellow-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-700 transition-colors mb-12"
            >
              Voir tous les t-shirts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Définition de la marque - Version Mobile First */}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            {/* Fond décoratif amélioré */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl mx-4 sm:mx-6">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 opacity-90"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-100 rounded-full filter blur-3xl opacity-40"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-yellow-100 rounded-full filter blur-3xl opacity-40"></div>
            </div>
            
            <div className="text-center mb-12 sm:mb-16 px-2">
              <motion.h3 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="relative inline-block">
                  <span className="relative z-10 px-2">
                    <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">Room</span>
                    <span className="text-gray-900">.tn</span>
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-100 -z-0 rounded-full"></span>
                </span>
              </motion.h3>
              
              <motion.p 
                className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                L'élégance intemporelle à travers des pièces unisexes qui transcendent les tendances éphémères.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
              {[
                {
                  icon: '👔',
                  title: 'Style Universel',
                  description: 'Des designs pensés pour toutes les silhouettes et tous les styles de vie, alliant élégance et confort.',
                  color: 'from-yellow-50 to-yellow-100'
                },
                {
                  icon: '✨',
                  title: 'Qualité Supérieure',
                  description: 'Matières nobles sélectionnées pour un confort inégalé et une durabilité exceptionnelle.',
                  color: 'from-amber-50 to-amber-100'
                },
                {
                  icon: '🌿',
                  title: 'Éthique & Durable',
                  description: 'Engagement pour une mode responsable, respectueuse des artisans et de la planète.',
                  color: 'from-green-50 to-green-100'
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className={`group relative p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${item.color} hover:shadow-yellow-100/50`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="relative z-10">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{item.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
                    
                    <div className="mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-8 h-0.5 bg-yellow-400 mx-auto transform group-hover:scale-x-150 transition-transform duration-300"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-12 sm:mt-16 text-center px-4 py-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3,
                type: "spring",
                stiffness: 100
              }}
            >
              <svg 
                className="w-8 h-8 text-yellow-400 mx-auto mb-3 opacity-70" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-base sm:text-lg text-gray-600 italic font-medium">
                « L'élégance est la seule beauté qui ne se fane jamais. »
              </p>
              <p className="mt-2 text-sm sm:text-base text-yellow-600 font-medium">- Audrey Hepburn</p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;