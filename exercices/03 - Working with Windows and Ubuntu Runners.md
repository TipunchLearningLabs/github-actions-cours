# Practical Exercise 03 - Working with Windows and Ubuntu Runners

#### **Exercise Description**

**In this practical exercise, our goal is to explore different possibilities for setting runners for our workflows.**

Here are the instructions for the exercise:

1. Create a file named `03-workflow-runners.yaml` under the `.github/workflows` folder in the root of your repository.
2. Name the workflow `03 - Workflow Runners`.
3. Add the following triggers to your workflow:
   1. `push`
4. Add three jobs to the workflow:
   1. The first job, `ubuntu-echo`, should run on `ubuntu-latest` and have a single step, named `Show OS`, which runs a multi-line bash script printing `"This job is running on an Ubuntu runner."`, and then the runner OS on the next line.
   2. The second job, `windows-echo`, should run on `windows-latest` and have a single step, named `Show OS`, which runs a multi-line bash script printing `"This job is running on a Windows runner."`, and then the runner OS on the next line.
   3. The third job, `mac-echo`, should run on `macos-latest` and have a single step, named `Show OS`, which runs a multi-line bash script printing `"This job is running on a MacOS runner."`, and then the runner OS on the next line.
5. Change the workflow triggers to contain only `workflow_dispatch` to prevent this workflow from running with every push and pollute the list of workflow runs.

#### **Tips**

**Be careful with MacOS runners, they are expensive!**

MacOS runners are expensive when used in private repositories, and they can easily consume all the free minutes we have available for the month! Be careful if you are running your workflows in a private repository.

**How to access the runner OS**

The runner OS is available as an environment variable named `$RUNNER_OS`.

**Accessing environment variables in Windows**

Window's default shell is not compatible with bash-like syntax for accessing environment variables. You can either use a compatible method, or use bash by explicitly setting the shell for the respective step:

```yaml
steps:
  - name: Show OS
    shell: bash
    run: echo "I'm running on bash."
```
