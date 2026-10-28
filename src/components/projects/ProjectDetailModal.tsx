import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Edit2, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import type { Project } from '@/types';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project }) => {
  const { deleteProject, updateProject } = useProjectStore();
  const { addToast, setActiveModal } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) return null;

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      addToast({
        type: 'success',
        message: 'Proje silindi',
      });
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Silme hatası',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: Project['status']) => {
    try {
      await updateProject(project.id, { status });
      addToast({
        type: 'success',
        message: 'Durum güncellendi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Güncelleme hatası',
      });
    }
  };

  const remainingAmount = project.totalAmount - project.paidAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="lg">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">
              {project.client}
            </p>
            <span className={cn('inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-extrabold', getStatusColor(project.status))}>
              {project.status === 'active' && 'Aktif'}
              {project.status === 'completed' && 'Tamamlandı'}
              {project.status === 'paused' && 'Beklemede'}
              {project.status === 'cancelled' && 'İptal'}
            </span>
          </div>
          <Button variant="ghost" onClick={() => setActiveModal('edit-project')}>
            <Edit2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-gray-900 dark:text-gray-100">İlerleme</span>
            </div>
            <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              {project.progress}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Toplam Tutar</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {formatCurrency(project.totalAmount)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Ödenen</span>
            </div>
            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              {formatCurrency(project.paidAmount)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Kalan</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatCurrency(remainingAmount)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Bitiş</span>
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              {project.dueDate ? formatDate(project.dueDate, 'short') : 'Belirsiz'}
            </p>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Açıklama</h3>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">
              {project.description}
            </p>
          </div>
        )}

        {/* Status Quick Actions */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Durum Değiştir</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={project.status === 'active' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange('active')}
              size="sm"
            >
              Aktif
            </Button>
            <Button
              variant={project.status === 'paused' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange('paused')}
              size="sm"
            >
              Beklemede
            </Button>
            <Button
              variant={project.status === 'completed' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange('completed')}
              size="sm"
            >
              Tamamlandı
            </Button>
            <Button
              variant={project.status === 'cancelled' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange('cancelled')}
              size="sm"
            >
              İptal
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex-1"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Sil
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Kapat
          </Button>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Projeyi Sil"
        message={`"${project.name}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
        confirmText="Evet, Sil"
        cancelText="İptal"
        type="danger"
      />
    </Modal>
  );
};
