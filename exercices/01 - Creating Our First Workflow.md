# Practical Exercise 01 - Creating Our First Workflow

#### **Exercise Description**

**In this practical exercise, our goal is to create our first workflow.**

Here are the instructions for the exercise:

1. Create a file named `01-building-blocks.yaml` under the `.github/workflows` folder in the root of your repository.
2. Name the workflow `01 - Building Blocks`.
3. Add the following triggers to your workflow:
   1. `push`
   2. `workflow_dispatch`
4. Add two jobs to the workflow:
   1. The first job, `echo-hello`, should run on `ubuntu-latest` and have a single step, named `Say hello`, which simply prints the `"Hello, World!"` message on the screen.
   2. The second job, `echo-goodbye`, should also run on `ubuntu-latest` and have two steps:
      1. The first step, named `Failed step`, should run a multi-line bash script which prints `"I will fail"` on the screen and exits with any non-zero code.
      2. The second step, named `Say goodbye`, should simply print `"Goodbye!"` on the screen.
5. Take some time to play around and inspect what happens once a step fails during the workflow execution.
6. As a last step, change the first step of the second job to exit with a zero code. You can also adjust the name of the step and the printed message to match the new state.
   1. Have a look at how this impacts the workflow execution.
7. Change the workflow triggers to contain only `workflow_dispatch` to prevent this workflow from running with every push and pollute the list of workflow runs.

#### **Tips**

**Executing multi-line bash scripts**

To execute a multi-line bash script, you can use the following syntax:

```yaml
steps:
  - name: Multi-line bash
    run: |
      echo "I am"
      echo "a multi-line"
      echo "script."
```
