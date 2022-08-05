const { Signale } = require("signale");

const { argv } = require("yargs/yargs")(process.argv.slice(2)).option("debug");

const { debug } = argv;

const options = {
  disabled: !debug,
};

const signale = new Signale(options);

module.exports = { signale };
