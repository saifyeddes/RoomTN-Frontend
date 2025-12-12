import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AdminFormProps {
  initialData: User | null;
  onSubmit: (formData: {
    full_name: string;
    email: string;
    password?: string;
    role: 'admin' | 'super_admin';
  }) => Promise<void> | void;
  onCancel: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { user: currentUser } = useAuth();
  
  type FormData = {
    full_name: string;
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
  };
  
  // Type pour les données soumises (peut ne pas avoir de mot de passe)
  type SubmitData = Omit<FormData, 'password'> & { password?: string };

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name,
        email: initialData.email,
        password: '', // Ne pas pré-remplir le mot de passe
        role: initialData.role as 'admin' | 'super_admin',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'admin',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation des champs requis
    if (!formData.full_name.trim()) {
      setError('Le nom complet est requis');
      return;
    }
    
    // Validation de l'email
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    // Validation du mot de passe pour les nouveaux utilisateurs
    if (!initialData && (!formData.password || formData.password.length < 6)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Création d'un nouvel objet avec uniquement les champs nécessaires
      const submitData: SubmitData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role
      };
      
      // Ajouter le mot de passe uniquement s'il est fourni et non vide
      if (formData.password) {
        submitData.password = formData.password;
      }
      
      // Si l'utilisateur n'est pas super_admin, forcer le rôle à 'admin'
      if (currentUser?.role !== 'super_admin') {
        submitData.role = 'admin';
      }
      
      await onSubmit(submitData);
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-2 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input
          type="text"
          name="full_name"
          id="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe {initialData ? '(laisser vide pour ne pas changer)' : ''}
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required={!initialData}
          placeholder={initialData ? '•••••••• (laisser vide pour ne pas changer)' : 'Mot de passe (min 6 caractères)'}
          minLength={initialData ? 0 : 6}
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
        <select
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="admin">Admin</option>
          {currentUser?.role === 'super_admin' && (
            <option value="super_admin">Super Admin</option>
          )}
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Mise à jour...' : 'Création...'}
            </>
          ) : initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default AdminForm;
