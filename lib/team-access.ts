import { env } from "cloudflare:workers";

export function canManageTeam(email: string) {
  return (
    !!email &&
    (env.DEAL_DEMO_TEAM_EMAILS ?? "")
      .split(",")
      .some((entry) => entry.trim().toLowerCase() === email.toLowerCase())
  );
}

// The site owner assigned live request review to the existing DEAL! staff accounts.
export const canReviewRequests = canManageTeam;
