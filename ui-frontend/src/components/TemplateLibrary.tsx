'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Clock, Users, Star, BookOpen, 
  ChevronRight, Copy, Eye, Sparkles, Tag,
  Grid, List, SlidersHorizontal, X
} from 'lucide-react';
import { 
  campaignTemplates, 
  getTemplatesByCategory, 
  getAllCategories, 
  searchTemplates,
  CampaignTemplate 
} from '@/data/campaignTemplates';

interface TemplateLibraryProps {
  onSelectTemplate: (template: CampaignTemplate) => void;
  onClose: () => void;
  isModal?: boolean;
}

export default function TemplateLibrary({ onSelectTemplate, onClose, isModal = true }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredTemplates, setFilteredTemplates] = useState<CampaignTemplate[]>(campaignTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);

  const categories = ['All', ...getAllCategories()];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    let templates = campaignTemplates;

    // Apply search filter
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      templates = templates.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(templates);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleUseTemplate = (template: CampaignTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const containerClasses = isModal 
    ? "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    : "w-full h-full";
    
  const contentClasses = isModal
    ? "bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
    : "bg-white rounded-3xl shadow-xl w-full h-full overflow-hidden border border-gray-100";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Template Library</h2>
              <p className="text-white/80">Choose from {campaignTemplates.length} professional templates to jumpstart your campaigns</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Filters */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Templates</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category
                          ? 'bg-violet-100 text-violet-700 border border-violet-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                      {category !== 'All' && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {getTemplatesByCategory(category).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
                <div className="space-y-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all capitalize ${
                        selectedDifficulty === difficulty
                          ? 'bg-violet-100 text-violet-700 border border-violet-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Templates</span>
                    <span className="font-medium text-gray-900">{campaignTemplates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium text-gray-900">{getAllCategories().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filtered Results</span>
                    <span className="font-medium text-violet-600">{filteredTemplates.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredTemplates.length} templates
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  {selectedDifficulty !== 'All' && ` (${selectedDifficulty})`}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white text-violet-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'list' 
                          ? 'bg-white text-violet-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Grid/List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-2xl border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{template.icon}</div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                                {template.name}
                              </h3>
                              <p className="text-sm text-gray-500">{template.category}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {template.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{template.targetAudience.split(',')[0]}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template);
                            }}
                            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 text-sm font-medium"
                          >
                            Use Template
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                            }}
                            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:shadow-md transition-all p-6 cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              <span className="text-sm text-gray-500">{template.category}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                                {template.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                            <div className="flex items-center space-x-6 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{template.estimatedTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{template.targetAudience}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template);
                            }}
                            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 text-sm font-medium"
                          >
                            Use Template
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                            }}
                            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{selectedTemplate.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                      <p className="text-white/80 text-sm">{selectedTemplate.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Difficulty</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                        {selectedTemplate.difficulty}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Estimated Time</h4>
                      <p className="text-gray-600">{selectedTemplate.estimatedTime}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Target Audience</h4>
                    <p className="text-gray-600">{selectedTemplate.targetAudience}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Template Prompt Preview</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {selectedTemplate.prompt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 font-medium"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}