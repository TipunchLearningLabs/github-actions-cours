import * as core from '@actions/core'
import * as exec from '@actions/exec'

const validateBranchName = ({ branchName }) => /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
const validateDirectoryName = ({ dirName }) => /^[a-zA-Z0-9_\-\/]+$/.test(dirName);

async function run() {
    const baseBranch = core.getInput('base-branch');
    const targetBranch = core.getInput('target-branch');
    /*const ghToken = core.getInput('gh-token'); */
    const workingDir = core.getInput('working-directory');
    /*const debug = core.getBooleanInput('debug');*/

    core.setSecret(ghToken);

    if (!validateBranchName({ baseBranch: baseBranch })) {
      core.setFailed("Invalid base-branch name. Branch name should include only characters, numbers, dots, hyphens, underscores, and forward slashes.");
      throw Error();
    }

    if (!validateBranchName({ targetBranch: targetBranch })) {
      core.setFailed("Invalid target-branch name. Branch name should include only characters, numbers, dots, hyphens, underscores, and forward slashes.");
      throw Error();
    }

    if (!validateDirectoryName( {dirName: workingDir })) {
      core.setFailed("Invalid working directory name. Direcctory name should include only characters, numbers, hyphens, underscores, and forward slashes.");
      throw Error();
    }

    core.info(`[js-dependency-update] : base branch is ${baseBranch}`);
    core.info(`[js-dependency-update] : target branch is ${targetBranch}`);
    core.info(`[js-dependency-update] : working directory is ${workingDir}`);


    await exec.exec('pnpm upadate', [], {
      cwd: workingDir
    });

    const gitStatus = exec.getExecOutput('git status -s package*.json', [], {
      cwd: workingDir
    });

    if (gitStatus.stdout.length > 0) {
      core.info('[js-dependency-update] : There are changes in the package.json files. Creating PR...');
    } else {
      core.info('[js-dependency-update] : No changes found in the package.json files.');
    }

    core.info('I am a custom JS action');
}

run()
