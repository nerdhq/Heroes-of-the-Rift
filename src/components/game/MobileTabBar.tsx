import { Users, Swords, ScrollText } from "lucide-react";

type TabId = 'party' | 'battle' | 'log';

interface MobileTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'party', label: 'Party', icon: Users },
    { id: 'battle', label: 'Battle', icon: Swords },
    { id: 'log', label: 'Log', icon: ScrollText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-stone-900/95 backdrop-blur-sm border-t border-stone-700 flex z-50">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-all ${
              isActive ? 'text-amber-400' : 'text-stone-500 active:text-stone-300'
            }`}
          >
            <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-xs font-medium">{label}</span>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-amber-400 rounded-b" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
