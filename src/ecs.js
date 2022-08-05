const { ECS } = require("@aws-sdk/client-ecs");
const { signale } = require("../src/signale");

class ECSClient {
  constructor(configuration) {
    this.client = new ECS(configuration);
  }

  async findCluster(name) {
    signale.info(`Searching for cluster matching ${name}`);

    const clusters = await this.client.listClusters({});

    signale.debug(`Received ${clusters.clusterArns.length} clusters`);
    signale.debug(clusters.clusterArns);

    const matchingClusters = clusters.clusterArns.filter((arn) =>
      arn.includes(name)
    );
    // TODO print out available cluster names
    if (matchingClusters.length === 0)
      throw new Error(`No clusters matching ${name} were found!`);
    // TODO setup a prompt here
    if (matchingClusters.length > 1)
      throw new Error(`More than one cluster matching ${name} was found!`);

    signale.debug(`Found matching cluster ${matchingClusters[0]}`);

    return matchingClusters[0];
  }

  async findTaskLogStream(cluster, name) {
    signale.info(`Searching for task matching ${name}`);

    // TODO filter tasks here so we can bail out early
    const tasks = await this.client.listTasks({
      cluster,
    });

    signale.debug(`Received ${tasks.taskArns.length} tasks`);

    const taskDetails = await this.client.describeTasks({
      cluster,
      tasks: tasks.taskArns,
    });

    signale.debug(`Received ${tasks.taskArns.length} task descriptions`);

    const matchingTasks = taskDetails.tasks.filter(({ taskDefinitionArn }) =>
      taskDefinitionArn.includes(name)
    );
    // TODO print available task names
    if (matchingTasks.length === 0)
      throw new Error(`No tasks matching ${name} were found!`);

    signale.debug(`Found matching task ${matchingTasks[0].taskArn}`);

    const { taskArn, taskDefinitionArn } = matchingTasks[0];
    const [, , taskId] = taskArn.split("/");
    // signale.log(matchingTasks);

    const { taskDefinition } = await this.client.describeTaskDefinition({
      taskDefinition: taskDefinitionArn,
    });

    signale.debug(`Received task definition ${taskDefinitionArn}`);

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
