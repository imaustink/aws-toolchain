const { CloudWatchLogs } = require("@aws-sdk/client-cloudwatch-logs");
const { delaySeconds } = require("./utils");
const { signale } = require("../src/signale");

const POLLING_INTERVAL_SECONDS = 5;

class CloudWatchClient {
  constructor(configuration) {
    this.client = new CloudWatchLogs(configuration);
  }

  async tailLogStream(logGroupName, logStreamName, { nextToken, follow }) {
    signale.log("Tailing logs for", logGroupName, logStreamName);

    const logEvents = await this.client.getLogEvents({
      logStreamName,
      logGroupName,
      nextToken,
    });

    signale.debug(`Found ${logEvents.events.length} log events`);

    const lines = logEvents.events.map(
      ({ message, timestamp }) =>
        // TODO date concat should probably be optional
        `${new Date(timestamp).toISOString()}\t${message}`
    );

    if (lines.length) process.stdout.write(`${lines.join("\n")}\n`);

    if (follow) {
      signale.debug(`Waiting ${POLLING_INTERVAL_SECONDS} seconds`);

      await delaySeconds(POLLING_INTERVAL_SECONDS);
      // TODO I don"t like that this is unstoppable. The interface should allow the consumer to close without exiting the process
      signale.debug(`Tailing next logs`);

      await this.tailLogStream(logGroupName, logStreamName, {
        nextToken: logEvents.nextForwardToken,
        follow,
      });
    }
  }
}

module.exports = { CloudWatchClient };
