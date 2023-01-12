const stack = [];

const operations = {
    plus: (x, y) => x + y,
    minus: (x, y) => x - y,
    times: (x, y) => x * y,
    divide: (x, y) => y === 0? -1: Math.floor(x / y),
    pow: (x, y) => Math.pow(x, y),
    abs: (x) => Math.abs(x),
    fact: (x) => factorial(x)
}

const factorial = (num) => {
    if (num < 0)
        return -1;
    else if (num === 0)
        return 1;

    else {
        return (num * factorial(num - 1));
    }
}

const twoArgumentsOperations = ["plus", "minus", "times", "divide", "pow"];

module.exports = {operations, twoArgumentsOperations, stack};