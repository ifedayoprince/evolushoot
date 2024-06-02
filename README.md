# EvoluShoot

The classic space shooter game but this time, with enemies who's movement pattern evolve over time.
It's not AI, it's powered by a genetic algorithm.

## Game Flow
- Game starts
- An initial population of enemies are created with random movement patterns.
- Each time the player kills one enemy, a new one spawn with a movement pattern that favours its survival.

## The Genetic Algorithm
The algorithm initializes with 20 actions an enemy can make,
```
[0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1]
```
- 0 for left
- 1 for right

These actions are looped after a period of time until the enemy dies.

Using techniques such as mutation and crossover, the movement pattern can experience change over time.

Selection ensures that only the best surviving movement patterns have a chance to breed (spawn new enemies).

Once these process is complete, each movement pattern is graded by effectiveness, and a movement pattern is picked from the top 25%.

## Get Started
To play around with the project,
- Clone the repo
- Spin up a local server
- Navigate to the `index.html` file in your browser.

## Known Issues
- The algorithm eventually picks a "stable" movement pattern and doesn't evolve after then.
- The movements aren't butter smooth.

# Have fun