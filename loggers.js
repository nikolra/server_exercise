const fs = require('fs');
const {stack} = require('./operations.js');

const logLevels = ["ERROR", "INFO", "DEBUG"];

const loggers = {
    "request-logger": {
        level: "INFO",
        filename: "requests.log",
        duration: 0,
        getMessages: (resource, reqData, count) => {
            const _this = loggers["request-logger"];
            const res = [{
                msg: `Incoming request | #${count} | resource: ${resource} | HTTP Verb ${reqData}`,
                level: "INFO"
            }];
            if (_this.level === "DEBUG")
                res.push(
                    {
                        msg: `request #${count} duration: ${_this.duration}ms`,
                        level: "DEBUG"
                    });
            return res;
        },
        printDebugLog: (count) => {
            const _this = loggers["request-logger"];
            if (_this.level === "DEBUG") {
                const _this = loggers["request-logger"];
                const msg = `request #${count} duration: ${_this.duration}ms`;
                fs.appendFileSync(`logs/${_this.filename}`, msg);
            }
        },
        printLog: (resource, reqData, count) => {
            const _this = loggers["request-logger"];
            _this.getMessages(resource, reqData, count)
                .forEach(message => {
                    printLog(message, _this.filename, count, true);
                });
        }
    },
    "stack-logger": {
        level: "INFO",
        filename: "stack.log",
        getMessages: (endPoint, data) => {
            const _this = loggers["stack-logger"];
            const res = [{
                msg: _this.messages[endPoint]["INFO"](data),
                level: "INFO"
            }];
            if (_this.level === "DEBUG" && endPoint !== "remove")
                res.push(
                    {
                        msg: _this.messages[endPoint][_this.level](data),
                        level: "DEBUG"
                    });
            return res;
        },
        printLog: (endPoint, data, count) => {
            const _this = loggers["stack-logger"];
            _this.getMessages(endPoint, data)
                .forEach(message => {
                    printLog(message, _this.filename, count, true);
                });
        },
        messages: {
            getSize: {
                INFO: () => {
                    return `Stack size is ${stack.length}`
                },
                DEBUG: (args) => {
                    return `Stack content (first == top): [${args.reverse().toString().replace(',', ', ')}]`;
                }
            },
            addArgs: {
                INFO: (args) => {
                    return `Adding total of ${args.length} argument(s) to the stack | Stack size: ${stack.length}`
                },
                DEBUG: (args) => {
                    return `Adding arguments: ${args.toString().replace(',', ', ')} | Stack size before ${stack.length - args.length} | stack size after ${stack.length}`
                }
            },
            perfOpp: {
                INFO: ({operation, data}) => {
                    return `Performing operation ${operation}. Result is ${data} | stack size: ${stack.length}`
                },
                DEBUG: ({operation, arguments, data}) => {
                    return `Performing operation: ${operation}(${arguments}) = ${data}`
                }
            },
            remove: {
                INFO: (count) => {
                    return `Removing total ${count} argument(s) from the stack | Stack size: ${stack.length}`
                },
                DEBUG: () => {
                }
            }
        },
        printError: (errorMsg, count) => {
            const _this = loggers["stack-logger"];
            const msg = `Server encountered an error ! message: ${errorMsg}`;
            const content = `${formatDate(new Date())} ERROR: ${msg} | request #${count}\n`;
            fs.appendFileSync(`logs/${_this.filename}`, content);
        }
    },
    "independent-logger": {
        level: "DEBUG",
        filename: "independent.log",
        getMessages: (opName, result, args) => {
            const _this = loggers["independent-logger"];
            const res = [{
                msg: `Performing operation ${opName}. Result is ${result}`,
                level: "INFO"
            }];
            if (_this.level === "DEBUG")
                res.push(
                    {
                        msg: `Performing operation: ${opName}(${args.toString().replace(',', ', ')}) = ${result}`,
                        level: "DEBUG"
                    });
            return res;
        },
        printLog: (opName, result, args, count) => {
            const _this = loggers["independent-logger"];
            _this.getMessages(opName, result, args)
                .forEach(message => {
                    printLog(message, _this.filename, count, true);
                });
        },
        printError: (errorMsg, count) => {
            const _this = loggers["independent-logger"];
            const msg = `Server encountered an error ! message: ${errorMsg}`;
            const content = `${formatDate(new Date())} ERROR: ${msg} | request #${count}\n`;
            fs.appendFileSync(`logs/${_this.filename}`, content);
        }
    }
}

const printLog = (logger, filename,count,  stdout = false) => {
    const content = `${formatDate(new Date())} ${logger.level.toUpperCase()}: ${logger.msg} | request #${count}`;
    fs.appendFileSync(`logs/${filename}`, `${content}\n`);
    if (stdout)
        console[logger.level.toLowerCase()](content);
}

const formatDate = (date) => {
    return `${addLeadingZeros(date.getDate())}-0${(date.getMonth()) + 1}-${addLeadingZeros(date.getFullYear())} ${addLeadingZeros(date.getHours())}:${addLeadingZeros(date.getMinutes())}:${addLeadingZeros(date.getSeconds())}.${formatMS(date.getMilliseconds())}`;
}

const addLeadingZeros = (timeType) => {
    let time = timeType.toString();
    if (time.length === 1) {
        time = '0' + time;
    }
    return time;
};

const formatMS = (ms) => {
    let milliseconds = addLeadingZeros(ms);
    if(milliseconds.length === 2)
    {
        milliseconds += '0';
    }
    else if(milliseconds.length === 1)
    {
        milliseconds += '00';
    }
    return milliseconds;
}

module.exports = {
    loggers: loggers,
    logLevels: logLevels
}