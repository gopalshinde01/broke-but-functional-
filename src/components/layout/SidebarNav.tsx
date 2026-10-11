import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  SlidersHorizontal,
  PiggyBank,
  Repeat,
  Lightbulb,
  IndianRupee,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  LineChart,
  Activity,
} from 'lucide-react';
import type { ActiveScreen, RiskLevel } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface SidebarNavProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  day: number;
  remaining: number;
  risk: RiskLevel;
}

const navItems: {
  id: ActiveScreen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
  { id: 'simulator', label: 'Decision Simulator', icon: SlidersHorizontal },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { id: 'emergency', label: 'Emergency Hub', icon: AlertOctagon },
  { id: 'forecast', label: 'Financial Forecast', icon: LineChart },
  { id: 'health', label: 'Financial Health', icon: Activity },
  { id: 'insights', label: 'Insights & Settings', icon: Lightbulb },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeScreen,
  setActiveScreen,
  day,
  remaining,
  risk,
}) => {
  const daysLeft = Math.max(1, 30 - day);

  return (
    <>
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-black focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-64 flex-col justify-between border-r border-[#232b26] bg-[#0e1210] p-5 shrink-0 min-h-screen"
        aria-label="Sidebar Navigation"
      >
        <div>
          {/* Logo & Tagline */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  Broke But Functional
                </h1>
                <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase block">
                  Survive the Month
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-[#8e9c93] leading-relaxed pl-1">
              30 days. ₹10,000. Make every rupee count.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              const isSimulator = item.id === 'simulator';
              const isEmergency = item.id === 'emergency';

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveScreen(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isActive
                      ? 'bg-emerald-400 text-black font-semibold shadow-sm'
                      : 'text-[#8e9c93] hover:text-white hover:bg-[#181f1b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-black'
                          : isEmergency
                            ? 'text-red-400'
                            : isSimulator
                              ? 'text-amber-400'
                              : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isSimulator && !isActive && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                      LIVE
                    </span>
                  )}
                  {isEmergency && !isActive && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/60">
                      SHOCK
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="pt-6 border-t border-[#1e2521]">
          <div className="p-3.5 rounded-xl bg-[#131715] border border-[#232b26] flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8e9c93] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Day {day} of 30
              </span>
              <span className="font-mono text-xs text-[#8e9c93]">{daysLeft}d left</span>
            </div>

            <div className="w-full bg-[#1b221e] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (day / 30) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono text-[#8e9c93]">Balance</div>
                <div className="font-bold text-white tabular-nums">{formatINR(remaining)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-[#8e9c93]">Risk</div>
                <span
                  className={`inline-flex items-center gap-1 font-semibold text-xs ${
                    risk === 'High'
                      ? 'text-red-400'
                      : risk === 'Medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`}
                >
                  {risk === 'High' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {risk}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Scrollable Navigation */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0e1210]/95 backdrop-blur-md border-b border-[#232b26] px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">
                Broke But Functional
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">Survive the Month</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono px-2 py-0.5 rounded bg-[#131715] border border-[#232b26] text-[#8e9c93]">
              D{day}/30
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                risk === 'High'
                  ? 'border-red-900/60 bg-red-950/40 text-red-300'
                  : risk === 'Medium'
                    ? 'border-amber-900/60 bg-amber-950/40 text-amber-300'
                    : 'border-emerald-900/60 bg-emerald-950/40 text-emerald-300'
              }`}
            >
              {risk}
            </span>
          </div>
        </div>

        {/* Scrollable Horizontal Tabs */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveScreen(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isActive
                    ? 'bg-emerald-400 text-black font-semibold shadow-sm'
                    : 'bg-[#131715] text-[#8e9c93] hover:text-white border border-[#232b26]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
};

export default SidebarNav;
