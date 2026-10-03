export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface RoleConfig {
  id: WorkspaceRole;
  titleKey: string;
  defaultTitle: string;
  descriptionKey: string;
  defaultDescription: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconName: "shield" | "sparkles" | "eye" | "crown";
}

export const ROLE_CONFIGS: Record<WorkspaceRole, RoleConfig> = {
  owner: {
    id: "owner",
    titleKey: "settings.roleOwner",
    defaultTitle: "Workspace Owner",
    descriptionKey: "settings.roleOwnerDesc",
    defaultDescription: "Full administrative and billing control over the workspace.",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    badgeText: "text-amber-500 dark:text-amber-400",
    iconName: "crown",
  },
  admin: {
    id: "admin",
    titleKey: "settings.roleAdmin",
    defaultTitle: "Brand Lead (Admin)",
    descriptionKey: "settings.roleAdminDesc",
    defaultDescription: "Full control over workspace audits, queries, and team members.",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/20",
    badgeText: "text-purple-500 dark:text-purple-400",
    iconName: "shield",
  },
  editor: {
    id: "editor",
    titleKey: "settings.roleEditor",
    defaultTitle: "GEO Analyst (Editor)",
    descriptionKey: "settings.roleEditorDesc",
    defaultDescription: "Run multi-engine AI audits, track buyer queries, and execute defense tactics.",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/20",
    badgeText: "text-emerald-500 dark:text-emerald-400",
    iconName: "sparkles",
  },
  viewer: {
    id: "viewer",
    titleKey: "settings.roleViewer",
    defaultTitle: "Viewer (Read Only)",
    descriptionKey: "settings.roleViewerDesc",
    defaultDescription: "Read-only access to view AI consensus scores, citations, radar charts, and export reports.",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/20",
    badgeText: "text-sky-500 dark:text-sky-400",
    iconName: "eye",
  },
};

export interface WorkspacePermissions {
  canRunAudit: boolean;
  canManageQueries: boolean;
  canExecuteTactics: boolean;
  canConfigureAIEngines: boolean;
  canEditBrandProfile: boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
  canDeleteWorkspace: boolean;
}

export function getRolePermissions(role: WorkspaceRole): WorkspacePermissions {
  switch (role) {
    case "owner":
      return {
        canRunAudit: true,
        canManageQueries: true,
        canExecuteTactics: true,
        canConfigureAIEngines: true,
        canEditBrandProfile: true,
        canManageTeam: true,
        canManageBilling: true,
        canDeleteWorkspace: true,
      };
    case "admin":
      return {
        canRunAudit: true,
        canManageQueries: true,
        canExecuteTactics: true,
        canConfigureAIEngines: true,
        canEditBrandProfile: true,
        canManageTeam: true,
        canManageBilling: true,
        canDeleteWorkspace: false, // Only workspace owner can delete
      };
    case "editor":
      return {
        canRunAudit: true,
        canManageQueries: true,
        canExecuteTactics: true,
        canConfigureAIEngines: false, // Read-only AI configuration
        canEditBrandProfile: true,
        canManageTeam: false, // Cannot invite/modify teammates
        canManageBilling: false,
        canDeleteWorkspace: false,
      };
    case "viewer":
    default:
      return {
        canRunAudit: false,
        canManageQueries: false,
        canExecuteTactics: false,
        canConfigureAIEngines: false,
        canEditBrandProfile: false,
        canManageTeam: false,
        canManageBilling: false,
        canDeleteWorkspace: false,
      };
  }
}
