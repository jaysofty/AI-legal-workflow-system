import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";

function formatRole(role = "") {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "LegalFlow User";

  const userRole = formatRole(user?.role || "USER");

  const initials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
      >
        <Menu size={21} />
      </button>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={19} />

        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
      </button>

      <div className="h-8 w-px bg-slate-200" />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initials || "LF"}
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {userName}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {userRole}
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Sign out"
        title="Sign out"
        className="ml-1 rounded-lg p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}

export default TopBar;