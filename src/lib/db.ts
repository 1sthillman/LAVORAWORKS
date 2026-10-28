import type { Project, WorkflowItem, LedgerEntry, Settings } from '@/types';

const DB_NAME = 'LavoraWorkflowDB';
const DB_VERSION = 3; // Version artırıldı (receipts ve files store'ları için)

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Workflow items store
        if (!db.objectStoreNames.contains('workflowItems')) {
          const workflowStore = db.createObjectStore('workflowItems', { keyPath: 'id' });
          workflowStore.createIndex('projectId', 'projectId', { unique: false });
          workflowStore.createIndex('status', 'status', { unique: false });
          workflowStore.createIndex('priority', 'priority', { unique: false });
          workflowStore.createIndex('dueDate', 'dueDate', { unique: false });
        }

        // Ledger entries store
        if (!db.objectStoreNames.contains('ledgerEntries')) {
          const ledgerStore = db.createObjectStore('ledgerEntries', { keyPath: 'id' });
          ledgerStore.createIndex('type', 'type', { unique: false });
          ledgerStore.createIndex('date', 'date', { unique: false });
          ledgerStore.createIndex('category', 'category', { unique: false });
          ledgerStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Scans store (OCR taramaları)
        if (!db.objectStoreNames.contains('scans')) {
          const scanStore = db.createObjectStore('scans', { keyPath: 'id' });
          scanStore.createIndex('timestamp', 'timestamp', { unique: false });
          scanStore.createIndex('type', 'type', { unique: false });
        }

        // Photo gallery store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('projectId', 'projectId', { unique: false });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Receipts store (fiş/fatura fotoğrafları)
        if (!db.objectStoreNames.contains('receipts')) {
          const receiptStore = db.createObjectStore('receipts', { keyPath: 'id' });
          receiptStore.createIndex('ledgerId', 'ledgerId', { unique: false });
          receiptStore.createIndex('date', 'date', { unique: false });
          receiptStore.createIndex('type', 'type', { unique: false });
        }

        // Files store (dosya yönetimi)
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('projectId', 'projectId', { unique: false });
          fileStore.createIndex('category', 'category', { unique: false });
          fileStore.createIndex('uploadDate', 'uploadDate', { unique: false });
          fileStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  private getObjectStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const store = this.getObjectStore('projects');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    const store = this.getObjectStore('projects');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProject(project: Project): Promise<void> {
    const store = this.getObjectStore('projects', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(project);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    const store = this.getObjectStore('projects', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Workflow Items
  async getWorkflowItems(projectId?: string): Promise<WorkflowItem[]> {
    const store = this.getObjectStore('workflowItems');
    
    if (projectId) {
      const index = store.index('projectId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(projectId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveWorkflowItem(item: WorkflowItem): Promise<void> {
    const store = this.getObjectStore('workflowItems', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWorkflowItem(id: string): Promise<void> {
    const store = this.getObjectStore('workflowItems', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Ledger Entries
  async getLedgerEntries(): Promise<LedgerEntry[]> {
    const store = this.getObjectStore('ledgerEntries');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveLedgerEntry(entry: LedgerEntry): Promise<void> {
    const store = this.getObjectStore('ledgerEntries', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLedgerEntry(id: string): Promise<void> {
    const store = this.getObjectStore('ledgerEntries', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const store = this.getObjectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get('appSettings');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : this.getDefaultSettings());
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: Settings): Promise<void> {
    const store = this.getObjectStore('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key: 'appSettings', value: settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private getDefaultSettings(): Settings {
    return {
      theme: 'system',
      language: 'tr',
      currency: '₺',
      dateFormat: 'DD/MM/YYYY',
      notifications: true,
      autoSave: true,
    };
  }

  // Scans (OCR Taramaları)
  async saveOCRScan(scan: {
    id: string;
    timestamp: number;
    type: 'table' | 'receipt' | 'text';
    data: any;
    imageData?: string;
  }): Promise<void> {
    const store = this.getObjectStore('scans', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(scan);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOCRScans(limit = 30): Promise<any[]> {
    const store = this.getObjectStore('scans');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const scans = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(scans);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOCRScan(id: string): Promise<void> {
    const store = this.getObjectStore('scans', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Photos (Fotoğraf Galerisi)
  async savePhoto(photo: {
    id: string;
    projectId?: string;
    timestamp: number;
    imageData: string;
    thumbnail?: string;
    description?: string;
  }): Promise<void> {
    const store = this.getObjectStore('photos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(photo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotos(projectId?: string): Promise<any[]> {
    const store = this.getObjectStore('photos');
    
    if (projectId) {
      const index = store.index('projectId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(projectId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(id: string): Promise<void> {
    const store = this.getObjectStore('photos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Receipts (Fiş/Fatura Fotoğrafları)
  async saveReceipt(receipt: {
    id: string;
    ledgerId?: string;
    date: number;
    type: 'income' | 'expense';
    amount?: number;
    imageData: string;
    thumbnail?: string;
    description?: string;
    merchant?: string;
  }): Promise<void> {
    const store = this.getObjectStore('receipts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(receipt);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getReceipts(ledgerId?: string): Promise<any[]> {
    const store = this.getObjectStore('receipts');
    
    if (ledgerId) {
      const index = store.index('ledgerId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(ledgerId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReceipt(id: string): Promise<void> {
    const store = this.getObjectStore('receipts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Files (Dosya Yönetimi)
  async saveFile(file: {
    id: string;
    projectId?: string;
    name: string;
    type: string;
    size: number;
    category?: string;
    uploadDate: number;
    data: string | ArrayBuffer;
    thumbnail?: string;
    description?: string;
  }): Promise<void> {
    const store = this.getObjectStore('files', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFiles(projectId?: string, category?: string): Promise<any[]> {
    const store = this.getObjectStore('files');
    
    if (projectId) {
      const index = store.index('projectId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(projectId);
        request.onsuccess = () => {
          let files = request.result;
          if (category) {
            files = files.filter(f => f.category === category);
          }
          resolve(files);
        };
        request.onerror = () => reject(request.error);
      });
    }

    if (category) {
      const index = store.index('category');
      return new Promise((resolve, reject) => {
        const request = index.getAll(category);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const store = this.getObjectStore('files', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility: Clear all data
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const storeNames = ['projects', 'workflowItems', 'ledgerEntries', 'scans', 'photos', 'receipts', 'files'];
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    return new Promise((resolve, reject) => {
      storeNames.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Utility: Export all data
  async exportAllData(): Promise<any> {
    const data: any = {};
    
    data.projects = await this.getProjects();
    data.workflowItems = await this.getWorkflowItems();
    data.ledgerEntries = await this.getLedgerEntries();
    data.scans = await this.getOCRScans(1000);
    data.photos = await this.getPhotos();
    data.receipts = await this.getReceipts();
    data.files = await this.getFiles();
    data.settings = await this.getSettings();
    data.exportDate = new Date().toISOString();
    
    return data;
  }
}

export const db = new IndexedDBService();
