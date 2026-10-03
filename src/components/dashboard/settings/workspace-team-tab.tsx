"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Check,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { useWorkspaceRole } from "@/lib/workspace-role-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "invited";
  joinedAt: string;
  avatarUrl?: string;
  workspaceId: string;
}

interface WorkspaceTeamTabProps {
  brandName: string;
  websiteUrl?: string;
  userPlan: string;
}

export function WorkspaceTeamTab({
  brandName,
  userPlan,
}: WorkspaceTeamTabProps) {
  const { t } = useTranslation();
  const { permissions, role: currentRole } = useWorkspaceRole();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [openMemberDropdownId, setOpenMemberDropdownId] = useState<string | null>(null);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  const workspaceId = brandName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "default";

  const maxSeats = ["ENTERPRISE", "AGENCY", "PRO"].includes(userPlan)
    ? 15
    : ["GROWTH", "STARTER"].includes(userPlan)
    ? 5
    : 3;

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvitations = members.filter((m) => m.status === "invited");
  const isAtLimit = members.length >= maxSeats;

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMemberDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch team members
  const loadTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/team?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError(t("settings.enterValidEmail") || "Please enter a valid email address.");
      return;
    }

    setIsInviting(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await fetch("/api/workspaces/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          workspaceId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("settings.inviteFailedMsg") || "Failed to invite teammate.");
      }

      setInviteSuccess(
        (t("settings.inviteSuccessMsg") || "Invitation sent to {email}!").replace("{email}", inviteEmail.trim())
      );
      setInviteEmail("");
      loadTeam();
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : (t("settings.inviteFailedMsg") || "Failed to invite teammate."));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "admin" | "editor" | "viewer") => {
    setUpdatingMemberId(memberId);
    setOpenMemberDropdownId(null);
    try {
      const res = await fetch("/api/workspaces/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          role: newRole,
          workspaceId,
        }),
      });
      if (res.ok) {
        loadTeam();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/team?memberId=${memberToRemove.id}&workspaceId=${workspaceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadTeam();
        setMemberToRemove(null);
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmCancelInvite = async () => {
    if (!inviteToCancel) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/team?memberId=${inviteToCancel.id}&workspaceId=${workspaceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadTeam();
        setInviteToCancel(null);
      }
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const roleOptions: {
    id: "admin" | "editor" | "viewer";
    title: string;
    description: string;
    icon: typeof ShieldCheck;
    color: string;
    bgColor: string;
    borderColor: string;
  }[] = [
    {
      id: "admin",
      title: t("settings.roleAdmin") || "Brand Lead (Admin)",
      description: "Full control over workspace, audits & team members",
      icon: ShieldCheck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "editor",
      title: t("settings.roleEditor") || "GEO Analyst (Editor)",
      description: "Run audits, manage queries & track prompt rankings",
      icon: Sparkles,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      id: "viewer",
      title: t("settings.roleViewer") || "Viewer (Read Only)",
      description: "View radar charts, scores & export citation reports",
      icon: Eye,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
  ];

  const currentRoleConfig = roleOptions.find((r) => r.id === inviteRole) || roleOptions[1];

  const getRoleLabel = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner":
        return t("settings.roleOwner") || "Workspace Owner";
      case "admin":
        return t("settings.roleAdmin") || "Brand Lead (Admin)";
      case "editor":
        return t("settings.roleEditor") || "GEO Analyst (Editor)";
      case "viewer":
        return t("settings.roleViewer") || "Viewer (Read Only)";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Top Workspace & Seats Header Card ─────────────────────────── */}
      <div className="syn-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[var(--syn-border)] rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--syn-muted)]">
              {t("settings.workspaceTeamTag") || "Workspace Team"}
            </span>
            <span className="syn-badge syn-badge-emerald py-0.5 px-2 text-[10px] font-mono">
              {brandName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)]">
            {t("settings.teamTabTitle") || "Members & Collaborators"}
          </h2>
          <p className="text-xs text-[var(--syn-muted)]">
            {t("settings.teamTabDesc") || "Manage teammates with access to this brand workspace, audit runs, and telemetry."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[var(--syn-muted)]">
                {t("settings.teamSeatsQuota") || "Team Seats Quota"}
              </p>
              <p className="text-sm font-extrabold text-[var(--syn-heading)]">
                {members.length} / {maxSeats} <span className="text-xs font-normal text-[var(--syn-muted)]">({userPlan})</span>
              </p>
            </div>
          </div>

          {userPlan === "FREE" && (
            <Link
              href="/dashboard/settings?tab=billing"
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("settings.unlockSeatsBtn") || "Unlock Seats"}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Invite Teammate Card ─────────────────────────────────────── */}
      <div className="syn-card p-6 flex flex-col gap-5 border border-[var(--syn-border)]">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--syn-border)]">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-[var(--syn-heading)]">
            {t("settings.inviteCollaboratorTitle") || "Invite New Collaborator"}
          </h3>
        </div>

        {!permissions.canManageTeam ? (
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
            <div className="flex-1">
              <p className="font-semibold text-xs text-[var(--syn-heading)]">
                {t("settings.teamReadOnlyTitle") || "View-Only Team Mode"}
              </p>
              <p className="text-[11px] text-[var(--syn-muted)] mt-0.5">
                {t("settings.teamReadOnlyDesc") || "Inviting collaborators and modifying roles is restricted to Brand Leads (Admins & Owners)."}
              </p>
            </div>
          </div>
        ) : isAtLimit ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                {(t("settings.seatLimitReachedTitle") || "Team Seat Limit Reached ({count}/{max})")
                  .replace("{count}", String(members.length))
                  .replace("{max}", String(maxSeats))}
              </p>
              <p className="text-[11px] mt-0.5">
                {(t("settings.seatLimitReachedDesc") || "Your current {plan} plan allows {max} team seat. Upgrade your plan to invite more team members.")
                  .replace("{plan}", userPlan)
                  .replace("{max}", String(maxSeats))}
              </p>
              <Link
                href="/dashboard/settings?tab=billing"
                className="inline-flex items-center gap-1 font-bold text-amber-500 hover:underline mt-2"
              >
                <span>{t("settings.upgradePlanLink") || "Upgrade to Growth or Enterprise"}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            {/* Email Address Input */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-[var(--syn-heading)] mb-1.5">
                {t("settings.teammateEmailLabel") || "Teammate Email Address"} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--syn-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder={t("settings.teammateEmailPlaceholder") || "colleague@company.com"}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500 transition-all placeholder:text-[var(--syn-muted)]"
                />
              </div>
            </div>

            {/* Custom Role & Permissions Dropdown */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-[var(--syn-heading)] mb-1.5">
                {t("settings.rolePermissionsLabel") || "Role & Permissions"}
              </label>
              
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  aria-expanded={isRoleDropdownOpen}
                  className={`w-full h-10 px-3 rounded-xl bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card)] border text-xs font-semibold text-[var(--syn-heading)] flex items-center justify-between transition-all cursor-pointer select-none ${
                    isRoleDropdownOpen
                      ? "border-emerald-500/60 ring-2 ring-emerald-500/20 bg-[var(--syn-card)]"
                      : "border-[var(--syn-border)]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-5 h-5 rounded-md ${currentRoleConfig.bgColor} ${currentRoleConfig.color} flex items-center justify-center shrink-0`}>
                      <currentRoleConfig.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{currentRoleConfig.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 ml-2 shrink-0 ${
                      isRoleDropdownOpen ? "rotate-180 text-emerald-500" : ""
                    }`}
                  />
                </button>

                {/* Popover Menu */}
                {isRoleDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] sm:min-w-[320px] rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl backdrop-blur-2xl z-50 p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-[var(--syn-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--syn-muted)]">
                      Select Role & Permissions
                    </div>
                    {roleOptions.map((opt) => {
                      const isSelected = inviteRole === opt.id;
                      const Icon = opt.icon;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setInviteRole(opt.id);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/10 text-[var(--syn-heading)] border border-emerald-500/30"
                              : "hover:bg-[var(--syn-card-inner)] text-[var(--syn-heading)] border border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            <div className={`w-7 h-7 rounded-lg ${opt.bgColor} ${opt.color} flex items-center justify-center shrink-0 mt-0.5 border ${opt.borderColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold block truncate">
                                {opt.title}
                              </span>
                              <span className="text-[10px] text-[var(--syn-muted)] leading-tight block mt-0.5">
                                {opt.description}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {isInviting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t("settings.sendInviteBtn") || "Send Invite"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {inviteError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{inviteError}</span>
          </div>
        )}

        {inviteSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{inviteSuccess}</span>
          </div>
        )}
      </div>

      {/* ── Active Members List ──────────────────────────────────────── */}
      <div className="syn-card p-6 flex flex-col gap-4 border border-[var(--syn-border)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("settings.activeMembersTitle") || "Active Members"}
            </h3>
            <span className="text-xs font-mono text-[var(--syn-muted)]">
              ({activeMembers.length})
            </span>
          </div>

          <button
            type="button"
            onClick={loadTeam}
            className="text-xs text-[var(--syn-muted)] hover:text-[var(--syn-heading)] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{t("settings.refreshBtn") || "Refresh"}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {activeMembers.map((m) => {
            const initial = (m.name || m.email).trim().charAt(0).toUpperCase();
            const memberRoleConfig = roleOptions.find((r) => r.id === m.role) || roleOptions[1];
            const isMemberDropdownOpen = openMemberDropdownId === m.id;

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-xs font-bold border border-black/10 dark:border-white/10 shadow-xs">
                      {m.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--syn-card-inner)]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--syn-heading)] truncate">
                        {m.name}
                      </span>
                      {m.role === "owner" && (
                        <span className="syn-badge syn-badge-amber text-[9px] py-0.2 px-1.5 font-mono">
                          {t("settings.roleOwnerBadge") || "Owner"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--syn-muted)] truncate">
                      {m.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {m.role === "owner" ? (
                    <span className="text-xs font-medium text-[var(--syn-muted)] px-3 py-1.5">
                      {t("settings.roleOwner") || "Workspace Owner"}
                    </span>
                  ) : !permissions.canManageTeam ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs font-medium text-[var(--syn-heading)]">
                      <memberRoleConfig.icon className={`w-3.5 h-3.5 ${memberRoleConfig.color}`} />
                      <span>{memberRoleConfig.title}</span>
                    </span>
                  ) : (
                    <div className="relative" ref={memberDropdownRef}>
                      <button
                        type="button"
                        disabled={updatingMemberId === m.id}
                        onClick={() => setOpenMemberDropdownId(isMemberDropdownOpen ? null : m.id)}
                        className={`h-8 px-2.5 rounded-lg bg-[var(--syn-card)] hover:bg-[var(--syn-card-subtle)] border text-xs font-medium text-[var(--syn-heading)] flex items-center gap-1.5 transition-all cursor-pointer ${
                          isMemberDropdownOpen
                            ? "border-emerald-500/60 ring-1 ring-emerald-500/20"
                            : "border-[var(--syn-border)]"
                        }`}
                      >
                        {updatingMemberId === m.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                        ) : (
                          <memberRoleConfig.icon className={`w-3 h-3 ${memberRoleConfig.color}`} />
                        )}
                        <span>{memberRoleConfig.title}</span>
                        <ChevronDown className={`w-3 h-3 text-[var(--syn-muted)] transition-transform duration-150 ${isMemberDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isMemberDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl backdrop-blur-2xl z-50 p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
                          {roleOptions.map((opt) => {
                            const isSelected = m.role === opt.id;
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleRoleChange(m.id, opt.id)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                                    : "hover:bg-[var(--syn-card-inner)] text-[var(--syn-heading)]"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Icon className={`w-3.5 h-3.5 ${opt.color} shrink-0`} />
                                  <span className="truncate">{opt.title}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {m.role !== "owner" && permissions.canManageTeam && (
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(m)}
                      title="Remove member"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pending Invitations ─────────────────────────────────────── */}
      {pendingInvitations.length > 0 && (
        <div className="syn-card p-6 flex flex-col gap-4 border border-[var(--syn-border)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
            <h3 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("settings.pendingInvitationsTitle") || "Pending Invitations"}
            </h3>
            <span className="text-xs font-mono text-[var(--syn-muted)]">
              ({pendingInvitations.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold border border-amber-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--syn-heading)]">
                        {inv.email}
                      </span>
                      <span className="syn-badge syn-badge-amber text-[9px] py-0.2 px-1.5 font-mono">
                        {t("settings.rolePendingBadge") || "Pending"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--syn-muted)]">
                      {getRoleLabel(inv.role)} • {new Date(inv.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setInviteToCancel(inv)}
                    className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    {t("settings.cancelInviteBtn") || "Cancel Invite"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delete Member Confirmation Modal ──────────────────────── */}
      <ConfirmationModal
        isOpen={!!memberToRemove}
        onClose={() => !isDeleting && setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title={t("settings.confirmRemoveMemberTitle") || "Remove Team Member"}
        description={(
          t("settings.confirmRemoveMemberDesc") ||
          "Are you sure you want to remove {name}? They will lose access to all audits, queries, and workspace reports immediately."
        ).replace("{name}", memberToRemove?.name || memberToRemove?.email || "")}
        confirmText={t("settings.removeMemberBtn") || "Remove Member"}
        cancelText={t("common.cancel") || "Cancel"}
        variant="danger"
        isLoading={isDeleting}
      >
        {memberToRemove && (
          <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold border border-red-500/20 shrink-0">
                {memberToRemove.name ? memberToRemove.name.slice(0, 2).toUpperCase() : memberToRemove.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[var(--syn-heading)] truncate">
                  {memberToRemove.name || memberToRemove.email}
                </p>
                <p className="text-[11px] text-[var(--syn-muted)] truncate">
                  {memberToRemove.email}
                </p>
              </div>
            </div>
            <span className="syn-badge syn-badge-purple text-[10px] py-0.5 px-2 shrink-0">
              {getRoleLabel(memberToRemove.role)}
            </span>
          </div>
        )}
      </ConfirmationModal>

      {/* ── Cancel Invitation Confirmation Modal ───────────────────── */}
      <ConfirmationModal
        isOpen={!!inviteToCancel}
        onClose={() => !isDeleting && setInviteToCancel(null)}
        onConfirm={handleConfirmCancelInvite}
        title={t("settings.confirmCancelInviteTitle") || "Cancel Invitation"}
        description={(
          t("settings.confirmCancelInviteDesc") ||
          "Are you sure you want to cancel the pending invitation for {email}? The invitation link will immediately expire."
        ).replace("{email}", inviteToCancel?.email || "")}
        confirmText={t("settings.cancelInviteActionBtn") || "Cancel Invitation"}
        cancelText={t("common.cancel") || "Cancel"}
        variant="danger"
        isLoading={isDeleting}
      >
        {inviteToCancel && (
          <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold border border-amber-500/20 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[var(--syn-heading)] truncate">
                  {inviteToCancel.email}
                </p>
                <p className="text-[11px] text-[var(--syn-muted)]">
                  {getRoleLabel(inviteToCancel.role)}
                </p>
              </div>
            </div>
            <span className="syn-badge syn-badge-amber text-[10px] py-0.5 px-2 shrink-0">
              {t("settings.rolePendingBadge") || "Pending"}
            </span>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}

export default WorkspaceTeamTab;

