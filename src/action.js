const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const branchName = core.getInput("branch_name");
    const baseBranch = core.getInput("base_branch");

    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { context = {} } = github;
    const { owner, repo } = context.repo;
		const { pull_request } = context.payload;

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
      body: "Placeholder text. Function is to tell the user that a new branch has been created if a test case fails. Currently activates on every Pull Request.",
    });

    console.log(`Successfully created branch: ${branchName}`);
    core.setOutput("branch_name", branchName);
  } catch (error) {
    console.error("Error:", error.message);
    core.setFailed(error.message);
  }
}

run();
