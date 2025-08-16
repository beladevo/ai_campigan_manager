'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-gray-900 mb-2 mt-3">
        {children}
      </h4>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-gray-700 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-700 leading-relaxed">
        {children}
      </li>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-indigo-600 hover:text-indigo-800 underline transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Emphasis
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700">
        {children}
      </em>
    ),
    
    // Code
    code: ({ children, className }) => {
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      
      return (
        <code className="block bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
          {children}
        </code>
      );
    },
    
    // Pre (code blocks)
    pre: ({ children }) => (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 overflow-x-auto">
        {children}
      </div>
    ),
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-200 bg-indigo-50 pl-4 py-2 mb-4 italic text-gray-700">
        {children}
      </blockquote>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="border-gray-300 my-6" />
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-gray-50">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
        {children}
      </td>
    ),
  };

  return (
    <div className={`markdown-content max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}