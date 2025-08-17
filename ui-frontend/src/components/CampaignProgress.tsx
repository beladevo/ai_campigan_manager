'use client';

import { Campaign, CampaignStep } from '@/types/campaign';
import { CheckCircle, Clock, Loader2, Zap, Image, Sparkles } from 'lucide-react';

interface CampaignProgressProps {
  campaign: Campaign;
}

const stepConfig = {
  queued: {
    label: 'Queued',
    icon: Clock,
    description: 'Campaign queued for processing',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    progressValue: 10
  },
  generating_text: {
    label: 'Generating Text',
    icon: Zap,
    description: 'AI is creating your content',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    progressValue: 40
  },
  generating_image: {
    label: 'Generating Image',
    icon: Image,
    description: 'Creating visual content',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    progressValue: 80
  },
  finalizing: {
    label: 'Finalizing',
    icon: Sparkles,
    description: 'Finishing touches',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    progressValue: 95
  },
  done: {
    label: 'Complete',
    icon: CheckCircle,
    description: 'Campaign ready!',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    progressValue: 100
  }
};

export default function CampaignProgress({ campaign }: CampaignProgressProps) {
  const { status, currentStep, progressPercentage = 0 } = campaign;
  
  // Determine progress based on status and step
  const getProgressPercentage = () => {
    if (status === 'COMPLETED') return 100;
    if (status === 'FAILED') return 0;
    if (currentStep && stepConfig[currentStep]) {
      return Math.max(progressPercentage, stepConfig[currentStep].progressValue);
    }
    return progressPercentage;
  };

  const progress = getProgressPercentage();
  const currentStepConfig = currentStep ? stepConfig[currentStep] : stepConfig.queued;

  if (status === 'FAILED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-700">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-3">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold">Campaign Failed</span>
        </div>
        {campaign.errorMessage && (
          <p className="text-sm text-red-600 mt-2 ml-8">{campaign.errorMessage}</p>
        )}
      </div>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-3" />
            <span className="font-semibold">Campaign Complete! ✨</span>
          </div>
          <div className="text-sm text-green-600">
            {campaign.completedAt && (
              <>Completed {new Date(campaign.completedAt).toLocaleTimeString()}</>
            )}
          </div>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2 mt-3">
          <div className="bg-green-500 h-2 rounded-full w-full transition-all duration-500"></div>
        </div>
      </div>
    );
  }

  const steps: CampaignStep[] = ['queued', 'generating_text', 'generating_image', 'finalizing', 'done'];
  const currentStepIndex = currentStep ? steps.indexOf(currentStep) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Current Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {status === 'PROCESSING' ? (
            <Loader2 className={`w-5 h-5 mr-3 animate-spin ${currentStepConfig.color}`} />
          ) : (
            <currentStepConfig.icon className={`w-5 h-5 mr-3 ${currentStepConfig.color}`} />
          )}
          <div>
            <p className="font-semibold text-gray-900">{currentStepConfig.label}</p>
            <p className="text-sm text-gray-600">{currentStepConfig.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{progress}%</p>
          <p className="text-xs text-gray-500">Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Progress Timeline</h4>
        {steps.map((step, index) => {
          const config = stepConfig[step];
          const isCompleted = index < currentStepIndex || (index === currentStepIndex && campaign.status === 'COMPLETED');
          const isCurrent = index === currentStepIndex && campaign.status !== 'COMPLETED';
          const isUpcoming = index > currentStepIndex;
          
          return (
            <div key={step} className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full mr-3">
                {isCompleted ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
                    {status === 'PROCESSING' ? (
                      <Loader2 className={`w-4 h-4 animate-spin ${config.color}`} />
                    ) : (
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                    )}
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <config.icon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' : 
                  isCurrent ? 'text-gray-900' : 
                  'text-gray-500'
                }`}>
                  {config.label}
                </p>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
              
              {isCompleted && (
                <div className="text-xs text-green-600 font-medium">✓ Done</div>
              )}
              {isCurrent && (
                <div className={`text-xs font-medium ${config.color}`}>In Progress</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Information */}
      {campaign.startedAt && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Started: {new Date(campaign.startedAt).toLocaleTimeString()}</span>
            {status === 'PROCESSING' && (
              <span>
                Duration: {Math.round((Date.now() - new Date(campaign.startedAt).getTime()) / 1000)}s
              </span>
            )}
            {campaign.completedAt && (
              <span>Completed: {new Date(campaign.completedAt).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}