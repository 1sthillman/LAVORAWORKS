import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/lib/utils';
import type { WorkflowItem } from '@/types';
import { db } from '@/lib/db';

interface NewWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { projects } = useProjectStore();
  const { addToast } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    stage: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.projectId) {
      addToast({
        type: 'error',
        message: 'Lütfen iş adı ve proje seçin',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newWorkflow: WorkflowItem = {
        id: generateId(),
        name: formData.name,
        projectId: formData.projectId,
        status: 'pending',
        stage: formData.stage || 'Yeni',
        priority: formData.priority,
        progress: 0,
        notes: formData.notes,
        dueDate: formData.dueDate || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveWorkflowItem(newWorkflow);
      
      addToast({
        type: 'success',
        message: `${formData.name} işi oluşturuldu!`,
      });

      // Reset form
      setFormData({
        name: '',
        projectId: '',
        stage: '',
        priority: 'medium',
        dueDate: '',
        notes: '',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'İş oluşturulurken bir hata oluştu',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni İş Oluştur" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="İş Adı *"
          placeholder="Örn: Logo tasarımı"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            Proje *
          </label>
          <select
            className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            required
          >
            <option value="">Proje seçin...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Aşama"
          placeholder="Örn: Tasarım, Geliştirme"
          value={formData.stage}
          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Öncelik
            </label>
            <select
              className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>

          <Input
            label="Bitiş Tarihi"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            Notlar
          </label>
          <textarea
            className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 min-h-[100px] resize-none"
            placeholder="İş detayları..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
