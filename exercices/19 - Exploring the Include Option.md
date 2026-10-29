Practical Exercise 19 - Exploring the Include Option

#### **Exercise Description**

**In this practical exercise, our goal is to work with the include option for matrices to thoroughly understand how they behave.**

Here are the instructions for the exercise:

1. Extend the `15-matrices.yaml` workflow with a new job:

   1. It should be called `include-example`.

   2. It should be run on `ubuntu-latest`.

   3. It should have a matrix with three parameters:

      1. `color`, with values `red` and `green`;
      2. `shape`, with values `circle` and `square`;
      3. `size`, with values `small` and `large`.

   4. Additionally, add the following combination to the `include` array:

      1. ```
         include:  - color: red    shape: triangle
         ```

   5. The job `name` should have the following format: `<color value>-<shape value>-<size value>`

   6. The job should contain a single step, named `Dummy step`, which prints the combination of color, shape, and size to the screen following the same format as the job name.

2. Commit the changes and push the code. Trigger the workflow manually from the UI and take a few moments to inspect the result of the workflow run. How many jobs were generated? Which combinations were present?

3. Now extend the `include-example` job by:

   1. Adding a new entry **at the beginning** of the include array containing:

      1. ```
         include:  - opacity: 50
         ```

   2. Adjust both the job `name` option and the echo statement of the `Dummy step` to include the value of the `opacity` parameter.

4. Commit the changes and push the code. Trigger the workflow manually from the UI and take a few moments to inspect the result of the workflow run. How many jobs were generated? Which combinations were present?

5. Now extend the include option of the `include-example` job by adding the following two entries to the array immediately after the `opacity` entry:

   1. The first entry should have two parameters: `color`, with a value of `red`, and `opacity`, with a value of `75`.
   2. The second entry should have two parameters: `shape`, with a value of `circle`, and `opacity`, with a value of `100`.

6. At this point in time, the include option should look like this:

   1. ```yaml
      include:
        - opacity: 50
        - color: red
          opacity: 75
        - shape: circle
          opacity: 100
        - color: red
          shape: triangle
      ```

7. Commit the changes and push the code. Trigger the workflow manually from the UI and take a few moments to inspect the result of the workflow run. Which combinations were present? How were the values of certain properties overwritten based on the new entries?

8. Last but not least, move the first entry of the `include` array (`opacity: 50`) to the last position in the array.

9. Commit the changes and push the code. Trigger the workflow manually from the UI and take a few moments to inspect the result of the workflow run. How did this change impact the values of the `opacity` property for the generated jobs?
