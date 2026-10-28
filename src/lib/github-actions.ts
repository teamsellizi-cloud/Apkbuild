import { GitHubConfig } from "@/types";

export interface TriggerWorkflowParams {
  buildId: string;
  buildType: string;
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  sourceUrl?: string;
  configJson: string;
  callbackUrl: string;
  callbackToken: string;
}

export async function verifyGitHubConfig(config: GitHubConfig): Promise<{
  valid: boolean;
  message: string;
  workflowFound?: boolean;
}> {
  if (!config.token) {
    return { valid: false, message: "GitHub Personal Access Token is required." };
  }
  if (!config.repo || !config.repo.includes("/")) {
    return { valid: false, message: "Invalid repository format. Must be 'owner/repo'." };
  }

  const [owner, repo] = config.repo.split("/");

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "devs-apk-builder",
      },
    });

    if (res.status === 401) {
      return { valid: false, message: "Authentication failed. Check your GitHub Personal Access Token." };
    }
    if (res.status === 404) {
      return { valid: false, message: `Repository '${owner}/${repo}' not found or token lacks access.` };
    }
    if (!res.ok) {
      return { valid: false, message: `GitHub API error: ${res.statusText} (${res.status})` };
    }

    const workflowFile = config.workflow || "apk-builder.yml";
    const wfRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "devs-apk-builder",
        },
      }
    );

    const workflowFound = wfRes.ok;

    return {
      valid: true,
      message: `Connected successfully to ${owner}/${repo}${
        workflowFound ? ` (Found workflow ${workflowFile})` : ` (Note: Workflow ${workflowFile} not yet committed)`
      }`,
      workflowFound,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { valid: false, message: `Network error connecting to GitHub: ${error.message}` };
  }
}

export async function triggerGitHubBuild(
  config: GitHubConfig,
  params: TriggerWorkflowParams
): Promise<{ success: boolean; error?: string; runUrl?: string }> {
  if (!config.token || !config.repo) {
    return { success: false, error: "GitHub Actions is not configured." };
  }

  const [owner, repo] = config.repo.split("/");
  const workflowFile = config.workflow || "apk-builder.yml";
  const branch = config.branch || "main";

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "devs-apk-builder",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: branch,
          inputs: {
            build_id: params.buildId,
            build_type: params.buildType,
            app_name: params.appName,
            package_id: params.packageId,
            version_name: params.versionName,
            version_code: String(params.versionCode),
            source_url: params.sourceUrl || "",
            config_json: params.configJson,
            callback_url: params.callbackUrl,
            callback_token: params.callbackToken,
          },
        }),
      }
    );

    if (res.status === 204 || res.ok) {
      return {
        success: true,
        runUrl: `https://github.com/${owner}/${repo}/actions`,
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: (errData as { message?: string }).message || `GitHub returned HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}
