import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project } from '@/types';
import { db } from '@/lib/db';
import { generateAvatar, generateColorFromString } from '@/utils/formatters';

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type ProjectPriority = 'low' | 'normal' | 'high';

interface ProjectFilters {
  status: ProjectStatus[];
  priority: ProjectPriority[];
  clients: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: ProjectFilters;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearFilters: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'avatar' | 'color'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;

  // Getters (filtered)
  getFilteredProjects: () => Project[];
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getProjectsByClient: (client: string) => Project[];
  getActiveProjects: () => Project[];

  // Stats
  getStats: () => {
    total: number;
    active: number;
    completed: number;
    paused: number;
    cancelled: number;
    totalRevenue: number;
    totalPaid: number;
    totalUnpaid: number;
    averageProgress: number;
  };

  // Client list
  getUniqueClients: () => string[];
}

const defaultFilters: ProjectFilters = {
  status: [],
  priority: [],
  clients: [],
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      isLoading: false,
      error: null,

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearFilters: () => set({ filters: defaultFilters }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await db.getProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      selectProject: (project) => set({ selectedProject: project }),

      addProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();
          const project: Project = {
            ...projectData,
            id: `proj-${Date.now()}`,
            avatar: generateAvatar(projectData.client || projectData.name),
            color: generateColorFromString(projectData.client || projectData.name),
            createdAt: now,
            updatedAt: now,
          };

          await db.saveProject(project);
          set((state) => ({
            projects: [...state.projects, project],
            isLoading: false,
          }));

          return project;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const project = get().projects.find((p) => p.id === id);
          if (!project) throw new Error('Project not found');

          const updatedProject = { ...project, ...updates, updatedAt: new Date().toISOString() };
          await db.saveProject(updatedProject);

          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
            selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await db.deleteProject(id);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      // Getters
      getFilteredProjects: () => {
        const { projects, filters, searchQuery } = get();
        let filtered = [...projects];

        // Status filter
        if (filters.status.length > 0) {
          filtered = filtered.filter((p) => filters.status.includes(p.status));
        }

        // Priority filter
        if (filters.priority.length > 0) {
          filtered = filtered.filter((p) => p.priority && filters.priority.includes(p.priority));
        }

        // Client filter
        if (filters.clients.length > 0) {
          filtered = filtered.filter((p) => filters.clients.includes(p.client));
        }

        // Date range filter
        if (filters.dateFrom) {
          filtered = filtered.filter((p) => p.startDate >= filters.dateFrom!);
        }
        if (filters.dateTo) {
          filtered = filtered.filter((p) => p.startDate <= filters.dateTo!);
        }

        // Amount range filter
        if (filters.amountMin !== undefined) {
          filtered = filtered.filter((p) => p.totalAmount >= filters.amountMin!);
        }
        if (filters.amountMax !== undefined) {
          filtered = filtered.filter((p) => p.totalAmount <= filters.amountMax!);
        }

        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.client.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query)
          );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        return filtered;
      },

      getProjectsByStatus: (status) => {
        return get().projects.filter((p) => p.status === status);
      },

      getProjectsByClient: (client) => {
        return get().projects.filter((p) => p.client === client);
      },

      getActiveProjects: () => {
        return get().projects.filter((p) => p.status === 'active');
      },

      // Stats
      getStats: () => {
        const projects = get().projects;

        const active = projects.filter((p) => p.status === 'active').length;
        const completed = projects.filter((p) => p.status === 'completed').length;
        const paused = projects.filter((p) => p.status === 'paused').length;
        const cancelled = projects.filter((p) => p.status === 'cancelled').length;

        const totalRevenue = projects.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPaid = projects.reduce((sum, p) => sum + p.paidAmount, 0);
        const totalUnpaid = totalRevenue - totalPaid;

        const averageProgress =
          projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;

        return {
          total: projects.length,
          active,
          completed,
          paused,
          cancelled,
          totalRevenue,
          totalPaid,
          totalUnpaid,
          averageProgress: Math.round(averageProgress),
        };
      },

      // Unique clients
      getUniqueClients: () => {
        const clients = new Set(get().projects.map((p) => p.client));
        return Array.from(clients).sort();
      },
    }),
    {
      name: 'lavora-project-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
