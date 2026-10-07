"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { WorkspaceRole, WorkspacePermissions, getRolePermissions, ROLE_CONFIGS, RoleConfig } from "@/lib/permissions";
import { useAuditData } from "@/lib/audit-storage";

interface WorkspaceRoleContextType {
  role: WorkspaceRole;
  isSimulating: boolean;
  actualRole: WorkspaceRole;
  permissions: WorkspacePermissions;
  roleConfig: RoleConfig;
  isOwner: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  setSimulatedRole: (role: WorkspaceRole | null) => void;
  refreshRole: () => Promise<void>;
}

const WorkspaceRoleContext = createContext<WorkspaceRoleContextType | undefined>(undefined);

function getSimulatedRoleKey(userId?: string | null): string | null {
  return userId ? `querysonar_simulated_role_${userId}` : null;
}

export function WorkspaceRoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { audit } = useAuditData();
  const [actualRole, setActualRole] = useState<WorkspaceRole>("owner");
  const [simulatedRole, setSimulatedRoleState] = useState<WorkspaceRole | null>(null);

  const userId = session?.user?.id || null;
  const brandName = audit?.brandProfile?.name || "default";
  const workspaceId = brandName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "default";

  // Load simulated role from localStorage scoped to active user
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clean legacy un-scoped key
    try {
      localStorage.removeItem("querysonar_simulated_role");
    } catch {}

    if (!userId) {
      setSimulatedRoleState(null);
      return;
    }

    try {
      const userKey = getSimulatedRoleKey(userId);
      if (userKey) {
        const saved = localStorage.getItem(userKey);
        if (saved && ["owner", "admin", "editor", "viewer"].includes(saved)) {
          setSimulatedRoleState(saved as WorkspaceRole);
        } else {
          setSimulatedRoleState(null);
        }
      }
    } catch {}

    const handleRoleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ role?: WorkspaceRole | null }>;
      if (customEvent.detail?.role) {
        setSimulatedRoleState(customEvent.detail.role);
      } else {
        setSimulatedRoleState(null);
      }
    };

    window.addEventListener("querysonar_role_updated", handleRoleEvent);
    return () => window.removeEventListener("querysonar_role_updated", handleRoleEvent);
  }, [userId]);

  // Fetch actual role for active workspace
  const refreshRole = useCallback(async () => {
    if (status === "loading") return;

    // If unauthenticated or no session, default to owner for demo brand
    if (!session?.user?.email) {
      setActualRole("owner");
      return;
    }

    try {
      const res = await fetch(`/api/workspaces/team?workspaceId=${workspaceId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        const userEmail = session.user.email.toLowerCase();
        const currentMember = data.members.find(
          (m: { email: string; role: WorkspaceRole }) => m.email?.toLowerCase() === userEmail
        );
        if (currentMember?.role) {
          setActualRole(currentMember.role);
        } else {
          // If user is first/owner
          setActualRole("owner");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch current user workspace role:", err);
    }
  }, [session?.user?.email, status, workspaceId]);

  useEffect(() => {
    refreshRole();
  }, [refreshRole]);

  const setSimulatedRole = useCallback((newRole: WorkspaceRole | null) => {
    try {
      const userKey = getSimulatedRoleKey(userId);
      if (userKey) {
        if (newRole) {
          localStorage.setItem(userKey, newRole);
        } else {
          localStorage.removeItem(userKey);
        }
      }
    } catch {}

    setSimulatedRoleState(newRole);
    window.dispatchEvent(
      new CustomEvent("querysonar_role_updated", { detail: { role: newRole } })
    );
  }, [userId]);

  const effectiveRole: WorkspaceRole = simulatedRole || actualRole;
  const permissions = useMemo(() => getRolePermissions(effectiveRole), [effectiveRole]);
  const roleConfig = useMemo(() => ROLE_CONFIGS[effectiveRole], [effectiveRole]);

  const value = useMemo(
    () => ({
      role: effectiveRole,
      isSimulating: !!simulatedRole,
      actualRole,
      permissions,
      roleConfig,
      isOwner: effectiveRole === "owner",
      isAdmin: effectiveRole === "admin" || effectiveRole === "owner",
      isEditor: effectiveRole === "editor",
      isViewer: effectiveRole === "viewer",
      setSimulatedRole,
      refreshRole,
    }),
    [effectiveRole, simulatedRole, actualRole, permissions, roleConfig, setSimulatedRole, refreshRole]
  );

  return <WorkspaceRoleContext.Provider value={value}>{children}</WorkspaceRoleContext.Provider>;
}

export function useWorkspaceRole() {
  const context = useContext(WorkspaceRoleContext);
  if (!context) {
    // Fallback if rendered outside provider
    const fallbackPerms = getRolePermissions("owner");
    return {
      role: "owner" as WorkspaceRole,
      isSimulating: false,
      actualRole: "owner" as WorkspaceRole,
      permissions: fallbackPerms,
      roleConfig: ROLE_CONFIGS.owner,
      isOwner: true,
      isAdmin: true,
      isEditor: false,
      isViewer: false,
      setSimulatedRole: () => {},
      refreshRole: async () => {},
    };
  }
  return context;
}
