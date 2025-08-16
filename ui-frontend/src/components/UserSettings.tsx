'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  CreditCard,
  Download,
  Trash2,
  Settings,
  Moon,
  Sun,
  Globe,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    campaignComplete: true,
    weeklyReport: false,
    marketing: false
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'data', name: 'Data & Privacy', icon: Eye }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      current: false,
      features: ['10 campaigns/month', 'Basic templates', 'Standard support']
    },
    {
      name: 'Pro',
      price: '$29',
      current: true,
      features: ['100 campaigns/month', 'All templates', 'Priority support', 'Analytics']
    },
    {
      name: 'Enterprise',
      price: '$99',
      current: false,
      features: ['Unlimited campaigns', 'Custom templates', '24/7 support', 'Advanced analytics', 'API access']
    }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200">
                  <User className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
                <p className="text-gray-600">john.doe@example.com</p>
                <p className="text-sm text-indigo-600 font-medium">Pro Plan Member</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  defaultValue="Acme Marketing"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                defaultValue="Digital marketing specialist with 5+ years of experience in campaign creation and optimization."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Browser Notifications', desc: 'Show desktop notifications' },
                  { key: 'campaignComplete', label: 'Campaign Completion', desc: 'Notify when campaigns finish' },
                  { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Weekly performance summaries' },
                  { key: 'marketing', label: 'Marketing Updates', desc: 'Product updates and promotions' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{label}</h4>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">Two-factor authentication is enabled</p>
                    <p className="text-sm text-green-600">Added extra security to your account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Key className="w-6 h-6 text-gray-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Smartphone className="w-6 h-6 text-gray-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Manage 2FA</h4>
                    <p className="text-sm text-gray-600">Configure two-factor authentication</p>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-gray-900">API Key</label>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value="sk-1234567890abcdef1234567890abcdef"
                    readOnly
                    className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm font-mono"
                  />
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                    Regenerate
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'New York, US', current: true, lastActive: '2 minutes ago' },
                  { device: 'Safari on iPhone', location: 'New York, US', current: false, lastActive: '2 hours ago' },
                  { device: 'Firefox on Mac', location: 'San Francisco, US', current: false, lastActive: '1 day ago' }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{session.device}</p>
                        <p className="text-sm text-gray-600">{session.location} • {session.lastActive}</p>
                      </div>
                      {session.current && (
                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
                      )}
                    </div>
                    {!session.current && (
                      <button className="text-red-600 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'light', name: 'Light', icon: Sun },
                  { id: 'dark', name: 'Dark', icon: Moon },
                  { id: 'system', name: 'System', icon: Settings }
                ].map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      theme === id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-gray-900">{name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>GMT-5 (Eastern Time)</option>
                    <option>GMT-8 (Pacific Time)</option>
                    <option>GMT+1 (Central European Time)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Campaign Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Tone</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Friendly</option>
                    <option>Formal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>Short (50-100 words)</option>
                    <option>Medium (100-200 words)</option>
                    <option>Long (200-500 words)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <div
                    key={plan.name}
                    className={`p-6 border-2 rounded-lg ${
                      plan.current ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}/month</p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.current ? (
                      <div className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-center font-medium">
                        Current Plan
                      </div>
                    ) : (
                      <button className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">Update</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
              <div className="space-y-3">
                {[
                  { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-001' },
                  { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-002' },
                  { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-003' }
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bill.invoice}</p>
                      <p className="text-sm text-gray-600">{bill.date}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900">{bill.amount}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {bill.status}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Download className="w-6 h-6 text-gray-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Export All Data</h4>
                  <p className="text-sm text-gray-600">Download all your account data</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Download className="w-6 h-6 text-gray-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Export Campaigns</h4>
                  <p className="text-sm text-gray-600">Download campaign data only</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Analytics Tracking', desc: 'Help improve our service with usage analytics' },
                  { label: 'Performance Monitoring', desc: 'Monitor app performance and errors' },
                  { label: 'Third-party Integrations', desc: 'Allow data sharing with integrated services' }
                ].map(({ label, desc }, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{label}</h4>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-medium text-red-800">Delete Account</h4>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <TabContent />
          </div>
        </div>
      </div>
    </div>
  );
}