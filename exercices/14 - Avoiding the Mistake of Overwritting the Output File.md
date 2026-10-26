# Practical Exercise 14 - Avoiding the Mistake of Overwritting the Output File

#### **Exercise Description**

**In this practical exercise, our goal is to explore what happens when we accidentally overwrite the content of the GITHUB_OUTPUT file.**

Here are the instructions for the exercise:

1. Extend the workflow in the `12-outputs.yaml` file:

   1. Add the following outputs to the step with an id of `build`:
      1. `output1` should contain the value `value1`
      2. `output2` should contain the value `value2`
   2. Add the following output to the `build` job:
      1. `output1` should contain the value of the `output1` output from the build step.
   3. Additionally, in the `build` step, add a new line to print the contents of the file referenced by the `GITHUB_OUTPUT` variable.
   4. Add the following line **after** printing the contents of the file: `echo "mistake=true" > "$GITHUB_OUTPUT"` (the mistake in using `>` instead of `>>` is intentional).
   5. Add a new line to print the contents of the same file again.
   6. Add a new step to the `deploy` job:
      1. The step should be named `Print Outputs`
      2. The step should print the value of `output1` from the `build` job.

2. Commit the changes and push the code. Trigger the workflow from the UI and take a few moments to inspect the results of the workflow runs. What happens with the values of the outputs from the build job?

3. Now move the line which mistakenly overwrites the contents of the `GITHUB_OUTPUT` file to its own step. To do that:

   1. Create a new step, named `Step with mistake`, **after** the `Build` step in the `build` job.

   2. Move the following lines from the `Build` step to the `Step with mistake` step:

      1. ```yaml
         echo "mistake=true" >> "$GITHUB_OUTPUT"
         cat "$GITHUB_OUTPUT"
         ```

4. Commit the changes and push the code. Trigger the workflow from the UI and take a few moments to inspect the results of the workflow runs. What happens with the values of the outputs from the build job?
