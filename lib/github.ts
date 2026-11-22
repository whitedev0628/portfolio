import type { Content } from "./types";

export async function saveContentToGithub(content: Content) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    throw new Error("GitHub is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO.");
  }

  const path = "data/content.json";
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "portfolio-admin",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const current = await fetch(endpoint, { headers, cache: "no-store" });
  if (!current.ok) {
    throw new Error(`Could not read content from GitHub (${current.status}).`);
  }
  const existing = (await current.json()) as { sha?: string };
  if (!existing.sha) throw new Error("GitHub did not return a file version.");

  const body = JSON.stringify(content, null, 2) + "\n";
  const update = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: "Update portfolio content from admin",
      content: Buffer.from(body).toString("base64"),
      sha: existing.sha,
      branch: "main",
    }),
  });

  if (!update.ok) {
    const detail = await update.text();
    throw new Error(`GitHub rejected the update (${update.status}). ${detail.slice(0, 180)}`);
  }
}
