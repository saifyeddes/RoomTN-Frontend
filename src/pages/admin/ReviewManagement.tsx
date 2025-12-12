import React, { useState } from 'react';
import { mockReviews } from '../../lib/mockData';
import type { Review } from '../../types';
import { Star, Trash2 } from 'lucide-react';

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      // In a real app, you would also make an API call to delete the review.
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={i < rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gérer les Avis</h1>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{renderStars(review.rating)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate">{review.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(review.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800">{review.product.name}</h4>
                <p className="text-sm text-gray-600">par {review.user.full_name}</p>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
              <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-900">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewManagement;

