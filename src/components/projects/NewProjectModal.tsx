import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/lib/utils';
import type { Project } from '@/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject } = useProjectStore();
  const { addToast } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    totalAmount: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.client) {
      addToast({
        type: 'error',
        message: 'Lütfen proje adı ve müşteri adını girin',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newProject: Project = {
        id: generateId(),
        name: formData.name,
        client: formData.client,
        status: 'active',
        startDate: new Date().toISOString(),
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: 0,
        progress: 0,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addProject(newProject);
      
      addToast({
        type: 'success',
        message: `${formData.name} projesi oluşturuldu!`,
      });

      // Reset form
      setFormData({
        name: '',
        client: '',
        totalAmount: '',
        description: '',
      });
      
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Proje oluşturulurken bir hata oluştu',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Proje Oluştur" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Proje Adı *"
          placeholder="Örn: Logo Tasarımı"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Müşteri Adı *"
          placeholder="Örn: ABC Şirketi"
          value={formData.client}
          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          required
        />

        <Input
          label="Toplam Tutar (₺)"
          type="number"
          placeholder="0.00"
          value={formData.totalAmount}
          onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
          min="0"
          step="0.01"
        />

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            Açıklama
          </label>
          <textarea
            className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 min-h-[100px] resize-none"
            placeholder="Proje detayları..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting}
          >
            Oluştur
          </Button>
        </div>
      </form>
    </Modal>
  );
};
