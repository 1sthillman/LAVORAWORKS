import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { excelService } from '@/services/excelService';
import { db } from '@/lib/db';
import { downloadFile } from '@/lib/utils';

export const FilesView: React.FC = () => {
  const { projects } = useProjectStore();
  const { addToast } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportProjects = async () => {
    setIsExporting(true);
    try {
      const blob = await excelService.exportProjects(projects);
      downloadFile(blob, `lavora-projeler-${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast({
        type: 'success',
        message: 'Projeler Excel dosyasına aktarıldı!',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Dışa aktarma hatası',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLedger = async () => {
    setIsExporting(true);
    try {
      const entries = await db.getLedgerEntries();
      const blob = await excelService.exportLedger(entries);
      downloadFile(blob, `lavora-defter-${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast({
        type: 'success',
        message: 'Defter Excel dosyasına aktarıldı!',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Dışa aktarma hatası',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await excelService.importFromExcel(file);
      console.log('Imported data:', data);
      addToast({
        type: 'success',
        message: `${data.length} kayıt içe aktarıldı!`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'İçe aktarma hatası',
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
        Dosya İşlemleri
      </h2>

      {/* Export Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          Dışa Aktar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-gray-100">Projeler</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {projects.length} proje
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleExportProjects}
              isLoading={isExporting}
            >
              <Download className="w-5 h-5 mr-2" />
              Excel'e Aktar
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-gray-100">Masraf Defteri</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  Gelir/Gider kayıtları
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleExportLedger}
              isLoading={isExporting}
            >
              <Download className="w-5 h-5 mr-2" />
              Excel'e Aktar
            </Button>
          </Card>
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          İçe Aktar
        </h3>
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Excel Dosyası Yükle
            </h4>
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-6">
              .xlsx veya .xls formatında dosya seçin
            </p>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              onChange={handleImportFile}
              className="hidden"
              disabled={isImporting}
            />
            <Button
              variant="secondary"
              onClick={() => document.getElementById('excel-upload')?.click()}
              isLoading={isImporting}
            >
              <Upload className="w-5 h-5 mr-2" />
              Dosya Seç
            </Button>
          </div>
        </Card>
      </div>

      {/* Photo Capture Note */}
      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/10 dark:to-primary-800/10 border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                Fotoğraftan Tablo (Yakında)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                Fotoğraf çekerek otomatik tablo oluşturma özelliği yakında eklenecek.
                OCR teknolojisi ile tablolarınızı hızlıca dijitalleştirin.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
