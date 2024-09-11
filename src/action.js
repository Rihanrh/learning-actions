const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const branchName = core.getInput('branch_name');
        const baseBranch = core.getInput('base_branch');

        const octokit = github.getOctokit(GITHUB_TOKEN);
        const { context = {} } = github;
        const { owner, repo } = context.repo;

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

        console.log(`Successfully created branch: ${branchName}`);
        core.setOutput("branch_name", branchName);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();