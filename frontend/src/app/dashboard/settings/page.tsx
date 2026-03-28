"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultTicker: "AAPL",
    refreshInterval: "30",
    emailNotifications: true,
    sentimentThreshold: "0.5",
  });

  const handleSave = () => {
    alert("Settings saved! (Persistence coming in next release)");
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your pipeline preferences and notifications
        </p>
      </div>

      <Card className="glass-card rounded-2xl p-6 border-border/30">
        <h2 className="text-base font-semibold text-foreground mb-4">Pipeline Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Default Ticker Symbol
            </label>
            <Input
              id="settings-default-ticker"
              value={settings.defaultTicker}
              onChange={(e) => setSettings({ ...settings, defaultTicker: e.target.value })}
              placeholder="AAPL"
              className="bg-input border-border/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Auto-refresh Interval (minutes)
            </label>
            <Input
              id="settings-refresh-interval"
              type="number"
              value={settings.refreshInterval}
              onChange={(e) => setSettings({ ...settings, refreshInterval: e.target.value })}
              placeholder="30"
              className="bg-input border-border/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Sentiment Alert Threshold
            </label>
            <Input
              id="settings-sentiment-threshold"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.sentimentThreshold}
              onChange={(e) => setSettings({ ...settings, sentimentThreshold: e.target.value })}
              placeholder="0.5"
              className="bg-input border-border/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Confidence threshold for sentiment alerts (0.0 - 1.0)
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass-card rounded-2xl p-6 border-border/30">
        <h2 className="text-base font-semibold text-foreground mb-4">Notifications</h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive email alerts for significant sentiment changes
            </p>
          </div>
          <input
            id="settings-email-toggle"
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="h-5 w-5 rounded"
          />
        </div>
      </Card>

      <Card className="glass-card rounded-2xl p-6 border-border/30">
        <h2 className="text-base font-semibold text-foreground mb-4">Account</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-1">Data Export</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Export your pipeline runs and articles data
            </p>
            <Button variant="outline" disabled className="border-border/50">
              Export Data (Coming Soon)
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-1">Account Management</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Manage your account settings and preferences
            </p>
            <Button variant="outline" disabled className="border-border/50">
              Manage Account (Coming Soon)
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          id="settings-save-btn"
          onClick={handleSave}
          className="bg-gradient-to-r from-[oklch(0.70_0.18_250)] to-[oklch(0.60_0.20_280)] hover:opacity-90 text-white border-0 shadow-lg"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}