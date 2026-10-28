import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { WorkflowView } from '@/components/workflow/WorkflowView';
import { LedgerView } from '@/components/ledger/LedgerView';
import { FilesView } from '@/components/files/FilesView';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OCRScanner } from '@/components/features/OCRScanner';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { useProjectStore } from '@/store/useProjectStore';
import { db } from '@/lib/db';

function App() {
  const { currentView, toasts, removeToast, activeModal, setActiveModal } = useAppStore();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    // Initialize IndexedDB and load data
    const initDB = async () => {
      try {
        await db.init();
        
        // Load projects from DB
        await loadProjects();
        
        console.log('✅ Database initialized');
      } catch (error) {
        console.error('❌ DB initialization error:', error);
      }
    };
    
    initDB();
  }, [loadProjects]);

  const renderView = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectsView />;
      case 'workflow':
        return <WorkflowView />;
      case 'ledger':
        return <LedgerView />;
      case 'files':
        return <FilesView />;
      default:
        return <ProjectsView />;
    }
  };

  return (
    <>
      <Layout>{renderView()}</Layout>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Global Modals */}
      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
      />
      <OCRScanner
        isOpen={activeModal === 'photo-capture'}
        onClose={() => setActiveModal(null)}
        onTableExtracted={(data) => {
          console.log('Tablo verisi:', data);
          setActiveModal(null);
        }}
        mode="table"
      />
    </>
  );
}

export default App;
