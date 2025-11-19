/**
 * API Key Settings Component
 * Allows users to configure Google Cloud Vision API key
 */

import React, { useState, useEffect } from 'react';
import { getApiKey, saveApiKey, clearApiKey, isValidApiKey } from '../../utils/cloudVisionOCR';

export const ApiKeySettings = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = getApiKey();
    if (existing) {
      // Show masked version
      setApiKey(existing);
    }
  }, []);

  const handleSave = () => {
    setError('');
    setSaved(false);

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!isValidApiKey(apiKey.trim())) {
      setError('Invalid API key format. Google Cloud API keys start with "AIza" and are 39 characters long.');
      return;
    }

    saveApiKey(apiKey.trim());
    setSaved(true);

    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to remove the saved API key?')) {
      clearApiKey();
      setApiKey('');
      setSaved(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Google Cloud Vision API Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to get an API key:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Enable the "Cloud Vision API" for your project</li>
              <li>Go to "APIs & Services" → "Credentials"</li>
              <li>Click "Create Credentials" → "API Key"</li>
              <li>Copy the API key and paste it below</li>
            </ol>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="input w-full font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally in your browser and never sent anywhere except Google Cloud.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">✓ API key saved successfully!</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="btn-success flex-1"
            >
              Save API Key
            </button>
            {getApiKey() && (
              <button
                onClick={handleClear}
                className="btn-danger"
              >
                Clear Key
              </button>
            )}
          </div>

          {/* Cost Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">💰 Pricing Information:</h3>
            <p className="text-sm text-yellow-800">
              Google Cloud Vision API offers <strong>1,000 free requests per month</strong>.
              After that, it costs $1.50 per 1,000 requests.
              Each stat upload uses 1 request.
            </p>
          </div>

          {/* Security Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Security Recommendations:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Restrict your API key to only Cloud Vision API in Google Cloud Console</li>
              <li>Set up billing alerts to avoid unexpected charges</li>
              <li>Consider using API key restrictions (HTTP referrers, IP addresses)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
