import * as React from "react";
import {
  BarChart3,
  CalendarCheck2,
  Circle,
  ClipboardList,
  GraduationCap,
  History,
  LogOut,
  Package,
  Settings2,
  UserRound,
  UserCog,
  WalletCards,
} from "lucide-react";
import RoleBadge from "./RoleBadge";

const iconMap = {
  dashboard: BarChart3,
  attendance: CalendarCheck2,
  "attendance-history": History,
  fees: WalletCards,
  equipment: Package,
  students: GraduationCap,
  reports: ClipboardList,
  users: UserCog,
  settings: Settings2,
  overview: UserRound,
};

export default function AppShell({
  currentUser,
  activeView,
  navigation,
  onNavigate,
  onLogout,
  children,
}) {
  const shellUser = currentUser || { name: "Academy user", role: "student" };
  const shellTitle = shellUser.role === "student" ? "Student Portal" : "Management";

  return (
    <div className="min-h-screen bg-academy-black text-white">
      <header className="border-b border-white/5 bg-black/60 px-4 py-4 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-title">Archery Academy</p>
            <div className="mt-2">
              <RoleBadge role={shellUser.role} />
            </div>
          </div>
          <button
            type="button"
            className="ghost-button px-3"
            aria-label="Sign out"
            title="Sign out"
            onClick={onLogout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid min-h-screen max-w-[1440px] md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/5 bg-black/45 p-5 md:flex md:flex-col">
          <div>
            <p className="section-title">Archery Academy</p>
            <h1 className="mt-3 text-xl font-semibold text-white">{shellTitle}</h1>
            <p className="mt-2 text-sm text-neutral-400">{shellUser.name}</p>
            <div className="mt-3">
              <RoleBadge role={shellUser.role} />
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = iconMap[item.id] || Circle;
              const isActive = item.id === activeView;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                    isActive
                      ? "bg-academy-gold text-black"
                      : "text-neutral-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button type="button" className="ghost-button mt-auto justify-start" onClick={onLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </aside>

        <main className="min-w-0 px-4 pb-28 pt-5 sm:px-6 md:px-8 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-lg gap-1"
          style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
        >
          {navigation.map((item) => {
            const Icon = iconMap[item.id] || Circle;
            const isActive = item.id === activeView;

            return (
              <button
                key={item.id}
                type="button"
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] leading-tight transition ${
                  isActive
                    ? "bg-academy-gold text-black"
                    : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
