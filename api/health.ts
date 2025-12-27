import { VercelRequest, VercelResponse } from "@vercel/node";
import { validateGitHubAccess } from "../server/github";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const gitHubAccessValid = await validateGitHubAccess();
  res.json({
    status: "ok",
    github: gitHubAccessValid ? "connected" : "disconnected",
  });
}
