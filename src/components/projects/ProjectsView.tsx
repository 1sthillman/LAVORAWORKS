import { useEffect, useState } from 'react';
import { Plus, Filter, FolderOpen, Upload, Download } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { ProjectCard } from './ProjectCard';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import type { Project } from '@/types';
import { excelService } from '@/services/excel.service';
import { printService } from '@/services/print.service';

export function ProjectsView() {
  const { projects, isLoading, loadProjects, selectProject, selectedProject, deleteProject } = useProjectStore();
  const { searchQuery, addToast } = useAppStore();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple stats - no infinite loop
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  const handleViewDetails = (project: Project) => {
    selectProject(project);
    setShowDetailModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowNewModal(true);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`"${project.name}" projesini silmek istediğinizden emin misiniz?`)) return;

    try {
      await deleteProject(project.id);
      addToast({
        type: 'success',
        message: 'Proje başarıyla silindi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Proje silinemedi',
      });
    }
  };

  const handleExportPDF = async (project: Project) => {
    try {
      await printService.exportProjectPDF(project);
      addToast({
        type: 'success',
        message: 'PDF başarıyla indirildi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'PDF oluşturulamadı',
      });
    }
  };

  const handleExportExcel = async (project: Project) => {
    try {
      await excelService.exportProject(project);
      addToast({
        type: 'success',
        message: 'Excel dosyası başarıyla indirildi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Excel dosyası oluşturulamadı',
      });
    }
  };

  const handleExportAllProjects = async () => {
    try {
      await excelService.exportProjects(projects);
      addToast({
        type: 'success',
        message: 'Tüm projeler Excel\'e aktarıldı',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Dışa aktarma başarısız',
      });
    }
  };

  const handleImportProjects = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedProjects = await excelService.importProjects(file);
      
      addToast({
        type: 'success',
        message: `${importedProjects.length} proje başarıyla içe aktarıldı`,
      });

      // Reload projects
      await loadProjects();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'İçe aktarma başarısız: ' + (error as Error).message,
      });
    }

    // Reset input
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn pb-24">
      {/* Simple Stats Bar */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">Toplam Proje</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl">
            <div className="text-3xl font-bold">{stats.active}</div>
            <div className="text-sm opacity-90">Aktif</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="text-sm opacity-90">Tamamlandı</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4 px-4">
        <button
          onClick={() => {
            setEditingProject(null);
            setShowNewModal(true);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-lg shadow-teal-600/30"
        >
          <Plus className="w-5 h-5" />
          Yeni Proje
        </button>

        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer">
          <Upload className="w-5 h-5" />
          <span className="hidden sm:inline">Excel'den Yükle</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportProjects}
            className="hidden"
          />
        </label>

        {projects.length > 0 && (
          <button
            onClick={handleExportAllProjects}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Excel'e Aktar</span>
          </button>
        )}

        <button className="flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Projects Grid */}
      <div className="px-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'Proje bulunamadı' : 'Henüz proje yok'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-6">
              {searchQuery
                ? 'Farklı bir arama terimi deneyin'
                : 'İlk projenizi oluşturarak başlayın veya Excel\'den içe aktarın'}
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowNewModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Proje Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          setEditingProject(null);
        }}
        editProject={editingProject}
      />

      <ProjectDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          selectProject(null);
        }}
        project={selectedProject}
        onEdit={(project) => {
          setShowDetailModal(false);
          handleEdit(project);
        }}
      />
    </div>
  );
}
