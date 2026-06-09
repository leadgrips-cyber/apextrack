import React from "react";

interface SystemSettingsViewProps {
  title?: string;
  description?: string;
}

export function SystemSettingsView({
  title = "Settings",
  description = "System configuration and access controls placeholder.",
}: SystemSettingsViewProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">System</div>
      <h2 className="mt-2 text-2xl font-black theme-text-main">{title}</h2>
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <p className="theme-text-muted">{description}</p>
      </div>
    </div>
  );
}
