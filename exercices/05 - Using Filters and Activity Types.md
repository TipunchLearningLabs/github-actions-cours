# Practical Exercise 05 - Using Filters and Activity Types

#### **Exercise Description**

**In this practical exercise, our goal is to explore the different ways we can use event filters and activity types to better target when workflows are run.**

We will create two workflows for this practical exercise. Here are the instructions for the exercise:

1. Creating our first workflow:
   1. Create a file named `05-1-filters-activity-types.yaml` under the `.github/workflows` folder at the root of your repository.
   2. Name the workflow `05 - 1 - Event Filters and Activity Types`.
   3. Add the following triggers with event filters and activity types to your workflow:
      1. `pull_request`: use activity types to restrict the activities only to `opened` and `synchronize`. Additionally, use use event filters to restrict this workflow runs to be triggered only by changes to the `main` branch.
   4. Add a single job named `echo` to the workflow. The job should contain a single step, which simply prints the following message to the screen: `Running whenever a PR is opened or synchronized AND base branch is main`.
   5. Commit the changes and push the code.
   6. Edit the `README.md` file at the root of the repository with whatever changes you see fit, and commit the changes to a new branch named `pr-test-1` (on the UI, this option is at the bottom of the window that appears when you want to save the changes).
   7. Create a pull request from `pr-test-1` to the main branch and take a few moments to inspect the output of the triggered workflow run.
2. Creating our second workflow:
   1. Create a file named `05-2-filters-activity-types.yaml` under the `.github/workflows` folder at the root of your repository.
   2. Name the workflow `05 - 2 - Event Filters and Activity Types`.
   3. Add the following triggers with event filters and activity types to your workflow:
      1. `pull_request`: use activity types to restrict the activities only to `closed`. Additionally, use use event filters to restrict this workflow runs to be triggered only by changes to the `main` branch.
   4. Add a single job named `echo` to the workflow. The job should contain a single step, which simply prints the following message to the screen: `Running whenever a PR is closed`.
   5. Commit the changes and push the code.
   6. Close the PR opened in step 1 of this practical exercise and take a few moments to inspect the output of the triggered workflow run.
3. Change the workflow triggers to contain only `workflow_dispatch` to prevent this workflow from running with every push and pollute the list of workflow runs.
