const { ECS } = require("@aws-sdk/client-ecs");
const { signale } = require("../src/signale");

class ECSClient {
  constructor(configuration) {
    this.client = new ECS(configuration);
  }

  async searchClusterNames(query) {
    signale.log(`Searching for cluster matching ${query}`);

    const clusters = await this.client.listClusters({});

    signale.debug(`Received ${clusters.clusterArns.length} clusters`);
    signale.debug(clusters.clusterArns);

    const matchingClusters = clusters.clusterArns.filter(
      (arn) => arn.search(query) > 0
    );

    signale.debug(`Found ${matchingClusters.length} matching clusters`);

    return matchingClusters;
  }

  async searchTaskNames(cluster, query) {
    signale.log(`Searching for task matching ${query}`);

    // TODO filter tasks here so we can bail out early
    const tasks = await this.client.listTasks({
      cluster,
    });

    signale.debug(`Received ${tasks.taskArns.length} tasks`);

    // TODO handle pagination
    const taskDetails = await this.client.describeTasks({
      cluster,
      tasks: tasks.taskArns,
    });

    signale.debug(`Received ${tasks.taskArns.length} task descriptions`);

    const matchingTasks = taskDetails.tasks.filter(
      ({ taskDefinitionArn }) => taskDefinitionArn.search(query) > 0
    );

    signale.debug(`Found  ${matchingTasks.length} matching task`);

    return matchingTasks;
  }

  async findTaskLogStream(taskArn, taskId) {
    signale.log(`Getting log stream for task`);

    const { taskDefinition } = await this.client.describeTaskDefinition({
      taskDefinition: taskArn,
    });

    signale.debug(`Received task definition ${taskArn}`);

    // TODO need a more universal fix for this
    const { name: serviceName, logConfiguration } =
      taskDefinition.containerDefinitions.find(
        ({ name }) => name !== "al-agent"
      );

    const { options } = logConfiguration;
    const {
      ["awslogs-group"]: logGroupName,
      ["awslogs-stream-prefix"]: logStreamPrefix,
    } = options;

    const logStreamName = `${logStreamPrefix}/${serviceName}/${taskId}`;

    signale.debug(
      `Found log stream log stream ${logGroupName}:${logStreamName}`
    );

    return {
      logGroupName,
      logStreamName,
    };
  }
}

module.exports = { ECSClient };
