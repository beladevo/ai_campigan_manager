'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Mail, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';

interface NotificationSettingsProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

interface NotificationChannel {
  channel: 'EMAIL' | 'WEBSITE' | 'BROWSER';
  title: string;
  description: string;
  icon: string;
}

interface NotificationType {
  type: string;
  title: string;
  description: string;
  category: string;
}

interface NotificationPreference {
  type: string;
  channels: {
    EMAIL: boolean;
    WEBSITE: boolean;
    BROWSER: boolean;
  };
}

interface NotificationSettings {
  types: NotificationType[];
  channels: NotificationChannel[];
}

interface UserPreferences {
  preferences: NotificationPreference[];
}

const CHANNEL_ICONS = {
  mail: Mail,
  globe: Globe,
  bell: Bell,
};

export default function NotificationSettings({ isVisible, onClose, userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadNotificationData();
    }
  }, [isVisible]);

  const loadNotificationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load notification settings and user preferences in parallel
      const [settingsResponse, preferencesResponse] = await Promise.all([
        fetch('http://localhost:3000/notifications/preferences/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:3000/notifications/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (!settingsResponse.ok || !preferencesResponse.ok) {
        throw new Error('Failed to load notification settings');
      }

      const settingsData = await settingsResponse.json();
      const preferencesData = await preferencesResponse.json();

      setSettings(settingsData);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading notification data:', error);
      setError('Failed to load notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (type: string, channel: 'EMAIL' | 'WEBSITE' | 'BROWSER', enabled: boolean) => {
    if (!preferences) return;

    const updatedPreferences = preferences.preferences.map(pref => {
      if (pref.type === type) {
        return {
          ...pref,
          channels: {
            ...pref.channels,
            [channel]: enabled,
          },
        };
      }
      return pref;
    });

    setPreferences({
      preferences: updatedPreferences,
    });
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:3000/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccessMessage('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async (type: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3000/notifications/test/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccessMessage(`Test ${type.replace('_', ' ')} notification sent!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Group notification types by category
  const groupedTypes = settings?.types.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, NotificationType[]>) || {};

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" 
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-white/20">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 px-6 pt-6 pb-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                <p className="text-white/80">Customize how and when you receive notifications</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700">{successMessage}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading notification settings...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Channel Headers */}
                <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-200">
                  <div className="font-semibold text-gray-700">Notification Type</div>
                  {settings?.channels.map(channel => {
                    const IconComponent = CHANNEL_ICONS[channel.icon as keyof typeof CHANNEL_ICONS] || Bell;
                    return (
                      <div key={channel.channel} className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <IconComponent className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-700">{channel.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Notification Categories */}
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                      {category}
                    </h3>
                    
                    {types.map(type => {
                      const preference = preferences?.preferences.find(p => p.type === type.type);
                      
                      return (
                        <div key={type.type} className="grid grid-cols-4 gap-4 py-4 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{type.title}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                            <button
                              onClick={() => sendTestNotification(type.type)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Send test
                            </button>
                          </div>
                          
                          {settings?.channels.map(channel => (
                            <div key={channel.channel} className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={preference?.channels[channel.channel as keyof typeof preference.channels] || false}
                                  onChange={(e) => updatePreference(type.type, channel.channel as 'EMAIL' | 'WEBSITE' | 'BROWSER', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={saving || loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}