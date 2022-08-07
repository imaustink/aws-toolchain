const { CloudWatchLogs } = require("@aws-sdk/client-cloudwatch-logs");
const { PollingHandler } = require("../src/polling-handler");
const { signale } = require("../src/signale");

const POLLING_INTERVAL = 5 * 1000; // 5 seconds

class CloudWatchClient {
  constructor(configuration) {
    this.client = new CloudWatchLogs(configuration);
  }

  createLogStreamsEmitter(logGroupName, { limit } = {}) {
    let previousLogStreams = [];
    return new PollingHandler(async () => {
      const result = await this.getLogStreams(logGroupName, {
        limit,
      });

      const newLogStreams = result.logStreams.filter((logStream) =>
        previousLogStreams.every(
          (previousLogStream) => logStream.arn !== previousLogStream.arn
        )
      );

      // TODO this is essentially a memory leak
      previousLogStreams.push(...newLogStreams);

      if (newLogStreams.length) return newLogStreams;
    }, POLLING_INTERVAL);
  }

  async getLogStreams(
    logGroupName,
    { nextToken, limit, descending, orderBy } = {}
  ) {
    signale.log("Getting log streams", logGroupName, nextToken);
    const result = await this.client.describeLogStreams({
      logGroupName,
      nextToken,
      limit,
      descending,
      orderBy,
    });

    return {
      logStreams: result.logStreams.length ? result.logStreams : null,
      nextToken: result.nextToken,
    };
  }

  createLogStreamLinesEmitter(logGroupName, logStreamName) {
    let nextToken;
    return new PollingHandler(
      async () => {
        const result = await this.getLogStreamLines(
          logGroupName,
          logStreamName,
          {
            nextToken: nextToken,
          }
        );

        nextToken = result.nextToken;

        if (result.lines) return result.lines;
      },

      POLLING_INTERVAL
    );
  }

  async getLogStreamLines(logGroupName, logStreamName, { nextToken } = {}) {
    signale.log(
      "Getting log stream lines",
      logGroupName,
      logStreamName,
      nextToken
    );

    const result = await this.client.getLogEvents({
      logStreamName,
      logGroupName,
      nextToken,
    });

    signale.debug(`Found ${result.events.length} log events`);

    const lines = result.events.map(
      ({ message, timestamp }) =>
        // TODO date concat should probably be optional
        `${new Date(timestamp).toISOString()}\t${message}`
    );

    return {
      lines: lines.length ? lines : null,
      nextToken: result.nextForwardToken,
    };
  }
}

module.exports = { CloudWatchClient };
