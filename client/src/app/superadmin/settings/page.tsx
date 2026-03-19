'use client';

import { Settings, Shield, Database, Bell } from 'lucide-react';

export default function SuperAdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">General Settings</h3>
              <p className="text-xs text-slate-500">System configuration</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">
            Configure
          </button>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-xs text-slate-500">Authentication & permissions</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">
            Manage
          </button>
        </div>

        {/* Database Settings */}
        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Database</h3>
              <p className="text-xs text-slate-500">Backup & maintenance</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">
            Manage
          </button>
        </div>

        {/* Notifications */}
        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-xs text-slate-500">Alert preferences</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">
            Configure
          </button>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-slate-500">System Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-slate-500">Last Updated</span>
            <span className="font-medium">March 18, 2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Deployment Status</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
