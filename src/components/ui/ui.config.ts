// ui.config.ts

import type { LifecycleStage, LeadSource } from "../../types/crm.types";

export const STAGE_CONFIG: Record<
  LifecycleStage,
  { bg: string; text: string; border: string }
> = {
  "Lead Created": { bg: "primary-bg", text: "primary-text", border: "primary-border" },
  "Call Handling": { bg: "warning-bg", text: "warning-text", border: "warning-border" },
  "Followup": { bg: "warning-bg", text: "warning-text", border: "warning-border" },
  "Trial Booked": { bg: "success-bg", text: "success-text", border: "success-border" },
  "Trial Done": { bg: "success-bg", text: "success-text", border: "success-border" },
  "Joined": { bg: "success-bg", text: "success-text", border: "success-border" },
  "Membership Active": { bg: "success-bg", text: "success-text", border: "success-border" },
  "Renewal": { bg: "danger-bg", text: "danger-text", border: "danger-border" },
};

export const SOURCE_CONFIG: Record<
  LeadSource,
  { icon: string; color: string }
> = {
  "Meta Ads": { icon: "⬡", color: "text-blue-400" },
  "WhatsApp": { icon: "◉", color: "success-text" },
  "Walk-in": { icon: "◈", color: "warning-text" },
};

export const ROLE_BADGE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "primary-bg primary-text primary-border",
  ADMIN: "primary-bg primary-text primary-border",
  RM: "success-bg success-text success-border",
  FM: "warning-bg warning-text warning-border",
  TRAINING_MANAGER: "primary-bg primary-text primary-border",
  HR: "bg-surface text-muted border-theme",
};