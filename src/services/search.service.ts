/**
 * Global Arama ve Filtreleme Servisi
 * HTML v17'deki arama sisteminin tam implementasyonu
 */

import type { Project, WorkflowItem, LedgerEntry, FileEntry } from '@/types';
import { normalizeTurkish } from '@/utils/formatters';
import { db } from '@/lib/db';

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  status?: string[];
  projectIds?: string[];
  categories?: string[];
  types?: string[];
  priority?: string[];
}

export interface SearchResult<T = any> {
  type: 'project' | 'workflow' | 'ledger' | 'file' | 'scan';
  item: T;
  score: number; // Arama puanı (relevance)
  matchedFields: string[]; // Hangi alanlarda eşleşme bulundu
}

class SearchService {
  // Global arama
  async search(
    filters: SearchFilters,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'relevance' | 'date' | 'amount';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    results: SearchResult[];
    total: number;
    hasMore: boolean;
  }> {
    const { limit = 50, offset = 0, sortBy = 'relevance', sortOrder = 'desc' } = options;
    
    let allResults: SearchResult[] = [];

    // Tüm veri kaynaklarında ara
    if (!filters.types || filters.types.length === 0 || filters.types.includes('project')) {
      const projects = await db.getProjects();
      const projectResults = this.searchProjects(projects, filters);
      allResults.push(...projectResults);
    }

    if (!filters.types || filters.types.length === 0 || filters.types.includes('workflow')) {
      const workflows = await db.getWorkflowItems();
      const workflowResults = this.searchWorkflows(workflows, filters);
      allResults.push(...workflowResults);
    }

    if (!filters.types || filters.types.length === 0 || filters.types.includes('ledger')) {
      const ledgers = await db.getLedgerEntries();
      const ledgerResults = this.searchLedgers(ledgers, filters);
      allResults.push(...ledgerResults);
    }

    if (!filters.types || filters.types.length === 0 || filters.types.includes('file')) {
      const files = await db.getFiles();
      const fileResults = this.searchFiles(files, filters);
      allResults.push(...fileResults);
    }

    if (!filters.types || filters.types.length === 0 || filters.types.includes('scan')) {
      const scans = await db.getOCRScans(1000);
      const scanResults = this.searchScans(scans, filters);
      allResults.push(...scanResults);
    }

    // Sıralama
    allResults = this.sortResults(allResults, sortBy, sortOrder);

    // Pagination
    const total = allResults.length;
    const results = allResults.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { results, total, hasMore };
  }

  // Proje araması
  private searchProjects(projects: Project[], filters: SearchFilters): SearchResult[] {
    return projects
      .filter(project => this.filterProject(project, filters))
      .map(project => ({
        type: 'project' as const,
        item: project,
        score: this.calculateProjectScore(project, filters),
        matchedFields: this.getMatchedFieldsProject(project, filters),
      }))
      .filter(result => result.score > 0);
  }

  // İş akışı araması
  private searchWorkflows(workflows: WorkflowItem[], filters: SearchFilters): SearchResult[] {
    return workflows
      .filter(workflow => this.filterWorkflow(workflow, filters))
      .map(workflow => ({
        type: 'workflow' as const,
        item: workflow,
        score: this.calculateWorkflowScore(workflow, filters),
        matchedFields: this.getMatchedFieldsWorkflow(workflow, filters),
      }))
      .filter(result => result.score > 0);
  }

  // Defter araması
  private searchLedgers(ledgers: LedgerEntry[], filters: SearchFilters): SearchResult[] {
    return ledgers
      .filter(ledger => this.filterLedger(ledger, filters))
      .map(ledger => ({
        type: 'ledger' as const,
        item: ledger,
        score: this.calculateLedgerScore(ledger, filters),
        matchedFields: this.getMatchedFieldsLedger(ledger, filters),
      }))
      .filter(result => result.score > 0);
  }

  // Dosya araması
  private searchFiles(files: FileEntry[], filters: SearchFilters): SearchResult[] {
    return files
      .filter(file => this.filterFile(file, filters))
      .map(file => ({
        type: 'file' as const,
        item: file,
        score: this.calculateFileScore(file, filters),
        matchedFields: this.getMatchedFieldsFile(file, filters),
      }))
      .filter(result => result.score > 0);
  }

  // Tarama araması
  private searchScans(scans: any[], filters: SearchFilters): SearchResult[] {
    return scans
      .filter(scan => this.filterScan(scan, filters))
      .map(scan => ({
        type: 'scan' as const,
        item: scan,
        score: this.calculateScanScore(scan, filters),
        matchedFields: this.getMatchedFieldsScan(scan, filters),
      }))
      .filter(result => result.score > 0);
  }

  // Filtreleme fonksiyonları
  private filterProject(project: Project, filters: SearchFilters): boolean {
    // Durum filtresi
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(project.status)) return false;
    }

    // Proje ID filtresi
    if (filters.projectIds && filters.projectIds.length > 0) {
      if (!filters.projectIds.includes(project.id)) return false;
    }

    // Tarih filtresi
    if (filters.dateFrom && project.startDate < filters.dateFrom) return false;
    if (filters.dateTo && project.startDate > filters.dateTo) return false;

    // Tutar filtresi
    if (filters.amountMin !== undefined && project.totalAmount < filters.amountMin) return false;
    if (filters.amountMax !== undefined && project.totalAmount > filters.amountMax) return false;

    return true;
  }

  private filterWorkflow(workflow: WorkflowItem, filters: SearchFilters): boolean {
    // Durum filtresi
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(workflow.status)) return false;
    }

    // Öncelik filtresi
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(workflow.priority)) return false;
    }

    // Proje ID filtresi
    if (filters.projectIds && filters.projectIds.length > 0) {
      if (!filters.projectIds.includes(workflow.projectId)) return false;
    }

    // Tarih filtresi
    if (filters.dateFrom && workflow.createdAt < filters.dateFrom) return false;
    if (filters.dateTo && workflow.createdAt > filters.dateTo) return false;

    return true;
  }

  private filterLedger(ledger: LedgerEntry, filters: SearchFilters): boolean {
    // Tip filtresi
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(ledger.type)) return false;
    }

    // Kategori filtresi
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(ledger.category)) return false;
    }

    // Proje ID filtresi
    if (filters.projectIds && filters.projectIds.length > 0) {
      if (ledger.projectId && !filters.projectIds.includes(ledger.projectId)) return false;
    }

    // Tarih filtresi
    if (filters.dateFrom && ledger.date < filters.dateFrom) return false;
    if (filters.dateTo && ledger.date > filters.dateTo) return false;

    // Tutar filtresi
    if (filters.amountMin !== undefined && ledger.amount < filters.amountMin) return false;
    if (filters.amountMax !== undefined && ledger.amount > filters.amountMax) return false;

    return true;
  }

  private filterFile(file: FileEntry, filters: SearchFilters): boolean {
    // Proje ID filtresi
    if (filters.projectIds && filters.projectIds.length > 0) {
      if (file.projectId && !filters.projectIds.includes(file.projectId)) return false;
    }

    // Kategori filtresi
    if (filters.categories && filters.categories.length > 0) {
      if (file.category && !filters.categories.includes(file.category)) return false;
    }

    // Tarih filtresi
    const fileDate = new Date(file.uploadDate).toISOString().split('T')[0];
    if (filters.dateFrom && fileDate < filters.dateFrom) return false;
    if (filters.dateTo && fileDate > filters.dateTo) return false;

    return true;
  }

  private filterScan(scan: any, filters: SearchFilters): boolean {
    // Tip filtresi
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(scan.type)) return false;
    }

    // Tarih filtresi
    const scanDate = new Date(scan.timestamp).toISOString().split('T')[0];
    if (filters.dateFrom && scanDate < filters.dateFrom) return false;
    if (filters.dateTo && scanDate > filters.dateTo) return false;

    return true;
  }

  // Puan hesaplama fonksiyonları
  private calculateProjectScore(project: Project, filters: SearchFilters): number {
    if (!filters.query) return 100;

    let score = 0;
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(project.name).includes(query)) score += 100;
    if (normalizeTurkish(project.client).includes(query)) score += 80;
    if (project.description && normalizeTurkish(project.description).includes(query)) score += 40;

    return score;
  }

  private calculateWorkflowScore(workflow: WorkflowItem, filters: SearchFilters): number {
    if (!filters.query) return 100;

    let score = 0;
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(workflow.name).includes(query)) score += 100;
    if (workflow.notes && normalizeTurkish(workflow.notes).includes(query)) score += 60;
    if (workflow.stage && normalizeTurkish(workflow.stage).includes(query)) score += 40;

    return score;
  }

  private calculateLedgerScore(ledger: LedgerEntry, filters: SearchFilters): number {
    if (!filters.query) return 100;

    let score = 0;
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(ledger.description).includes(query)) score += 100;
    if (normalizeTurkish(ledger.category).includes(query)) score += 80;
    if (ledger.merchant && normalizeTurkish(ledger.merchant).includes(query)) score += 70;

    return score;
  }

  private calculateFileScore(file: FileEntry, filters: SearchFilters): number {
    if (!filters.query) return 100;

    let score = 0;
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(file.name).includes(query)) score += 100;
    if (file.description && normalizeTurkish(file.description).includes(query)) score += 60;
    if (file.category && normalizeTurkish(file.category).includes(query)) score += 40;

    return score;
  }

  private calculateScanScore(scan: any, filters: SearchFilters): number {
    if (!filters.query) return 100;

    let score = 0;
    const query = normalizeTurkish(filters.query);

    if (scan.title && normalizeTurkish(scan.title).includes(query)) score += 100;
    if (scan.data?.raw && normalizeTurkish(scan.data.raw).includes(query)) score += 60;

    return score;
  }

  // Eşleşen alanları bul
  private getMatchedFieldsProject(project: Project, filters: SearchFilters): string[] {
    if (!filters.query) return [];
    
    const fields: string[] = [];
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(project.name).includes(query)) fields.push('name');
    if (normalizeTurkish(project.client).includes(query)) fields.push('client');
    if (project.description && normalizeTurkish(project.description).includes(query)) fields.push('description');

    return fields;
  }

  private getMatchedFieldsWorkflow(workflow: WorkflowItem, filters: SearchFilters): string[] {
    if (!filters.query) return [];
    
    const fields: string[] = [];
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(workflow.name).includes(query)) fields.push('name');
    if (workflow.notes && normalizeTurkish(workflow.notes).includes(query)) fields.push('notes');
    if (workflow.stage && normalizeTurkish(workflow.stage).includes(query)) fields.push('stage');

    return fields;
  }

  private getMatchedFieldsLedger(ledger: LedgerEntry, filters: SearchFilters): string[] {
    if (!filters.query) return [];
    
    const fields: string[] = [];
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(ledger.description).includes(query)) fields.push('description');
    if (normalizeTurkish(ledger.category).includes(query)) fields.push('category');
    if (ledger.merchant && normalizeTurkish(ledger.merchant).includes(query)) fields.push('merchant');

    return fields;
  }

  private getMatchedFieldsFile(file: FileEntry, filters: SearchFilters): string[] {
    if (!filters.query) return [];
    
    const fields: string[] = [];
    const query = normalizeTurkish(filters.query);

    if (normalizeTurkish(file.name).includes(query)) fields.push('name');
    if (file.description && normalizeTurkish(file.description).includes(query)) fields.push('description');

    return fields;
  }

  private getMatchedFieldsScan(scan: any, filters: SearchFilters): string[] {
    if (!filters.query) return [];
    
    const fields: string[] = [];
    const query = normalizeTurkish(filters.query);

    if (scan.title && normalizeTurkish(scan.title).includes(query)) fields.push('title');
    if (scan.data?.raw && normalizeTurkish(scan.data.raw).includes(query)) fields.push('content');

    return fields;
  }

  // Sonuçları sırala
  private sortResults(
    results: SearchResult[],
    sortBy: 'relevance' | 'date' | 'amount',
    sortOrder: 'asc' | 'desc'
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'date':
          comparison = this.getResultDate(b) - this.getResultDate(a);
          break;
        case 'amount':
          comparison = this.getResultAmount(b) - this.getResultAmount(a);
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  private getResultDate(result: SearchResult): number {
    const item = result.item;
    
    switch (result.type) {
      case 'project':
        return new Date(item.startDate || item.createdAt).getTime();
      case 'workflow':
        return new Date(item.createdAt).getTime();
      case 'ledger':
        return new Date(item.date).getTime();
      case 'file':
        return item.uploadDate;
      case 'scan':
        return item.timestamp;
      default:
        return 0;
    }
  }

  private getResultAmount(result: SearchResult): number {
    const item = result.item;
    
    switch (result.type) {
      case 'project':
        return item.totalAmount || 0;
      case 'ledger':
        return item.amount || 0;
      default:
        return 0;
    }
  }
}

export const searchService = new SearchService();
