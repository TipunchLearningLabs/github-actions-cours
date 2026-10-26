# Practical Exercise 07 - Working with Expressions

#### **Exercise Description**

**In this practical exercise, our goal is to deepen our knowledge around how to use expressions.**

Here are the instructions for the exercise:

1. Create a file named `07-expressions.yaml` under the `.github/workflows` folder at the root of your repository.
2. Name the workflow `07 - Using Expressions`.
3. Add the following triggers with event filters and activity types to your workflow:
   1. `push`
   2. `workflow_dispatch`: under the `workflow_dispatch` event trigger, define one input named `debug`, of type `boolean`, and with a default value of `false`.
4. Add a single job named `echo` to the workflow. The job should run on `ubuntu-latest` and should contain three steps:
   1. The first step, named `[debug] Print start-up data`, should execute only if the `inputs.debug` input is set to `true`. If you are unsure how to do it, check the **Tips** section below. The step should run a multi-line script to print the following data:
      1. `"Triggered by: <retrieve the event name here>"`
      2. `"Branch: <retrieve the ref here>"`
      3. `"Commit SHA: <retrieve the commit sha here>"`
      4. `"Runner OS: <retrieve the runner os here>"`
   2. The second step, named `[debug] Print when triggered from main`, should execute only if the `inputs.debug` input is set to `true` **and** the workflow was triggered from the `main` branch. The step should print a single line on the screen: `"I was triggered from main"`.
   3. The third step, named Greeting, should be normally executed and print a `"Hello, world"` message on the screen.
5. Commit the changes and push the code. Take a few moments to inspect the result of the workflow run triggered by the push event.
6. Now trigger the workflow manually from the UI, providing enough variations for the `debug` input, and take a few moments to inspect the results. What has changed?
7. Add the `run-name` property to the workflow definition. The `run-name` property should print the following message: `07 - Using Expressions | DEBUG - <'ON' if the debug input is true, 'OFF' otherwise>`
   1. Expressions allow for default values and ternary operations. These leverage the `&&` and `||` logical operators in the following way:
      1. Providing a default: `${{ expression || default_value }}`. The `default_value` will be used if the expression evaluates to a falsy value.
      2. Using the ternary operation: `${{ expression && truthy_value || falsy_value }}`. The `truthy_value` will be used if the expression evaluates to a truthy value, and the `falsy_value` will be used otherwise. The actual value resulting from the expression evaluation will not be present in the result of this ternary operation.
8. Commit the changes and push the code. Take a few moments to inspect the result of the workflow run triggered by the push event.
9. Now trigger the workflow manually from the UI, providing enough variations for the `debug` input, and take a few moments to inspect the results. What has changed?
10. Change the workflow triggers to contain only `workflow_dispatch` to prevent this workflow from running with every push and pollute the list of workflow runs.

#### **Tips**

**Conditionally executing jobs and steps**

To execute jobs and steps conditionally, we can leverage the if keyword in either the job or the step definition. The if keyword accepts an expression, and the job or step will be executed if the expression evaluates to a truthy value; otherwise, the job or step will be skipped. Here is an example:

```yaml
jobs:
  echo:
    runs-on: ubuntu-latest
    steps:
      - name: Test
        if: github.event_name == 'push'
        run: echo "I was triggered by a push event"
```
