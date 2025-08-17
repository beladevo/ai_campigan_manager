'use client';

import { useState } from 'react';
import { 
  X, Download, FileText, File, Globe, 
  Image as ImageIcon, Settings, Check, 
  Loader2, AlertCircle
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { exportCampaign, exportMultipleCampaigns, ExportOptions } from '@/utils/exportUtils';

interface ExportModalProps {
  campaigns: Campaign[];
  isVisible: boolean;
  onClose: () => void;
}

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Portable Document Format - best for sharing and printing',
    icon: FileText,
    color: 'red',
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Web page format - viewable in any browser',
    icon: Globe,
    color: 'blue',
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Microsoft Word compatible format',
    icon: File,
    color: 'blue',
  },
  {
    id: 'txt',
    name: 'Plain Text',
    description: 'Simple text format - universal compatibility',
    icon: FileText,
    color: 'gray',
  },
];

const exportTemplates = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout with essential content only',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive format with full metadata and styling',
  },
  {
    id: 'branded',
    name: 'Branded',
    description: 'Professional format with Solara AI branding',
  },
];

export default function ExportModal({ campaigns, isVisible, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'docx' | 'txt'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<'minimal' | 'detailed' | 'branded'>('detailed');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);

    const options: ExportOptions = {
      format: selectedFormat,
      includeImages,
      includeMetadata,
      template: selectedTemplate,
    };

    try {
      if (campaigns.length === 1) {
        await exportCampaign(campaigns[0], options);
        setExportProgress(100);
      } else {
        // For multiple campaigns, show progress
        for (let i = 0; i < campaigns.length; i++) {
          await exportCampaign(campaigns[i], options);
          setExportProgress(((i + 1) / campaigns.length) * 100);
          // Small delay between exports
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Success - close modal after short delay
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportProgress(0);
      }, 1500);

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getFormatColor = (format: string) => {
    const formatConfig = exportFormats.find(f => f.id === format);
    return formatConfig?.color || 'gray';
  };

  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED');
  const hasImages = campaigns.some(c => c.imagePath);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Export Campaigns</h2>
              <p className="text-white/80">
                {campaigns.length === 1 
                  ? `Export campaign ${campaigns[0].id.slice(-8)}`
                  : `Export ${campaigns.length} campaigns`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Campaign Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Export Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Campaigns:</span>
                <span className="ml-2 font-medium text-gray-900">{campaigns.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2 font-medium text-green-600">{completedCampaigns.length}</span>
              </div>
              <div>
                <span className="text-gray-600">With Images:</span>
                <span className="ml-2 font-medium text-blue-600">{campaigns.filter(c => c.imagePath).length}</span>
              </div>
              <div>
                <span className="text-gray-600">With Content:</span>
                <span className="ml-2 font-medium text-purple-600">{campaigns.filter(c => c.generatedText).length}</span>
              </div>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  disabled={isExporting}
                  className={`p-4 border-2 rounded-xl text-left transition-all disabled:opacity-50 ${
                    selectedFormat === format.id
                      ? `border-${format.color}-300 bg-${format.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <format.icon className={`w-5 h-5 mr-2 ${
                      selectedFormat === format.id 
                        ? `text-${format.color}-600` 
                        : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      selectedFormat === format.id 
                        ? `text-${format.color}-900` 
                        : 'text-gray-900'
                    }`}>
                      {format.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {format.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Template Style</h3>
            <div className="space-y-3">
              {exportTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id as any)}
                  disabled={isExporting}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all disabled:opacity-50 ${
                    selectedTemplate === template.id
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium mb-1 ${
                        selectedTemplate === template.id 
                          ? 'text-emerald-900' 
                          : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    {selectedTemplate === template.id && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Options</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  disabled={isExporting || !hasImages}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Include Images</div>
                  <div className="text-xs text-gray-600">
                    {hasImages 
                      ? 'Add generated images to the export' 
                      : 'No images available in selected campaigns'
                    }
                  </div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  disabled={isExporting}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Include Metadata</div>
                  <div className="text-xs text-gray-600">
                    Add creation dates, user info, and campaign details
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Export Failed</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{exportError}</p>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center text-blue-700 mb-2">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Exporting...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {Math.round(exportProgress)}% complete
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {campaigns.length > 1 && (
                <span>Files will be downloaded individually</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || campaigns.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export {campaigns.length > 1 ? `${campaigns.length} Campaigns` : 'Campaign'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}