const { Signale } = require("signale");

const { argv } = require("yargs/yargs")(process.argv.slice(2))
  .option("debug")
  .option("silent");

const { silent, debug } = argv;

const options = {
  disabled: silent,
  logLevel: debug ? "debug" : "info",
};

const signale = new Signale(options);

module.exports = { signale };
