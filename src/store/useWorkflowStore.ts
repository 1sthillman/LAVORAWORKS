/**
 * Workflow (İş Akışı) Store
 * HTML v17'deki tüm workflow özellikleri
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkflowItem } from '@/types';
import { db } from '@/lib/db';

export type WorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type WorkflowPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkflowView = 'cards' | 'list' | 'grid';

interface WorkflowFilters {
  status: WorkflowStatus[];
  priority: WorkflowPriority[];
  projectIds: string[];
  assignedTo: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}

interface WorkflowState {
  // Data
  workflows: WorkflowItem[];
  selectedWorkflow: WorkflowItem | null;

  // Filters
  filters: WorkflowFilters;
  setFilters: (filters: Partial<WorkflowFilters>) => void;
  clearFilters: () => void;

  // View mode
  viewMode: WorkflowView;
  setViewMode: (mode: WorkflowView) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // CRUD operations
  loadWorkflows: (projectId?: string) => Promise<void>;
  addWorkflow: (workflow: Omit<WorkflowItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkflowItem>;
  updateWorkflow: (id: string, updates: Partial<WorkflowItem>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  setSelectedWorkflow: (workflow: WorkflowItem | null) => void;

  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: WorkflowStatus) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;

  // Getters (filtered)
  getFilteredWorkflows: () => WorkflowItem[];
  getWorkflowsByStatus: (status: WorkflowStatus) => WorkflowItem[];
  getWorkflowsByPriority: (priority: WorkflowPriority) => WorkflowItem[];
  getWorkflowsByProject: (projectId: string) => WorkflowItem[];

  // Stats
  getStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    urgent: number;
  };
}

const defaultFilters: WorkflowFilters = {
  status: [],
  priority: [],
  projectIds: [],
  assignedTo: [],
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Data
      workflows: [],
      selectedWorkflow: null,

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearFilters: () => set({ filters: defaultFilters }),

      // View mode
      viewMode: 'cards',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Load workflows
      loadWorkflows: async (projectId) => {
        try {
          const workflows = await db.getWorkflowItems(projectId);
          set({ workflows });
        } catch (error) {
          console.error('Workflow yükleme hatası:', error);
          throw error;
        }
      },

      // Add workflow
      addWorkflow: async (workflowData) => {
        const now = new Date().toISOString();
        const workflow: WorkflowItem = {
          ...workflowData,
          id: `wf-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };

        await db.saveWorkflowItem(workflow);
        set((state) => ({
          workflows: [...state.workflows, workflow],
        }));

        return workflow;
      },

      // Update workflow
      updateWorkflow: async (id, updates) => {
        const updatedWorkflow = {
          ...get().workflows.find((w) => w.id === id)!,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await db.saveWorkflowItem(updatedWorkflow);
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? updatedWorkflow : w)),
          selectedWorkflow: state.selectedWorkflow?.id === id ? updatedWorkflow : state.selectedWorkflow,
        }));
      },

      // Delete workflow
      deleteWorkflow: async (id) => {
        await db.deleteWorkflowItem(id);
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
        }));
      },

      setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),

      // Bulk operations
      bulkUpdateStatus: async (ids, status) => {
        const promises = ids.map((id) => get().updateWorkflow(id, { status }));
        await Promise.all(promises);
      },

      bulkDelete: async (ids) => {
        const promises = ids.map((id) => get().deleteWorkflow(id));
        await Promise.all(promises);
      },

      // Getters
      getFilteredWorkflows: () => {
        const { workflows, filters, searchQuery } = get();
        let filtered = [...workflows];

        // Status filter
        if (filters.status.length > 0) {
          filtered = filtered.filter((w) => filters.status.includes(w.status));
        }

        // Priority filter
        if (filters.priority.length > 0) {
          filtered = filtered.filter((w) => filters.priority.includes(w.priority));
        }

        // Project filter
        if (filters.projectIds.length > 0) {
          filtered = filtered.filter((w) => filters.projectIds.includes(w.projectId));
        }

        // Assigned to filter
        if (filters.assignedTo.length > 0) {
          filtered = filtered.filter((w) => w.assignedTo && filters.assignedTo.includes(w.assignedTo));
        }

        // Due date filter
        if (filters.dueDateFrom) {
          filtered = filtered.filter((w) => w.dueDate && w.dueDate >= filters.dueDateFrom!);
        }
        if (filters.dueDateTo) {
          filtered = filtered.filter((w) => w.dueDate && w.dueDate <= filters.dueDateTo!);
        }

        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (w) =>
              w.name.toLowerCase().includes(query) ||
              w.stage.toLowerCase().includes(query) ||
              w.notes?.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      getWorkflowsByStatus: (status) => {
        return get().workflows.filter((w) => w.status === status);
      },

      getWorkflowsByPriority: (priority) => {
        return get().workflows.filter((w) => w.priority === priority);
      },

      getWorkflowsByProject: (projectId) => {
        return get().workflows.filter((w) => w.projectId === projectId);
      },

      // Stats
      getStats: () => {
        const workflows = get().workflows;
        const now = new Date();

        return {
          total: workflows.length,
          pending: workflows.filter((w) => w.status === 'pending').length,
          inProgress: workflows.filter((w) => w.status === 'in-progress').length,
          completed: workflows.filter((w) => w.status === 'completed').length,
          cancelled: workflows.filter((w) => w.status === 'cancelled').length,
          overdue: workflows.filter(
            (w) => w.dueDate && new Date(w.dueDate) < now && w.status !== 'completed'
          ).length,
          urgent: workflows.filter((w) => w.priority === 'urgent').length,
        };
      },
    }),
    {
      name: 'lavora-workflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        filters: state.filters,
      }),
    }
  )
);
