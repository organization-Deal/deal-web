import { getChatGPTUser } from "../../chatgpt-auth";
import { projectDetails } from "../../../lib/project-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
  if (!(await getChatGPTUser())) {
    return Response.json(
      { error: "เข้าสู่ระบบเพื่อดูรายละเอียดโครงการ" },
      { status: 401, headers },
    );
  }
  const id = new URL(request.url).searchParams.get("id");
  const project = projectDetails.find((project) => project.id === id);
  return project
    ? Response.json({ project }, { headers })
    : Response.json({ error: "ไม่พบโครงการ" }, { status: 404, headers });
}
