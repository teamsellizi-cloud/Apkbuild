"use client";

import React from "react";
import { Home, Wrench, Clock, Settings } from "lucide-react";

export type NavTab = "home" | "builders" | "history" | "settings";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: "home" as NavTab, label: "Home", icon: Home },
    { id: "builders" as NavTab, label: "Builders", icon: Wrench },
    { id: "history" as NavTab, label: "History", icon: Clock },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-900/5">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
