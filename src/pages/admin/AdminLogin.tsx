import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const { signIn } = useAuth(); // Remplacer signIn

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await signIn(email, password); // ← login admin
    navigate('/admin/dashboard', { replace: true });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Identifiants invalides');
  } finally {
    setLoading(false);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Left side - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 w-full md:w-1/2 lg:w-2/5 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <Link to="/" className="text-4xl font-bold">
          Room<span className="text-yellow-400">.tn</span>
        </Link>
        
        <motion.div 
          className="space-y-6"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-700 bg-opacity-50">
              <Shield className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-xl font-semibold">Espace Administrateur</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-4xl font-bold leading-tight">
            Gestion de la boutique en toute simplicité
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-blue-100">
            Accédez à votre tableau de bord pour gérer les produits, les commandes et les clients.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="mt-8 pt-8 border-t border-blue-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-blue-200 text-sm">
            © {new Date().getFullYear()} Room.tn - Tous droits réservés
          </p>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center">
            <Link to="/" className="inline-block">
              <div className="text-3xl font-bold text-blue-900">
                Room<span className="text-yellow-500">.tn</span>
              </div>
            </Link>
            <p className="mt-2 text-gray-500">Espace Administrateur</p>
          </div>

          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            whileHover={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Bienvenue</h2>
              <p className="text-gray-500 mt-2">Connectez-vous pour accéder à votre tableau de bord</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div 
                className="relative"
                variants={itemVariants}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Adresse email"
                  required
                />
              </motion.div>

              <motion.div 
                className="relative"
                variants={itemVariants}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </motion.div>

              {error && (
                <motion.div 
                  className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center space-x-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-white font-medium transition-all duration-200 ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/20000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-6 text-center text-sm text-gray-500"
              variants={itemVariants}
            >
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour à l'accueil</span>
              </Link>
            </motion.div>
          </motion.div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Pour toute assistance, veuillez contacter le support technique</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
