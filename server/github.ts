import { Octokit } from "octokit";
import { Item, CreateItemRequest } from "@shared/schema";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";

if (!GITHUB_TOKEN) {
  console.error("⚠️  GITHUB_TOKEN environment variable is not set");
}

if (!GITHUB_REPO) {
  console.error("⚠️  GITHUB_REPO environment variable is not set (format: owner/repo)");
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const repoParts = GITHUB_REPO.split("/").filter(Boolean);
const [owner, repo] = repoParts;
const ITEMS_DIR = "_gallery";

// Validate GitHub credentials on startup
export async function validateGitHubAccess(): Promise<boolean> {
  if (!GITHUB_TOKEN || !GITHUB_REPO || !owner || !repo) {
    console.error("✗ GitHub credentials incomplete");
    console.error(`  GITHUB_TOKEN: ${GITHUB_TOKEN ? "set" : "NOT SET"}`);
    console.error(`  GITHUB_REPO: ${GITHUB_REPO ? GITHUB_REPO : "NOT SET"}`);
    return false;
  }

  try {
    console.log(`Validating GitHub access to ${owner}/${repo}...`);
    const response = await octokit.rest.repos.get({
      owner,
      repo,
    });
    console.log(`✓ GitHub repository access verified: ${response.data.full_name}`);
    return true;
  } catch (error: any) {
    console.error(`✗ GitHub repository access failed: ${error.message}`);
    console.error(`  Repository: ${owner}/${repo}`);
    console.error(`  - Verify GITHUB_TOKEN has 'repo' scope at https://github.com/settings/tokens`);
    console.error(`  - Verify GITHUB_REPO format is correct: owner/repo`);
    console.error(`  - Ensure repository exists and is accessible`);
    return false;
  }
}

export async function listItems(): Promise<Item[]> {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: ITEMS_DIR,
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    const items: Item[] = [];
    for (const file of response.data) {
      if (file.type === "file" && file.name.endsWith(".json")) {
        const itemResponse = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
        });

        if ("content" in itemResponse.data) {
          const content = Buffer.from(itemResponse.data.content, "base64").toString("utf-8");
          try {
            const item = JSON.parse(content);
            items.push(item);
          } catch (e) {
            console.error(`Failed to parse ${file.name}:`, e);
          }
        }
      }
    }

    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`Gallery directory ${ITEMS_DIR} not found, returning empty list`);
      return [];
    }
    console.error("GitHub API error in listItems:", error.message, error.status);
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

export async function createItem(item: CreateItemRequest): Promise<Item> {
  // Check if GitHub is properly configured
  if (!GITHUB_TOKEN || !GITHUB_REPO || !owner || !repo) {
    throw new Error(
      "GitHub storage is not configured. Please set GITHUB_TOKEN and GITHUB_REPO environment variables."
    );
  }

  const id = Date.now().toString();
  const newItem: Item = {
    id,
    type: item.type,
    title: item.title,
    content: item.content,
    createdAt: new Date().toISOString(),
  };

  const filePath = `${ITEMS_DIR}/${id}.json`;
  const fileContent = Buffer.from(JSON.stringify(newItem, null, 2)).toString("base64");

  try {
    console.log(`Creating item in GitHub: ${filePath}`);
    
    // First, ensure the _gallery directory exists by creating a .gitkeep if needed
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: ITEMS_DIR,
      });
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`Gallery directory doesn't exist, creating with .gitkeep`);
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: `${ITEMS_DIR}/.gitkeep`,
          message: `Initialize gallery directory`,
          content: Buffer.from("").toString("base64"),
        });
      }
    }
    
    // Now create the item file
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add gallery item: ${item.title}`,
      content: fileContent,
    });
    console.log(`Item created successfully: ${id}`);
  } catch (error: any) {
    console.error("GitHub API error in createItem:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
    });
    throw new Error(`Failed to save to GitHub: ${error.message}`);
  }

  return newItem;
}

export async function deleteItem(id: string): Promise<void> {
  // Check if GitHub is properly configured
  if (!GITHUB_TOKEN || !GITHUB_REPO || !owner || !repo) {
    throw new Error(
      "GitHub storage is not configured. Please set GITHUB_TOKEN and GITHUB_REPO environment variables."
    );
  }

  const filePath = `${ITEMS_DIR}/${id}.json`;

  try {
    const fileResponse = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    if ("sha" in fileResponse.data) {
      await octokit.rest.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: `Delete gallery item: ${id}`,
        sha: fileResponse.data.sha,
      });
    }
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }
}
