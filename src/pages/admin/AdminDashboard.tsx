import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users } from 'lucide-react';
import { adminStats } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ ordersCount: number; productsCount: number; totalRevenue: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminStats.get();
        setStats(data);
      } catch (e) {
        console.error('Failed to load admin stats', e);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value || 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      {loading && <div className="text-gray-600">Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Revenu total</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="bg-green-500 p-3 rounded-full text-white mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Commandes</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.ordersCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="bg-indigo-500 p-3 rounded-full text-white mr-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Produits</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.productsCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
