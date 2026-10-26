# Practical Exercise 13 - Working with Outputs

#### **Exercise Description**

**In this practical exercise, our goal is to explore how to set outputs from within jobs and workflow.**

Here are the instructions for the exercise:

1. Create a file named `12-outputs.yaml` under the `.github/workflows` folder at the root of your repository.
2. Name the workflow `12 - Working with Outputs`.
3. Add the following triggers with event filters and activity types to your workflow:
   1. `workflow_dispatch`: the `workflow_dispatch` trigger should receive the following inputs:
      1. `build-status`, of type `choice`, with the following options: `success`, `failure`. The default value should be `success`.
4. Add the following jobs:
   1. The first job:
      1. Should be named `build`
      2. Should execute on `ubuntu-latest`
      3. Should have two steps:
         1.  The first step, named `Print GITHUB_OUTPUT path`, should print the value of the environment variable `GITHUB_OUTPUT`
         2. The second step, named `Build`, should have an id of `build`, and it should append the following line to the file whose path is stored in the `GITHUB_OUTPUT` variable: `"status=<retrieve the value of the build-status input here>"`. If you are not sure how to append values to this file, check the **Tips** sections below.
      4. Should provide an output named `build-status`, which contains the value of the `status` output from the step with an id of `build`.
   2. The second job:
      1. Should be named `deploy`
      2. Should execute on `ubuntu-latest`
      3. Should execute only after the `build` job successfully completes **and** if the `status` output of the `build` job equals `success`.
      4. Should contain a single step named `Deploy` that prints the following message: `"Deploying"`
5. Commit the changes and push the code. Trigger the workflow from UI, providing varying values for the inputs. Take a few moments to inspect the output of the workflow runs. How did the different inputs influence the results of the workflow runs?

#### **Tips**

**Appending values to a file in bash**

To append values to a file, we can use the following syntax: `echo "<line content>" >> "<file path>"`
