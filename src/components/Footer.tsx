import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="text-2xl font-bold mb-4">
              Room<span className="text-yellow-600">.tn</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Votre destination mode en Tunisie. Découvrez les dernières tendances 
              vestimentaires pour homme et femme avec des designs uniques et une qualité exceptionnelle.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/homme" className="text-gray-300 hover:text-yellow-600 transition-colors">
                  Homme
                </Link>
              </li>
              <li>
                <Link to="/category/femme" className="text-gray-300 hover:text-yellow-600 transition-colors">
                  Femme
                </Link>
              </li>
              <li>
                <Link to="/category/unisexe" className="text-gray-300 hover:text-yellow-600 transition-colors">
                  Unisexe
                </Link>
              </li>
              <li>
                <Link to="/featured" className="text-gray-300 hover:text-yellow-600 transition-colors">
                  Nouveautés
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-300">Korba, Tunisie</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-300">+216 50 913 115</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-300">contact@room.tn</span>
              </li>
              <li>
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-3 text-gray-300 hover:text-yellow-600 transition-colors"
                >
                  <span className="h-5 w-5 text-yellow-600">🔒</span>
                  <span>Accès Admin</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;