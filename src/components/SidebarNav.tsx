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
  AlertOctagon
} from 'lucide-react';
import { ActiveScreen, RiskLevel } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface SidebarNavProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  day: number;
  remaining: number;
  risk: RiskLevel;
}

const navItems: { id: ActiveScreen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
  { id: 'simulator', label: 'Simulator', icon: SlidersHorizontal },
  { id: 'emergency', label: 'Emergency Hub', icon: AlertOctagon },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-dark-border bg-[#0e1210] p-5 shrink-0 min-h-screen">
        <div>
          {/* Logo & Tagline */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-fintech-lime/15 border border-fintech-lime/30 flex items-center justify-center text-fintech-lime shadow-glow-lime">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  Broke But Functional
                </h1>
                <span className="text-[10px] font-mono font-bold text-fintech-lime tracking-wider uppercase block">
                  Survive the Month
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-dark-muted/80 leading-relaxed pl-1">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-fintech-lime text-black font-semibold shadow-glow-lime'
                      : 'text-dark-muted hover:text-white hover:bg-dark-cardHover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-black'
                          : isEmergency
                          ? 'text-fintech-red'
                          : isSimulator
                          ? 'text-fintech-amber'
                          : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isSimulator && !isActive && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-fintech-amber/20 text-fintech-amber border border-fintech-amber/30">
                      LIVE
                    </span>
                  )}
                  {isEmergency && !isActive && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-fintech-red/20 text-fintech-red border border-fintech-red/30">
                      SHOCK
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="pt-6 border-t border-dark-borderSubtle">
          <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-dark-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fintech-lime" />
                Day {day} of 30
              </span>
              <span className="font-mono text-xs text-dark-muted">{daysLeft}d left</span>
            </div>

            <div className="w-full bg-[#1b221e] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-fintech-lime h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (day / 30) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono text-dark-muted">Balance</div>
                <div className="font-bold text-white tabular-nums">{formatINR(remaining)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-dark-muted">Risk</div>
                <span
                  className={`inline-flex items-center gap-1 font-semibold text-xs ${
                    risk === 'High'
                      ? 'text-fintech-red'
                      : risk === 'Medium'
                      ? 'text-fintech-amber'
                      : 'text-fintech-emerald'
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
      <div className="lg:hidden sticky top-0 z-40 bg-[#0e1210]/95 backdrop-blur-md border-b border-dark-border px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fintech-lime/15 border border-fintech-lime/30 flex items-center justify-center text-fintech-lime">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">
                Broke But Functional
              </span>
              <span className="text-[9px] text-fintech-lime font-mono">Survive the Month</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono px-2 py-0.5 rounded bg-dark-card border border-dark-border text-dark-muted">
              D{day}/30
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                risk === 'High'
                  ? 'border-fintech-red/40 bg-fintech-red/10 text-fintech-red'
                  : risk === 'Medium'
                  ? 'border-fintech-amber/40 bg-fintech-amber/10 text-fintech-amber'
                  : 'border-fintech-emerald/40 bg-fintech-emerald/10 text-fintech-emerald'
              }`}
            >
              {risk}
            </span>
          </div>
        </div>

        {/* Scrollable Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveScreen(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-fintech-lime text-black font-semibold shadow-glow-lime'
                    : 'bg-dark-card text-dark-muted hover:text-white border border-dark-borderSubtle'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
