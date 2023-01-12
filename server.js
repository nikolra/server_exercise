const express = require("express");
const bodyParser = require('body-parser')
const {operations, twoArgumentsOperations, stack} = require('./operations.js');
const fs = require('fs');
const {loggers, logLevels} = require("./loggers");
const app = express();

let requestCounter = 0;


app.use(bodyParser.json());

app.get("/logs/level", (req, res) => {
    const start = Date.now();
    requestCounter++;
    if (!req.query["logger-name"]) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Missing required query param logger-name");
    }
    if (!loggers[req.query["logger-name"]]) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Unsupported logger-name");
    }
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/logs/level", "GET", requestCounter);
    return res.status(200).send(loggers[req.query["logger-name"]].level);
});

app.put("/logs/level", (req, res) => {
    const start = Date.now();
    requestCounter++;
    if (!req.query["logger-name"]) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Missing required query param logger-name");
    }
    if (!req.query["logger-level"]) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Missing required query param logger-level");
    }
    if (!logLevels.includes(req.query["logger-level"])) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Unsupported logger-level");
    }
    if (!loggers[req.query["logger-name"]]) {
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
        return res.status(400).send("Unsupported logger-name");
    }
    loggers[req.query["logger-name"]].level = req.query["logger-level"];
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/logs/level", "PUT", requestCounter);
    return res.status(200).send(loggers[req.query["logger-name"]].level);
});

app.post("/independent/calculate", (req, res) => {
    requestCounter++;
    const start = Date.now();
    const operation = req.body.operation.toLowerCase();
    let argumentsNumber = 1;
    if (twoArgumentsOperations.includes(operation)) argumentsNumber = 2;
    if (!operations[operation]) {
        const errMsg = `Error: unknown operation: ${req.body.operation}`;
        loggers["independent-logger"].printError(errMsg, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/independent/calculate", "POST", requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    if (req.body.arguments.length < argumentsNumber) {
        const errMsg = `Error: Not enough arguments to perform the operation ${req.body.operation}`;
        loggers["independent-logger"].printError(errMsg, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/independent/calculate", "POST", requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    if (req.body.arguments.length > argumentsNumber) {
        const errMsg = `Error: Too many arguments to perform the operation ${req.body.operation}`;
        loggers["independent-logger"].printError(errMsg, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/independent/calculate", "POST", requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    const data = operations[operation](...req.body.arguments);
    if ((operation === "divide" || operation === "fact") && data === -1) {
        const errMsg = operation === "divide" ?
            `Error while performing operation Divide: division by 0` :
            `Error while performing operation Factorial: not supported for the negative number`;
        loggers["independent-logger"].printError(errMsg, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/independent/calculate", "POST", requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    res.status(200).send({result: data});
    loggers["independent-logger"].printLog(operation, data, req.body.arguments.toString(), requestCounter);
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/independent/calculate", "POST", requestCounter);
});

app.get("/stack/size", (req, res) => {
    requestCounter++;
    const start = Date.now();
    res.status(200).send({result: stack.length});
    loggers["stack-logger"].printLog("getSize", [...stack], requestCounter);
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/stack/size", "GET", requestCounter);
});

app.put("/stack/arguments", (req, res) => {
    requestCounter++;
    const start = Date.now();
    stack.push(...req.body.arguments);
    res.status(200).send({result: stack.length});
    loggers["stack-logger"].printLog("addArgs", req.body.arguments, requestCounter);
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/stack/arguments", "PUT", requestCounter);
});

app.get("/stack/operate", (req, res) => {
    requestCounter++;
    const start = Date.now();
    const operation = req.query.operation.toLowerCase();
    const arguments = [];
    let argumentsNumber = 1;
    if (twoArgumentsOperations.includes(operation))
        argumentsNumber = 2;
    if (!operations[operation]) {
        const errMsg = `Error: unknown operation: ${req.query.operation}`;
        loggers["stack-logger"].printError(errMsg, requestCounter, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/stack/operate", "GET", requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    if (stack.length < argumentsNumber) {
        const errMsg = `Error: cannot implement operation ${req.query.operation}. It requires ${argumentsNumber} arguments and the stack has only ${stack.length} arguments`;
        loggers["stack-logger"].printError(errMsg, requestCounter, requestCounter);
        loggers["request-logger"].duration = Date.now() - start;
        loggers["request-logger"].printLog("/stack/operate", "GET", requestCounter);
        return res.status(409).send(
            {"error-message": errMsg});
    }
    arguments.push(stack.pop());
    if (argumentsNumber === 2)
        arguments.push(stack.pop());
    const data = operations[operation](...arguments);
    if ((operation === "divide" || operation === "fact") && data === -1) {
        const errMsg = operation === "divide" ?
            `Error while performing operation Divide: division by 0` :
            `Error while performing operation Factorial: not supported for the negative number`;
        loggers["stack-logger"].printError(errMsg, requestCounter, requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    res.status(200).send({result: data});
    loggers["stack-logger"].printLog("perfOpp", {operation, arguments, data}, requestCounter);
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/stack/operate", "GET", requestCounter);
});

app.delete("/stack/arguments", (req, res) => {
    requestCounter++;
    const start = Date.now();
    const count = req.query.count;
    if (count > stack.length) {
        const errMsg = `Error: cannot remove ${count} from the stack. It has only ${stack.length} arguments`;
        loggers["stack-logger"].printError(errMsg, requestCounter);
        return res.status(409).send({"error-message": errMsg});
    }
    stack.splice(stack.length - count, count);
    res.status(200).send({result: stack.length});
    loggers["stack-logger"].printLog("remove", count, requestCounter);
    loggers["request-logger"].duration = Date.now() - start;
    loggers["request-logger"].printLog("/stack/arguments", "DELETE", requestCounter);
});

const server = app.listen(9583, () => {
    fs.writeFileSync("logs/requests.log", "");
    fs.writeFileSync("logs/stack.log", "");
    fs.writeFileSync("logs/independent.log", "");
    console.log("Server listening on port 9583...\n");
});
