import React, { useEffect, useState, useCallback } from 'react';
import type { User } from '../../types';
import { Plus, Edit, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import AdminForm from './AdminForm';
import { adminUsers } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser extends User { 
  isApproved?: boolean;
  created_at: string;
}

interface BackendUser {
  _id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  isApproved?: boolean;
}

const UserManagement: React.FC = () => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => Promise<void>) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const { user: currentUser } = useAuth();

  const toggleUserDetails = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const mapFromBackend = useCallback((u: BackendUser): AdminUser => ({
    id: u._id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    created_at: u.createdAt,
    isApproved: u.isApproved,
  }), []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminUsers.list() as BackendUser[];
        setAdmins((data || []).map(mapFromBackend));
      } catch (error) {
        console.error('Failed to load admins', error);
      }
    };
    load();
  }, [mapFromBackend]);

  const handleOpenModal = (admin?: AdminUser) => {
    console.log('Opening modal for admin:', admin);
    setEditingAdmin(admin || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    // Reset editingAdmin après un court délai pour permettre l'animation de fermeture
    setTimeout(() => setEditingAdmin(null), 300);
  };

  const handleFormSubmit = async (formData: { 
    full_name: string; 
    email: string; 
    password?: string; 
    role: 'admin' | 'super_admin' 
  }) => {
    console.log('Submitting form:', formData);
    try {
      if (editingAdmin) {
        // Pour la mise à jour, ne pas envoyer le mot de passe s'il n'est pas modifié
        const { password, ...updateData } = formData;
        const dataToUpdate = password ? formData : updateData;
        await adminUsers.update(editingAdmin.id, dataToUpdate);
      } else {
        // Pour la création, le mot de passe est obligatoire
        if (!formData.password) {
          throw new Error('Le mot de passe est obligatoire pour un nouvel administrateur');
        }
        await adminUsers.create(formData);
      }
      // Recharger la liste des administrateurs
      const data = await adminUsers.list() as BackendUser[];
      setAdmins((data || []).map(mapFromBackend));
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde', error);
      // Ici, vous pourriez ajouter un état pour afficher l'erreur à l'utilisateur
    }
  };

  const handleApprove = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    setConfirmationState({
      isOpen: true,
      title: "Confirmer l'approbation",
      message: `Êtes-vous sûr de vouloir approuver l'administrateur ${admin?.full_name} ?`,
      onConfirm: async () => {
        try {
          await adminUsers.approve(adminId);
          const data = await adminUsers.list() as BackendUser[];
          setAdmins((data || []).map(mapFromBackend));
        } catch (error) {
          console.error('Erreur lors de l\'approbation', error);
        } finally {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    setConfirmationState({
      isOpen: true,
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'administrateur ${admin?.full_name} ?`,
      onConfirm: async () => {
        try {
          await adminUsers.delete(adminId);
          setAdmins(admins.filter(admin => admin.id !== adminId));
        } catch (error) {
          console.error('Erreur lors de la suppression', error);
        } finally {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleApproveAll = () => {
    const unapprovedCount = admins.filter(admin => !admin.isApproved).length;
    setConfirmationState({
      isOpen: true,
      title: 'Confirmer les approbations',
      message: `Êtes-vous sûr de vouloir approuver les ${unapprovedCount} administrateurs en attente ?`,
      onConfirm: async () => {
        try {
          const unapprovedAdmins = admins.filter(admin => !admin.isApproved);
          for (const admin of unapprovedAdmins) {
            await adminUsers.approve(admin.id);
          }
          const data = await adminUsers.list() as BackendUser[];
          setAdmins((data || []).map(mapFromBackend));
        } catch (error) {
          console.error('Erreur lors de l\'approbation multiple', error);
        } finally {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Rôle et style sont gérés directement dans le JSX

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des administrateurs</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {currentUser?.role === 'super_admin' && (
            <button
              onClick={handleApproveAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm"
            >
              <CheckCircle2 size={16} className="mr-1.5" />
              Tout approuver
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-sm"
          >
            <Plus size={16} className="mr-1.5" />
            Ajouter un admin
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {admins.map((admin) => {
          // Suppression de la variable roleBadge non utilisée
          const isCurrentUser = admin.id === currentUser?.id;
          
          return (
            <div key={admin.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 flex justify-between items-center">
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-gray-900 truncate">{admin.full_name}</h3>
                  <p className="text-sm text-gray-500 truncate">{admin.email}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenModal(admin)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleUserDetails(admin.id)}
                    className={`p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all ${expandedUser === admin.id ? 'rotate-180' : ''}`}
                    title={expandedUser === admin.id ? 'Réduire' : 'Voir les détails'}
                  >
                    {expandedUser === admin.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              
              {expandedUser === admin.id && (
                <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Rôle</p>
                      <p className="font-medium">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Statut</p>
                      <p>
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {admin.isApproved ? 'Approuvé' : 'En attente'}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Date de création</p>
                      <p className="font-medium">
                        {new Date(admin.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {currentUser?.role === 'super_admin' && !admin.isApproved && (
                      <div className="flex items-end">
                        <button
                          onClick={() => handleApprove(admin.id)}
                          className="text-sm text-green-600 hover:text-green-800 flex items-center"
                          title="Approuver"
                        >
                          <CheckCircle2 size={16} className="mr-1.5" />
                          Approuver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title={editingAdmin ? 'Modifier l\'administrateur' : 'Nouvel administrateur'}
        >
          <div className="p-1">
            <AdminForm
              key={editingAdmin?.id || 'new-admin'}
              initialData={editingAdmin}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={() => {
          if (confirmationState.onConfirm) {
            confirmationState.onConfirm();
          }
        }}
        onCancel={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default UserManagement;
