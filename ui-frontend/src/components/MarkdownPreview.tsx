'use client';

import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Eye, Code } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  showToggle?: boolean;
}

export default function MarkdownPreview({ content, showToggle = false }: MarkdownPreviewProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!showToggle) {
    return <MarkdownRenderer content={content} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Content Preview</h4>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowRaw(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              !showRaw 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Rendered
          </button>
          <button
            onClick={() => setShowRaw(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showRaw 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4 inline mr-1" />
            Markdown
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4">
        {showRaw ? (
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border overflow-x-auto">
            {content}
          </pre>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
    </div>
  );
}