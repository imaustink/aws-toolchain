const { EventEmitter } = require("events");

class PollingHandler extends EventEmitter {
  constructor(handler, interval) {
    super();

    this.handler = handler;
    this.interval = interval;

    if (typeof this.handler !== "function") {
      throw new Error("A handler function must be implemented!");
    }
  }
  resolveHandler = (results) => {
    if (results) this.emit("data", results);
  };

  catchHandler = (error) => {
    this.emit("error", error);
  };

  start(...initialArgs) {
    this.handler
      .apply(this, initialArgs)
      .then(this.resolveHandler)
      .catch(this.catchHandler);
    this.timer = setTimeout(() => this.start(), this.interval);
  }

  stop(event) {
    clearInterval(this.timer);
    this.emit("end", event);
  }
}

module.exports = { PollingHandler };
