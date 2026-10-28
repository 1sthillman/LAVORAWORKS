import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  Trash2,
  Upload,
  MessageSquare,
  Edit,
  Edit3,
} from 'lucide-react';
import type { Project, FileEntry, WorkflowComment, WorkflowItem } from '@/types';
import { formatCurrency, formatDateTR, formatFileSize, formatRelativeTime } from '@/utils/formatters';
import { db } from '@/lib/db';
import { TableEditorModal } from './TableEditorModal';
import { WorkflowItemEditModal } from './WorkflowItemEditModal';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit: (project: Project) => void;
}

type TabType = 'overview' | 'files' | 'comments' | 'workflow' | 'tables';

export function ProjectDetailModal({ isOpen, onClose, project, onEdit }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkflowItem | null>(null);

  useEffect(() => {
    if (project) {
      // Load files from IndexedDB
      db.getFiles(project.id).then(setFiles).catch(console.error);
      
      // Load comments
      setComments(project.workflowItems?.[0]?.comments || []);
    }
  }, [project]);

  if (!project) return null;

  const paymentProgress = (project.paidAmount / project.totalAmount) * 100;
  const remainingAmount = project.totalAmount - project.paidAmount;

  const statusConfig = {
    active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    completed: {
      label: 'Tamamlandı',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    paused: { label: 'Durduruldu', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    cancelled: { label: 'İptal', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  };

  const priorityConfig = {
    low: { label: 'Düşük', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: WorkflowComment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user', // TODO: Get from auth
      userName: 'Kullanıcı', // TODO: Get from auth
      comment: newComment,
      timestamp: Date.now(),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        const fileEntry = {
          id: `file-${Date.now()}`,
          projectId: project?.id,
          name: file.name,
          type: file.type,
          size: file.size,
          category: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
          uploadDate: Date.now(),
          data: base64,
        };

        // Save to IndexedDB
        await db.saveFile(fileEntry);
        
        // Update local state
        setFiles((prev) => [...prev, fileEntry]);
        
        console.log('File uploaded:', fileEntry.name);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {project.avatar && (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                      style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                      {project.avatar}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{project.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {project.tableData && project.tableData.length > 0 && (
                    <button
                      onClick={() => setShowTableEditor(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Tabloları Düzenle
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(project)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: FileText },
                  ...(project.tableData && project.tableData.length > 0 
                    ? [{ id: 'tables' as const, label: 'Tablolar', icon: FileText }] 
                    : []
                  ),
                  { id: 'files', label: 'Dosyalar', icon: Paperclip },
                  { id: 'comments', label: 'Yorumlar', icon: MessageSquare },
                  { 
                    id: 'workflow', 
                    label: 'İş Akışı' + (project.workflow?.items.length ? ` (${project.workflow.items.length})` : ''), 
                    icon: CheckCircle2,
                    badge: project.workflow?.items.filter(i => i.pricePending).length || 0
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all relative ${
                      activeTab === tab.id
                        ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Status and Priority */}
                    <div className="flex gap-3">
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                      {project.priority && (
                        <span
                          className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                            priorityConfig[project.priority].color
                          }`}
                        >
                          {priorityConfig[project.priority].label}
                        </span>
                      )}
                      {project.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-2xl">
                        <DollarSign className="w-5 h-5 mb-2 opacity-75" />
                        <div className="text-2xl font-bold">{formatCurrency(project.totalAmount)}</div>
                        <div className="text-xs opacity-75 font-semibold">Toplam Tutar</div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl">
                        <CheckCircle2 className="w-5 h-5 mb-2 opacity-75" />
                        <div className="text-2xl font-bold">{formatCurrency(project.paidAmount)}</div>
                        <div className="text-xs opacity-75 font-semibold">Ödenen</div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-2xl">
                        <AlertCircle className="w-5 h-5 mb-2 opacity-75" />
                        <div className="text-2xl font-bold">{formatCurrency(remainingAmount)}</div>
                        <div className="text-xs opacity-75 font-semibold">Kalan</div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl">
                        <Clock className="w-5 h-5 mb-2 opacity-75" />
                        <div className="text-2xl font-bold">%{project.progress}</div>
                        <div className="text-xs opacity-75 font-semibold">İlerleme</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-gray-700 dark:text-gray-300">Proje İlerlemesi</span>
                          <span className="text-teal-600 dark:text-teal-400">%{project.progress}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-gray-700 dark:text-gray-300">Ödeme Durumu</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            %{Math.round(paymentProgress)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${paymentProgress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                            İletişim Kişisi
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {project.clientContact || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">E-posta</div>
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {project.clientEmail || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Telefon</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {project.clientPhone || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tarihler</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatDateTR(project.startDate)}
                            {project.dueDate && ` - ${formatDateTR(project.dueDate)}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Açıklama</div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {project.description}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tables' && project.tableData && (
                  <div className="space-y-6">
                    {project.tableData.map((table, tableIndex) => (
                      <div key={tableIndex} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{table.name}</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                {table.headers.map((header, i) => (
                                  <th key={i} className="px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-750">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750/50">
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-3 py-2 text-gray-800 dark:text-gray-200">
                                      {typeof cell === 'number' && table.columnInfo?.totalCol === cellIndex
                                        ? formatCurrency(cell)
                                        : String(cell || '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                            {table.columnInfo?.totalCol !== undefined && (
                              <tfoot>
                                <tr className="font-bold bg-teal-50 dark:bg-teal-900/20">
                                  <td colSpan={table.columnInfo.totalCol} className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">
                                    TOPLAM:
                                  </td>
                                  <td className="px-3 py-3 text-teal-700 dark:text-teal-400">
                                    {formatCurrency(
                                      table.rows.reduce((sum, row) => sum + (parseFloat(String(row[table.columnInfo!.totalCol])) || 0), 0)
                                    )}
                                  </td>
                                  {table.headers.slice(table.columnInfo.totalCol + 1).map((_, i) => (
                                    <td key={i}></td>
                                  ))}
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>

                        {table.columnInfo?.hasAutoCalc && (
                          <div className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
                            ℹ️ Bu tabloda otomatik hesaplama aktif: Miktar × Fiyat = Toplam
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-teal-500 dark:hover:border-teal-500 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-gray-600 dark:text-gray-400">Dosya Yükle</span>
                      <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </label>

                    {/* Files List */}
                    {files.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">Henüz dosya yüklenmemiş</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                          >
                            <Paperclip className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 dark:text-white truncate">{file.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)} · {formatRelativeTime(file.uploadDate)}
                              </div>
                            </div>
                            <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Yorum ekle..."
                        rows={3}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-medium resize-none"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold transition-colors self-start"
                      >
                        Gönder
                      </button>
                    </div>

                    {/* Comments List */}
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">Henüz yorum yapılmamış</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-900 dark:text-white">{comment.userName}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatRelativeTime(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'workflow' && (
                  <div className="space-y-4">
                    {/* Workflow Summary */}
                    {project.workflow && project.workflow.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {project.workflow.items.length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Toplam Ürün</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {project.workflow.items.filter(i => i.pricePending).length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fiyat Bekleyen</div>
                        </div>
                        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {project.workflow.items.filter(i => i.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tamamlanan</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            {project.workflow.items.filter(i => i.status === 'pending').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bekleyen</div>
                        </div>
                      </div>
                    )}

                    {/* Workflow Items */}
                    {project.workflow && project.workflow.items.length > 0 ? (
                      <div className="space-y-3">
                        {/* Fiyat bekleyen ürünler önce */}
                        {project.workflow.items
                          .sort((a, b) => {
                            if (a.pricePending && !b.pricePending) return -1;
                            if (!a.pricePending && b.pricePending) return 1;
                            return 0;
                          })
                          .map((item) => (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                item.pricePending
                                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                      {item.name}
                                    </h4>
                                    {item.pricePending && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold whitespace-nowrap">
                                        <AlertCircle className="w-3 h-3" />
                                        Fiyat Bekliyor
                                      </span>
                                    )}
                                  </div>
                                  {item.sheetName && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.sheetName} · Satır {(item.rowIndex || 0) + 1}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                                    item.status === 'completed'
                                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                      : item.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                  }`}>
                                    {item.status === 'completed' ? 'Tamam' : item.status === 'in-progress' ? 'Devam' : 'Bekliyor'}
                                  </span>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {item.quantity && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Adet:</span>
                                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                                  </div>
                                )}
                                {item.dimension && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Ölçü:</span>
                                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{item.dimension}</span>
                                  </div>
                                )}
                                {item.material && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Malzeme:</span>
                                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{item.material}</span>
                                  </div>
                                )}
                                {item.price !== undefined && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Birim Fiyat:</span>
                                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                      {formatCurrency(item.price)}
                                    </span>
                                  </div>
                                )}
                                {item.total !== undefined && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Toplam:</span>
                                    <span className="ml-2 font-bold text-teal-600 dark:text-teal-400">
                                      {formatCurrency(item.total)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Stage Progress */}
                              {project.workflow && project.workflow.stages.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    {project.workflow.stages.map((stage) => {
                                      const status = item.stageStatus?.[stage.id] || 0;
                                      return (
                                        <div key={stage.id} className="flex-1">
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            {stage.name}
                                          </div>
                                          <div className={`h-2 rounded-full ${
                                            status === 2
                                              ? 'bg-teal-500'
                                              : status === 1
                                              ? 'bg-blue-400'
                                              : status === 3
                                              ? 'bg-amber-500'
                                              : 'bg-gray-300 dark:bg-gray-700'
                                          }`} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">İş akışı öğesi bulunmuyor</p>
                        <p className="text-sm mt-2">Excel dosyası içe aktardığınızda ürünler burada görünecek</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Table Editor Modal */}
      <TableEditorModal
        isOpen={showTableEditor}
        onClose={() => setShowTableEditor(false)}
        project={project}
      />

      {/* Workflow Item Edit Modal */}
      <WorkflowItemEditModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        project={project}
      />
    </AnimatePresence>
  );
}
