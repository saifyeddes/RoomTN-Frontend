import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, Mail, CreditCard, Check, Clock, Package, Shield, Truck, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { orders as ordersApi, products as productsApi } from '../services/api';
import { ASSETS_BASE } from '../services/api';

interface OrderItem {
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  paymentMethod: string;
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', 
    email: '',    
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'À la livraison' 
  });

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Charger les détails complets des produits
  useEffect(() => {
    const loadProductDetails = async () => {
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await productsApi.getById(item.product_id);
            return {
              ...item,
              name: product.name,
              image: product.images?.[0] ? `${ASSETS_BASE}${product.images[0].url}` : ''
            };
          } catch (error) {
            console.error('Error loading product:', error);
            return {
              ...item,
              name: 'Produit non disponible',
              image: ''
            };
          }
        })
      );
      setOrderItems(itemsWithDetails);
    };

    if (items.length > 0) {
      loadProductDetails();
    }
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItemsPayload = items.map(item => ({
        product_id: item.product_id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        user_email: formData.email,
        user_full_name: formData.fullName,
        items: items.map((it) => ({
          product_id: it.product_id,
          name: it.product.name,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          price: it.product.price,
        })),
        shipping_address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
        phone: formData.phone,
      };

      const order = await ordersApi.create(payload);
      
      // Créer les détails de la commande pour l'affichage
      const orderDetails: OrderDetails = {
        id: order.id || 'N/A',
        items: orderItems,
        total: totalPrice,
        status: 'En attente de confirmation',
        createdAt: new Date().toISOString(),
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod
      };
      
      setOrderDetails(orderDetails);
      setOrderPlaced(true);
      clearCart();
      
      // Faire défiler vers le haut de la page
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de confirmation */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-100 to-green-50 border-4 border-green-200">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-gray-900">Commande confirmée !</h1>
            <p className="mt-4 text-xl text-gray-600">Merci pour votre confiance, {formData.fullName} !</p>
            
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center text-yellow-600">
                  <Clock className="h-6 w-6 mr-2" />
                  <span className="font-medium">Confirmation en attente</span>
                </div>
                <div className="h-1 w-12 bg-gray-200 rounded-full"></div>
                <div className="text-gray-400">
                  <Package className="h-6 w-6 mx-auto" />
                  <span className="text-sm mt-1 block">En préparation</span>
                </div>
                <div className="h-1 w-12 bg-gray-200 rounded-full"></div>
                <div className="text-gray-400">
                  <Truck className="h-6 w-6 mx-auto" />
                  <span className="text-sm mt-1 block">Expédiée</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Important</p>
                    <p className="text-blue-700">
                      Notre équipe va vous contacter dans les 24 heures pour confirmer votre commande. 
                      Veuillez garder votre téléphone à portée de main.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Récapitulatif de la commande</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                N° de commande: <span className="font-medium">{orderDetails.id}</span>
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date de commande</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(orderDetails.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {orderDetails.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Adresse de livraison</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {orderDetails.address}<br />
                    {orderDetails.postalCode} {orderDetails.city}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Méthode de paiement</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {orderDetails.paymentMethod === 'cash' ? 'Paiement à la livraison' : 'Carte bancaire'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Articles de la commande */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Articles commandés</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {orderItems.map((item, index) => (
                <div key={index} className="px-4 py-5 sm:px-6 flex items-start">
                  <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-base font-medium text-gray-900">{item.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Taille: {item.size} | Couleur: {item.color}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-base font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>{formatPrice(orderDetails.total)}</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Les frais de livraison seront calculés lors de la confirmation de la commande.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Besoin d'aide ?
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Notre service client est à votre disposition pour toute question concernant votre commande.
                </p>
              </div>
              <div className="mt-5">
                <a
                  href="tel:+21612345678"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Phone className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                  Appeler le support
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Mail className="-ml-1 mr-2 h-5 w-5" />
                  Nous contacter
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de commande */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Informations de livraison
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Votre nom complet"
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="+216 XX XXX XXX"
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Adresse de livraison */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <div className="relative">
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Rue, numéro, étage, etc."
                  />
                  <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Tunis"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Mode de paiement */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      id="paymentMethod"
                      name="paymentMethod"
                      value="Paiement à la livraison"
                      readOnly
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                    <input type="hidden" name="paymentMethod" value="À la livraison" />
                    <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
              </button>
            </form>
          </div>

          {/* Résumé de la commande */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Résumé de la commande
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Taille: {item.size} | Couleur: {item.color}
                    </p>
                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Sous-total:</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Livraison:</span>
                <span className="font-semibold text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Informations de livraison</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Livraison gratuite en Tunisie</li>
                <li>• Délai de livraison: 2-5 jours ouvrables</li>
                <li>• Paiement à la livraison disponible</li>
                <li>• Retour gratuit sous 14 jours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;