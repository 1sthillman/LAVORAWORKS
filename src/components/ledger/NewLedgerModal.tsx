import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/lib/utils';
import type { LedgerEntry } from '@/types';
import { db } from '@/lib/db';

interface NewLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSuccess: () => void;
}

export const NewLedgerModal: React.FC<NewLedgerModalProps> = ({ isOpen, onClose, type, onSuccess }) => {
  const { addToast } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    vatRate: '20',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'other',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      addToast({
        type: 'error',
        message: 'Lütfen açıklama ve tutar girin',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      const vatRate = parseFloat(formData.vatRate);
      const vatAmount = (amount * vatRate) / 100;
      const totalWithVat = amount + vatAmount;

      const newEntry: LedgerEntry = {
        id: generateId(),
        type,
        amount,
        description: formData.description,
        category: formData.category || (type === 'income' ? 'Satış' : 'Genel Gider'),
        date: formData.date,
        vatRate,
        vatAmount,
        totalWithVat,
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveLedgerEntry(newEntry);
      
      addToast({
        type: 'success',
        message: `${type === 'income' ? 'Gelir' : 'Gider'} kaydı eklendi!`,
      });

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        vatRate: '20',
        paymentMethod: 'cash',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Kayıt eklenirken bir hata oluştu',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={type === 'income' ? 'Yeni Gelir' : 'Yeni Gider'} 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Açıklama *"
          placeholder="Örn: Müşteri ödemesi"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <Input
          label="Tutar (₺) *"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          min="0"
          step="0.01"
          required
        />

        <Input
          label="Kategori"
          placeholder={type === 'income' ? 'Örn: Satış' : 'Örn: Ofis Gideri'}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />

        <Input
          label="Tarih *"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="KDV Oranı (%)"
            type="number"
            value={formData.vatRate}
            onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
            min="0"
            max="100"
            step="1"
          />

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Ödeme Yöntemi
            </label>
            <select
              className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
            >
              <option value="cash">Nakit</option>
              <option value="card">Kart</option>
              <option value="transfer">Havale</option>
              <option value="other">Diğer</option>
            </select>
          </div>
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
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
};
