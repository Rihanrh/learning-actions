const core = require("@actions/core");
const github = require("@actions/github");

function generateBranchName(prefix, prNumber, suffix) {
  return `${prefix}${prNumber}${suffix ? '-' + suffix : ''}`;
}

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const branchPrefix = core.getInput("branch_prefix");
    const branchSuffix = core.getInput("branch_suffix");
    const baseBranch = core.getInput("base_branch");

    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { context = {} } = github;
    const { owner, repo } = context.repo;
    const { pull_request } = context.payload;

    const branchName = generateBranchName(branchPrefix, pull_request.number, branchSuffix);

    console.log(`Creating new branch: ${branchName} based on ${baseBranch}`);

    // Get the SHA of the base branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });
    const sha = refData.object.sha;

    // Create a new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: sha,
    });

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request.number,
      body: `A new branch '${branchName}' has been created based on this pull request.`,
    });

    console.log(`Successfully created branch: ${branchName}`);
    core.setOutput("branch_name", branchName);
  } catch (error) {
    console.error("Error:", error.message);
    core.setFailed(error.message);
  }
}

run();