import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  FileText,
  CheckSquare,
  Bot,
  Settings,
  Scale,
  X,
  UserRoundCog,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    label: "Team",
    path: "/team",
    icon: UserRoundCog,
  },
  {
    label: "Matters",
    path: "/matters",
    icon: BriefcaseBusiness,
  },
  {
    label: "Documents",
    path: "/documents",
    icon: FileText,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "AI Assistant",
    path: "/ai",
    icon: Bot,
  },
];

const navLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
    fixed inset-y-0 left-0 z-50
    flex w-64 flex-col
    border-r border-slate-200 bg-white
    transition-transform duration-300
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Scale size={21} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                LegalFlow
              </p>
              <p className="text-xs font-medium tracking-widest text-emerald-600">
                AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={navLinkClass}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-5 border-t border-slate-100 p-4">
          <NavLink to="/settings" onClick={onClose} className={navLinkClass}>
            <Settings size={19} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Bot size={17} />
              <span className="text-xs font-semibold">LegalFlow Principle</span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              AI prepares.
            </p>

            <p className="text-sm text-slate-600">Humans decide.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
