// All teaching content lives here. The app only RENDERS what it finds in this file.
// To add a topic: add another entry to LESSONS with the same shape (see README.md).
window.LESSONS = {
  loops: {
    id: "loops",
    title: "Python Loops",
    description: "Make Python repeat work for you. Count, collect, and keep asking until something happens, then build your own guessing game.",
    level: "Beginner",
    minutes: 60,
    objectives: [
      "Explain what a loop is and why programmers use loops",
      "Use a for loop with range() and with a list",
      "Write a while loop whose condition eventually becomes False",
      "Use break to leave a loop and continue to skip a turn",
      "Build up a total with a loop, and spot an infinite loop",
    ],
    skills: ["for loops", "range()", "while loops", "break and continue", "Totals with loops", "Fixing infinite loops"],

    // ---------- Stage 1: Learn ----------
    learn: [
      {
        title: "What is a loop?",
        body: `<p>Your teacher says: <i>"Write your name 3 times."</i> You don't need 3 different instructions. You repeat one instruction 3 times. A <b>loop</b> tells Python to repeat code for you.</p>`,
        code: `for round_number in range(3):
    print("Hello, Python Lab!")`,
        explain: "range(3) gives 3 turns. On each turn Python runs the indented line, so the message prints 3 times. The indented lines are called the loop's body.",
      },
      {
        title: "for loops and range()",
        body: `<p>A <code>for</code> loop is like walking down a row of lockers and visiting each one. <code>range(start, stop, step)</code> makes the numbers to visit, and it stops <b>before</b> the stop number.</p>
          <ul><li><code>range(5)</code> gives 0, 1, 2, 3, 4</li><li><code>range(1, 6)</code> gives 1, 2, 3, 4, 5</li><li><code>range(10, 0, -3)</code> gives 10, 7, 4, 1</li></ul>`,
        code: `for number in range(1, 6):
    print("Number", number)

for fruit in ["apple", "banana", "mango"]:
    print("I like", fruit)`,
        explain: "The first loop counts 1 to 5 (6 is not included). The second loop visits every item of a list, and the variable fruit holds the current item.",
      },
      {
        title: "while loops",
        body: `<p>A <code>while</code> loop is like stirring tea <i>while</i> the sugar has not dissolved. Use it when you don't know how many repeats you need, only the <b>condition</b> for continuing.</p>
          <p class="warn">Always change something inside the loop so the condition can become <code>False</code>. If it never does, you get an <b>infinite loop</b>.</p>`,
        code: `battery = 3
while battery > 0:
    print("Battery:", battery, "bars")
    battery = battery - 1
print("Battery empty!")`,
        explain: "Before every turn Python checks battery > 0. Inside the loop we lower battery by 1, so the check eventually becomes False and Python moves on to the last line.",
      },
      {
        title: "break and continue",
        body: `<p><code>break</code> is an emergency exit: leave the loop right now. <code>continue</code> means "skip this one": jump straight to the next turn.</p>`,
        code: `for number in range(1, 10):
    if number == 3:
        continue      # skip 3
    if number == 6:
        break         # stop completely at 6
    print(number)`,
        explain: "It prints 1, 2, 4, 5. The number 3 is skipped by continue. When number reaches 6, break ends the loop, so 6 is never printed.",
      },
      {
        title: "Adding things up",
        body: `<p>Loops often <b>collect</b> something, like a running total or a count. Create the variable <b>before</b> the loop and update it <b>inside</b> the loop.</p>`,
        code: `total = 0
for price in [20, 35, 15]:
    total = total + price
    print("Running total:", total)
print("Final total:", total)`,
        explain: "total starts at 0. Each turn adds one price to it. Because the last print is not indented, it runs once, after the loop has finished.",
      },
    ],

    // ---------- Stage 2: Explore ----------
    demo: "loopVisualizer",

    // ---------- Stage 3: Practice ----------
    exercises: [
      {
        id: "loops:ex1", difficulty: "Easy", title: "Rocket countdown", xp: 20,
        prompt: `<p>Use a <code>for</code> loop to print <code>5 4 3 2 1</code>, one number per line, then print <code>Liftoff!</code> once.</p>`,
        starter: `# Print 5, 4, 3, 2, 1 (one per line), then Liftoff!
# Use a for loop with range().

`,
        hints: [
          "You need to count down. Which step value makes range() go downwards?",
          "range(start, stop, step): the stop number is NOT included. To include 1, stop at 0.",
          "Print Liftoff! after the loop, not inside it. Indentation decides what is inside.",
        ],
        tests: [
          { name: "Prints 5 to 1, then Liftoff!", expectOutput: "5\n4\n3\n2\n1\nLiftoff!", needsLoop: true,
            hint: "One number per line, then Liftoff! exactly once. And it must use a loop." },
        ],
      },
      {
        id: "loops:ex2", difficulty: "Medium", title: "Add up to n", xp: 30,
        prompt: `<p>Finish the program so it prints the total of <code>1 + 2 + ... + n</code>. For n = 5 the last line must be <code>Total: 15</code>.</p>
                 <p class="muted">Careful: the starter code has an infinite loop until you fix it. Python Lab will stop it after a few seconds.</p>`,
        starter: `n = int(input("Enter n: "))
total = 0
i = 1
while i <= n:
    # TODO 1: add i to total
    # TODO 2: make i bigger by 1, otherwise this loop never ends!
    pass   # delete this line when you are done
print("Total:", total)
`,
        hints: [
          "Inside the loop you need two lines: one that grows total, one that moves i forward.",
          "Try total = total + i. Then ask: what must change so that i <= n eventually becomes False?",
          "Both new lines must be indented under the while line. Remove the pass line.",
        ],
        tests: [
          { name: "n = 5 gives 15", inputs: ["5"], expectLast: "Total: 15", needsLoop: true,
            hint: "Does the loop add every number from 1 to n?" },
          { name: "n = 10 gives 55", inputs: ["10"], expectLast: "Total: 55" },
          { name: "n = 1 gives 1 (edge case)", inputs: ["1"], expectLast: "Total: 1",
            hint: "n itself must be included in the total." },
          { name: "n = 0 gives 0 (loop never runs)", inputs: ["0"], expectLast: "Total: 0" },
        ],
      },
      {
        id: "loops:ex3", difficulty: "Hard", title: "Sum of the evens", xp: 50,
        prompt: `<p>The program keeps asking for numbers until the user types <code>stop</code>. Add the <b>even</b> numbers together and print <code>Sum of evens: N</code> at the end.</p>
                 <p class="muted">Example: 4, 7, 10, stop gives <code>Sum of evens: 14</code>. Combine a loop, <code>break</code>, and an <code>if</code>.</p>`,
        starter: `total = 0
while True:
    text = input("Enter a number (or 'stop'): ")
    # TODO 1: if text is "stop", leave the loop
    # TODO 2: otherwise turn text into a number and add it to total, but only if it is even
print("Sum of evens:", total)
`,
        hints: [
          "while True keeps going until a break runs. Where should the break go?",
          "Check for stop first: if text == \"stop\": then break. Everything after it only runs for real numbers.",
          "Turn the text into a number with int(text). A number is even when number % 2 == 0.",
        ],
        tests: [
          { name: "4, 7, 10, stop gives 14", inputs: ["4", "7", "10", "stop"], expectLast: "Sum of evens: 14", needsLoop: true,
            hint: "Only add numbers that are even, and stop when the user types stop." },
          { name: "Only odd numbers gives 0", inputs: ["3", "5", "stop"], expectLast: "Sum of evens: 0" },
          { name: "Typing stop straight away gives 0", inputs: ["stop"], expectLast: "Sum of evens: 0",
            hint: "Check for stop BEFORE you turn the text into a number." },
          { name: "Negative even numbers count too", inputs: ["-4", "2", "stop"], expectLast: "Sum of evens: -2" },
        ],
      },
    ],

    // ---------- Stage 4: Build ----------
    project: {
      id: "loops:project", title: "Number Guessing Game", xp: 100,
      prompt: `<h3>🎯 Build: Number Guessing Game</h3>
        <p>The computer picks a secret number from 1 to 100. The player gets <b>7 attempts</b>.</p>
        <ol>
          <li>Repeat while the player still has attempts left.</li>
          <li>Ask for a guess with <code>input()</code>, turn it into a number, count the attempt.</li>
          <li>Too small: print <code>Too low!</code>. Too big: print <code>Too high!</code></li>
          <li>Right: print <code>Correct! Attempts used: N</code> and stop the loop.</li>
          <li>Out of attempts: print <code>Game over! The number was X</code></li>
        </ol>`,
      starter: `import random

secret = random.randint(1, 100)
max_attempts = 7
attempts = 0

print("I'm thinking of a number between 1 and 100.")

# TODO: write a loop that runs while attempts < max_attempts.
# Inside it: ask for a guess, count the attempt, compare with secret,
# and use break when the guess is correct.

# TODO: after the loop, if the player never guessed it, print the Game over message.
`,
      hints: [
        "You don't know how many guesses are needed, but you know the limit. Try: while attempts < max_attempts:",
        "Inside the loop: guess = int(input(\"Your guess: \")), then attempts = attempts + 1.",
        "Use if / elif / else to compare guess with secret. In the else branch (correct), print the message and break.",
        "After the loop you need to know if the player won. Create won = False before the loop, set it to True before break, then use if not won: for the Game over message.",
      ],
      tests: [
        { name: "Right on the 1st guess", setup: "import random\nrandom.randint = lambda a, b: 42", inputs: ["42"],
          expectLast: "Correct! Attempts used: 1", notContains: ["Game over"],
          hint: "After a correct guess the game must end (break) and must not print Game over." },
        { name: "Too high, too low, then correct", setup: "import random\nrandom.randint = lambda a, b: 42", inputs: ["50", "25", "42"],
          contains: ["Too high!", "Too low!"], expectLast: "Correct! Attempts used: 3", needsLoop: true,
          hint: "50 is bigger than the secret (Too high!), 25 is smaller (Too low!). Count every attempt." },
        { name: "Right on the 7th (last) attempt", setup: "import random\nrandom.randint = lambda a, b: 42", inputs: ["1", "2", "3", "4", "5", "6", "42"],
          expectLast: "Correct! Attempts used: 7",
          hint: "The 7th guess must still be allowed. Check your loop condition." },
        { name: "Seven wrong guesses ends the game", setup: "import random\nrandom.randint = lambda a, b: 42", inputs: ["1", "2", "3", "4", "5", "6", "7"],
          expectLast: "Game over! The number was 42", notContains: ["Correct!"],
          hint: "After exactly 7 attempts the loop must stop and print Game over! The number was 42" },
      ],
    },

    // The "Free code" stage starts with this.
    freeStarter: `# 🧪 Free playground: experiment!
# Ideas: change the numbers, try range(0, 20, 5),
# or loop over your own list of names.

for i in range(1, 4):
    print("Loop number", i)
`,

    // ---------- Stage 7: Complete ----------
    badges: [
      { id: "loops-learner", icon: "🔁", name: "Loop Learner", desc: "Finished all 3 practice exercises", earnedBy: "exercises" },
      { id: "loops-guess-master", icon: "🎯", name: "Guess Master", desc: "Built the Number Guessing Game", earnedBy: "project" },
      { id: "loops-scholar", icon: "🧠", name: "Loop Scholar", desc: "Passed the final quiz", earnedBy: "quiz" },
    ],
    quiz: {
      id: "loops:quiz", xp: 40, passScore: 4,
      questions: [
        { q: "What numbers does <code>range(1, 4)</code> give?", options: ["1, 2, 3, 4", "1, 2, 3", "0, 1, 2, 3", "2, 3, 4"], answer: 1,
          explain: "range stops before the stop number, so 4 is not included." },
        { q: "You know you need exactly 10 repeats. Which loop fits best?", options: ["for number in range(10)", "while True with no break", "continue", "None of them"], answer: 0,
          explain: "A for loop with range is perfect when the number of repeats is known." },
        { q: "What happens if a while loop's condition never becomes False?", options: ["Python fixes it", "It runs forever (infinite loop)", "It runs once", "It prints an error straight away"], answer: 1,
          explain: "Nothing stops it, so it keeps repeating. Change a variable inside the loop, or use break." },
        { q: "What does <code>continue</code> do?", options: ["Leaves the loop", "Stops the program", "Skips the rest of this turn and starts the next one", "Starts the loop again from the very first value"], answer: 2,
          explain: "continue jumps to the next turn. break is the one that leaves the loop." },
        { q: "How many times does the body run? <code>for i in range(3): print(i)</code>", options: ["2", "3", "4", "Forever"], answer: 1,
          explain: "range(3) gives 0, 1, 2. That is 3 turns." },
      ],
    },
    bonus: {
      title: "Bonus: smarter guessing game",
      prompt: "Upgrade your game: add a Warmer/Colder hint, or let the player pick the difficulty (more attempts for a bigger range). This bonus has no automatic tests, so show your result to your facilitator.",
      starter: `import random

# Bonus idea: let the player choose the biggest number.
biggest = int(input("Pick the biggest number (e.g. 50): "))
secret = random.randint(1, biggest)
attempts = 0

# TODO: write your improved guessing loop here
`,
    },
    nextSteps: [
      "Loops inside loops (nested loops) for grids and patterns",
      "Looping over text, one character at a time",
      "Functions: package your loops so you can reuse them",
    ],
  },
};
