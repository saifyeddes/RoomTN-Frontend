import React, { useEffect, useState } from 'react';
import { ChevronDown, CheckCircle, XCircle, FileText, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orders as ordersApi } from '../../services/api';

type BackendOrderItem = {
  product_id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
};

type BackendOrder = {
  _id: string;
  user_email: string;
  user_full_name: string;
  items: BackendOrderItem[];
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  shipping_address: string;
  phone: string;
  createdAt: string;
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, orderId: string | null}>({ show: false, orderId: null });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data: BackendOrder[] = await ordersApi.list();
        setOrders(data);
      } catch (e) {
        console.error('Failed to load orders', e);
        setError("Impossible de charger les commandes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (orderId: string) => {
    try {
      const updated = await ordersApi.approve(orderId);
      setOrders(prev => prev.map(o => (o._id === orderId ? updated : o)));
    } catch (e) {
      console.error('approve failed', e);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await ordersApi.reject(orderId);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'rejected' as const } : order
      ));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'rejected' });
      }
    } catch (err) {
      console.error('Failed to reject order', err);
      alert('Échec du rejet de la commande');
    }
  };

  const handleDelete = async (orderId: string, isMobile = false) => {
    if (isMobile) {
      setShowDeleteConfirm({ show: true, orderId });
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      return;
    }
    
    await executeDelete(orderId);
  };

  const executeDelete = async (orderId: string) => {
    try {
      setDeletingId(orderId);
      await ordersApi.delete(orderId);
      setOrders(orders.filter(order => order._id !== orderId));
      
      if (selectedOrder?._id === orderId) {
        setShowMobileDetails(false);
        setSelectedOrder(null);
      }
      
      // Fermer la confirmation mobile si elle est ouverte
      setShowDeleteConfirm({ show: false, orderId: null });
    } catch (err) {
      console.error('Failed to delete order', err);
      alert('Échec de la suppression de la commande');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadge = (status: BackendOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenPdf = async (orderId: string) => {
    try {
      setDownloadingId(orderId);
      const blob = await ordersApi.downloadPdf(orderId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error('download pdf failed', e);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête amélioré */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez et suivez les commandes de vos clients
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                {orders.length} commande{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      {loading && <div className="text-center py-8 text-gray-600">Chargement des commandes...</div>}
      
      {/* Zone de contenu principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vue Tableau (Desktop) */}
        <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => toggleExpandOrder(order._id)} className="text-gray-500 hover:text-gray-700">
                          <ChevronDown className={`h-5 w-5 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user_full_name} ({order.user_email})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.total_amount.toFixed(3)} TND</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenPdf(order._id)} 
                            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            disabled={downloadingId===order._id}
                            title="Télécharger la facture"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleApprove(order._id)} 
                            className="p-1.5 rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Valider la commande"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleReject(order._id)} 
                            className="p-1.5 rounded-full text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            title="Rejeter la commande"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-1.5 rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            disabled={deletingId === order._id}
                            title="Supprimer la commande"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="p-4 bg-white rounded-md shadow-inner">
                            <h4 className="font-bold text-md mb-2">Détails de la commande</h4>
                            <p><strong>Adresse de livraison:</strong> {order.shipping_address}</p>
                            <p><strong>Téléphone:</strong> {order.phone}</p>
                            <div className="mt-4">
                              <h5 className="font-semibold mb-2">Articles:</h5>
                              <ul>
                                {order.items.map((item, idx) => (
                                  <li key={`${order._id}-${idx}`} className="flex justify-between items-center py-1 border-b last:border-b-0">
                                    <div>
                                      <span className="font-medium">{item.name}</span>
                                      <span className="text-sm text-gray-500 ml-2">(Taille: {item.size}, Couleur: {item.color})</span>
                                    </div>
                                    <span>{item.quantity} x {item.price.toFixed(3)} TND</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vue Cartes (Mobile) */}
        <div className="md:hidden space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
              onClick={() => {
                setSelectedOrder(order);
                setShowMobileDetails(true);
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Commande #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.user_full_name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status === 'pending' ? 'En attente' : order.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </span>
                    <span className="mt-1 text-sm font-medium text-gray-900">{order.total_amount.toFixed(3)} TND</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order._id, true);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={deletingId === order._id}
                    title="Supprimer la commande"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPdf(order._id);
                    }}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={downloadingId === order._id}
                    title="Télécharger la facture"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(order._id);
                    }}
                    className="p-1.5 rounded-full text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    title="Rejeter la commande"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(order._id);
                    }}
                    className="p-1.5 rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    title="Valider la commande"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal des détails de commande (Mobile) */}
        <AnimatePresence>
          {showMobileDetails && selectedOrder && (
            <motion.div
              className="fixed inset-0 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileDetails(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 1)'
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <motion.div
                  className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxHeight: '90vh',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <div className="bg-white">
                    {/* En-tête du modal */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Détails de la commande
                      </h3>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowMobileDetails(false)}
                      >
                        <span className="sr-only">Fermer</span>
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Contenu défilable */}
                    <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
                      {/* Informations client */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h4 className="ml-3 text-base font-medium text-gray-900">Client</h4>
                        </div>
                        <div className="ml-10 space-y-1">
                          <p className="text-sm font-medium text-gray-900">{selectedOrder.user_full_name}</p>
                          <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
                          <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                        </div>
                      </div>

                      {/* Adresse de livraison */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <h4 className="ml-3 text-base font-medium text-gray-900">Adresse de livraison</h4>
                        </div>
                        <div className="ml-10">
                          <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                        </div>
                      </div>

                      {/* Articles commandés */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <h4 className="ml-3 text-base font-medium text-gray-900">
                            Articles ({selectedOrder.items.length})
                          </h4>
                        </div>
                        
                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                          <ul className="divide-y divide-gray-200">
                            {selectedOrder.items.map((item, idx) => (
                              <li key={idx} className="p-3 hover:bg-gray-50">
                                <div className="flex items-center">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <div className="flex mt-1 space-x-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {item.size}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        {item.color}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        Qté: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {(item.price * item.quantity).toFixed(3)} TND
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <p>Total</p>
                              <p>{selectedOrder.total_amount.toFixed(3)} TND</p>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Date de commande: {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pied de page avec actions */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                      <button
                        type="button"
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          handleOpenPdf(selectedOrder._id);
                          setShowMobileDetails(false);
                        }}
                        disabled={downloadingId === selectedOrder._id}
                        title="Télécharger la facture"
                      >
                        <FileText className="h-6 w-6" />
                      </button>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            handleReject(selectedOrder._id);
                            setShowMobileDetails(false);
                          }}
                          title="Rejeter la commande"
                        >
                          <XCircle className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => {
                            handleApprove(selectedOrder._id);
                            setShowMobileDetails(false);
                          }}
                          title="Valider la commande"
                        >
                          <CheckCircle className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de confirmation de suppression mobile */}
      <AnimatePresence>
        {showDeleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supprimer la commande</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
                </p>
                <div className="w-full flex justify-between space-x-4">
                  <button
                    type="button"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowDeleteConfirm({ show: false, orderId: null })}
                    disabled={deletingId === showDeleteConfirm.orderId}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    onClick={() => showDeleteConfirm.orderId && executeDelete(showDeleteConfirm.orderId)}
                    disabled={deletingId === showDeleteConfirm.orderId}
                  >
                    {deletingId === showDeleteConfirm.orderId ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;