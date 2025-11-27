
import React, { useState } from 'react';
import Button from './Button';
import FileTextIcon from './icons/FileTextIcon';
import CodeIcon from './icons/CodeIcon';
import XIcon from './icons/XIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  markdownContent: string;
  jsonContent: string;
  onDownload: () => void;
}

type Tab = 'markdown' | 'json';

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, loading, markdownContent, jsonContent, onDownload }) => {
  const [activeTab, setActiveTab] = useState<Tab>('markdown');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Generated Files Preview</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-shrink-0 px-4 pt-4">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('markdown')}
                disabled={loading}
                className={`${activeTab === 'markdown' && !loading ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'}
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 disabled:hover:border-transparent disabled:cursor-not-allowed`}
              >
                <FileTextIcon className="mr-2 h-5 w-5"/>
                <span>project-plan.md</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                disabled={loading}
                className={`${activeTab === 'json' && !loading ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'}
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 disabled:hover:border-transparent disabled:cursor-not-allowed`}
              >
                <CodeIcon className="mr-2 h-5 w-5"/>
                <span>project-init.json</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto min-h-[40vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <SpinnerIcon className="w-10 h-10 mb-4 text-sky-500"/>
                <p className="text-lg font-medium">Generating files...</p>
            </div>
          ) : (
            <pre className="text-sm bg-slate-100 dark:bg-slate-900 rounded-md p-4 text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words font-mono">
                <code>
                    {activeTab === 'markdown' ? markdownContent : jsonContent}
                </code>
            </pre>
          )}
        </div>

        <footer className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
          <div className="flex space-x-4">
            <Button onClick={onClose} className="bg-slate-500 hover:bg-slate-600 focus:ring-slate-500 dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-500">Close</Button>
            <Button onClick={onDownload} disabled={loading}>Download Files</Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PreviewModal;
