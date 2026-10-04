import { useMemo, useState } from "react";
import { Search, Users, Mail, ShieldCheck, UserRound } from "lucide-react";
import {
  formatRole,
  getTeamMemberName,
  getTeamMemberInitials,
  formatTeamStatus,
  getTeamStatusClass,
  getTeamItems,
} from "../../utils/team.utils.js";

import { useUsers } from "../../hooks/useUsers.js";

function Team() {
  const { data: usersResponse, isLoading, isError, refetch } = useUsers();

  const users = getTeamItems(usersResponse);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const roles = useMemo(
    () => [...new Set(users.map((user) => user.role).filter(Boolean))],
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View members of your firm and their workspace roles.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Users size={18} className="text-slate-500" />

          <span className="text-sm font-medium text-slate-700">
            {users.length} {users.length === 1 ? "Member" : "Members"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Members</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {users.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Active Members</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {users.filter((user) => user.status === "ACTIVE").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Other Accounts</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {users.filter((user) => user.status !== "ACTIVE").length}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full min-w-0 rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:w-52"
        >
          <option value="ALL">All Roles</option>

          {roles.map((role) => (
            <option key={role} value={role}>
              {formatRole(role)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INVITED">Invited</option>
        </select>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading team members...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">
            We couldn't load your team members.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredUsers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Users size={30} className="mx-auto text-slate-400" />

          <h2 className="mt-4 font-semibold text-slate-900">
            {search || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "No matching team members"
              : "No team members yet"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {getTeamMemberInitials(user.firstName, user.lastName)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">
                      {getTeamMemberName(user)}
                    </h2>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {formatRole(user.role)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getTeamStatusClass(user.status)}`}
                >
                  {formatTeamStatus(user.status)}
                </span>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} className="shrink-0 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {user.role === "FIRM_ADMIN" || user.role === "SUPER_ADMIN" ? (
                    <ShieldCheck
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                  ) : (
                    <UserRound size={16} className="shrink-0 text-slate-400" />
                  )}

                  <span>{formatRole(user.role)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Team;
