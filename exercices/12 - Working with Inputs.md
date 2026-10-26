# Practical Exercise 12 - Working with Inputs

#### **Exercise Description**

**In this practical exercise, our goal is to explore the different ways we can provide inputs to workflows.**

The focus of this exercise will be on providing inputs via the `workflow_dispatch` trigger. The `workflow_call` trigger also receives inputs, and it is covered in details in **Section 17 - Creating Reusable Workflows**. Here are the instructions for the exercise:

1. Create a file named `11-inputs.yaml` under the `.github/workflows` folder at the root of your repository.
2. Name the workflow `11 - Working with Inputs`.
3. Add the following triggers with event filters and activity types to your workflow:
   1. `workflow_dispatch`: the `workflow_dispatch` trigger should receive the following inputs:
      1. `dry-run`, of type `boolean` and with a default value of `false`. It should also contain the following description: `"Skip deployment and only print build output"`
      2. `target`, of type `environment`, required, and with the following description: `"Which environment the workflow will target"`
      3. `tag`, of type `choice`, with the following options: `v1`, `v2`, and `v3`. It should have `v3` as the default value, and contain the following description: `"Release from which to build and deploy"`
4. Add the following jobs:
   1. The first job:
      1. Should be named `build`
      2. Should execute on `ubuntu-latest`
      3. Should contain a single step named `Build` that prints the following message: `"Building from tag <retrieve the value of the tag input here>"`
   2. The second job:
      1. Should be named `deploy`
      2. Should execute on `ubuntu-latest`
      3. Should execute only after the `build` job successfully completes **and** if the input `dry-run` is set to `false`.
      4. Should set the `environment` option to the `target` input.
      5. Should contain a single step named `Deploy` that prints the following message: `"Deploying to <retrieve the value of the target input here>"`
5. Commit the changes and push the code. Trigger the workflow from UI, providing varying values for the inputs. Take a few moments to inspect the output of the workflow runs. How did the different inputs influence the results of the workflow runs?
