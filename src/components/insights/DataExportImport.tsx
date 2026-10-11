import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { FinanceState } from '@/types';
import { exportToJSON, exportToCSV, importFromJSON } from '@/utils/storage';
import { Button } from '@/components/ui';

interface DataExportImportProps {
  state: FinanceState;
  onImportState: (state: FinanceState) => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({ state, onImportState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleExportJSON = () => {
    exportToJSON(state);
    setStatusMessage('Exported complete ledger as JSON backup.');
    setIsError(false);
  };

  const handleExportCSV = () => {
    exportToCSV(state.expenses);
    setStatusMessage('Exported transactions ledger as CSV spreadsheet.');
    setIsError(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importFromJSON(text);
        if (imported) {
          onImportState(imported);
          setStatusMessage('Successfully restored budget ledger from valid JSON backup!');
          setIsError(false);
        } else {
          setStatusMessage('Invalid file format: Backup failed schema validation.');
          setIsError(true);
        }
      } catch {
        setStatusMessage('Corrupted file: Failed to parse JSON contents.');
        setIsError(true);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Download className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Data Backup & Portability
          </h3>
          <p className="text-xs text-[#8e9c93]">
            Export full history as JSON/CSV or restore from an earlier backup
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-mono ${
            isError
              ? 'bg-red-950/40 border-red-900/60 text-red-300'
              : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
          }`}
        >
          {isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleExportJSON}>
          <FileJson className="w-4 h-4 mr-1 text-purple-400" /> Export JSON Backup
        </Button>

        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-400" /> Export CSV Spreadsheet
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
          id="import-backup-file"
        />

        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1 text-amber-400" /> Restore from JSON
        </Button>
      </div>
    </div>
  );
};

export default DataExportImport;
