const POP_SIZE = 8;
const MUT_RATE = 0.1;
const ACTION_LENGTH = 20
const SEQUENCE_DURATION = 2 // 2 seconds to run the entire actions

function generateMovementMaps() {
    let population = [];
    for (let i = 0; i < POP_SIZE; i++) {
        let temp = [];
        for (let j = 0; j < ACTION_LENGTH; j++) {
            temp.push(Math.round(Math.random()));
        }
        population.push([temp, getRandomHexColor()])
    }
    return population;
}

function getRandomHexColor() {
    let randomNumber = Math.floor(Math.random() * 16777215);
    let hexColor = randomNumber.toString(16).padStart(6, '0');
    return `#${hexColor}`;
}

function getNextBest(enemies, currentActionCount) {
    let populationMap = enemies.map(enemy => [enemy.movementMap, enemy.addedAt])
    let population = []

    for (let enemy of populationMap) {
        population.push(fitnessCal(enemy, currentActionCount));
    }

    if (Math.random() > 0.3) {
        let selected = selection(population);
        population.sort((a, b) => a[2] - b[2]);

        let crossovered = crossover(selected, population);
        let mutated = mutate(crossovered, MUT_RATE);

        let newGen = [];
        for (let chromo of mutated) {
            newGen.push(fitnessCal(chromo, currentActionCount));
        }

        population = replace(newGen, population);
    }
    return [population[Math.floor(Math.random() * 0.25 * POP_SIZE)][0], getRandomHexColor()];
}


function clamp(n, smallest, largest) {
    return Math.max(smallest, Math.min(n, largest));
}

function fitnessCal([movementMap, addedAt], currentActionCount) {
    let difference = 0;
    try {
        difference = addedAt / currentActionCount
    } catch {
        difference = 3;
    }
    return [movementMap, addedAt, difference];
}

function selection(population) {
    let sortedChromoPop = population.sort((a, b) => a[2] - b[2]);
    return sortedChromoPop.slice(0, Math.floor(0.5 * POP_SIZE));
}

function crossover(selectedChromo, population) {
    const CHROMO_LEN = 4;
    let offspringCross = [];
    for (let i = 0; i < POP_SIZE; i++) {
        let parent1 = selectedChromo[Math.floor(Math.random() * selectedChromo.length)];
        let parent2 = population[Math.floor(Math.random() * Math.floor(POP_SIZE * 0.5))];
        let p1 = parent1[0];
        let p2 = parent2[0];
        let crossoverPoint = Math.floor(Math.random() * (CHROMO_LEN - 1)) + 1;
        let child = p1.slice(0, crossoverPoint).concat(p2.slice(crossoverPoint));
        offspringCross.push([child, Math.min(parent1[1], parent2[1])]);
    }
    return offspringCross;
}

function mutate(offspring, mutRate) {
    let mutatedOffspring = [];
    for (let arr of offspring) {
        for (let i = 0; i < arr[0].length; i++) {
            if (Math.random() < mutRate) {
                arr[0][i] = Math.round(Math.random());
            }
        }
        mutatedOffspring.push(arr);
    }
    return mutatedOffspring;
}

function replace(newGen, population) {
    for (let i = 0; i < population.length; i++) {
        if (population[i][2] > newGen[i][2]) {
            population[i][0] = newGen[i][0];
            population[i][1] = newGen[i][1];
            population[i][2] = newGen[i][2];
        }
    }
    return population;
}
