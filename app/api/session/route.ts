import { getChatGPTUser } from "../../chatgpt-auth";
import { canManageTeam, canReviewRequests } from "../../../lib/team-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  return Response.json(
    {
      signedIn: !!user,
      canManage: !!user && canManageTeam(user.email),
      canReview: !!user && canReviewRequests(user.email),
    },
    { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } },
  );
}
