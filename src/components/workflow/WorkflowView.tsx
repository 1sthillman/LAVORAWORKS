import React, { useEffect, useState } from 'react';
import { Plus, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NewWorkflowModal } from './NewWorkflowModal';
import type { WorkflowItem } from '@/types';
import { db } from '@/lib/db';
import { cn, getStatusColor, getPriorityColor } from '@/lib/utils';

export const WorkflowView: React.FC = () => {
  const { projects } = useProjectStore();
  const { activeModal, setActiveModal } = useAppStore();
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    loadWorkflowItems();
  }, []);

  const loadWorkflowItems = async () => {
    const items = await db.getWorkflowItems();
    setWorkflowItems(items);
  };

  const filteredItems = workflowItems.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl p-4">
          <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2" />
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {workflowItems.filter((i) => i.status === 'pending').length}
          </p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Bekleyen</p>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-2xl p-4">
          <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {workflowItems.filter((i) => i.status === 'in-progress').length}
          </p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Devam Ediyor</p>
        </div>

        <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {workflowItems.filter((i) => i.status === 'completed').length}
          </p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Tamamlandı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'pending', 'in-progress', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors',
              filter === f
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            {f === 'all' && 'Tümü'}
            {f === 'pending' && 'Bekleyen'}
            {f === 'in-progress' && 'Devam Ediyor'}
            {f === 'completed' && 'Tamamlandı'}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <Button variant="primary" className="flex-1" onClick={() => setActiveModal('new-workflow')}>
          <Plus className="w-5 h-5 mr-2" />
          Yeni İş
        </Button>
        <Button variant="secondary">
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Workflow Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Henüz iş yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-6">
              İlk işinizi oluşturarak başlayın
            </p>
            <Button onClick={() => setActiveModal('new-workflow')}>
              <Plus className="w-5 h-5 mr-2" />
              İş Oluştur
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const project = getProject(item.projectId);
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      item.status === 'completed' && 'bg-green-100 dark:bg-green-900/20',
                      item.status === 'in-progress' && 'bg-blue-100 dark:bg-blue-900/20',
                      item.status === 'pending' && 'bg-yellow-100 dark:bg-yellow-900/20'
                    )}
                  >
                    {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {item.status === 'in-progress' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                    {item.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 mb-1">
                      {item.name}
                    </h3>
                    {project && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">
                        {project.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('px-2.5 py-1 rounded-lg text-xs font-extrabold', getStatusColor(item.status))}>
                        {item.status === 'pending' && 'Bekleyen'}
                        {item.status === 'in-progress' && 'Devam Ediyor'}
                        {item.status === 'completed' && 'Tamamlandı'}
                      </span>
                      <span className={cn('px-2.5 py-1 rounded-lg text-xs font-extrabold', getPriorityColor(item.priority))}>
                        {item.priority === 'low' && 'Düşük'}
                        {item.priority === 'medium' && 'Orta'}
                        {item.priority === 'high' && 'Yüksek'}
                        {item.priority === 'urgent' && 'Acil'}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                      {item.progress}%
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal */}
      <NewWorkflowModal
        isOpen={activeModal === 'new-workflow'}
        onClose={() => setActiveModal(null)}
        onSuccess={loadWorkflowItems}
      />
    </div>
  );
};
