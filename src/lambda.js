const { Lambda } = require("@aws-sdk/client-lambda");

class LambdaClient {
  constructor(configuration) {
    this.client = new Lambda(configuration);
  }

  async searchFunctionNames(query) {
    const allMatches = [];
    let nextMarker;
    while (true) {
      const result = await this.client.listFunctions({
        Marker: nextMarker,
      });

      const matches = result.Functions.filter(
        (func) => func.FunctionName.search(query) > 0
      );

      if (matches.length) allMatches.push(...matches);
      if (!result.NextMarker) break;

      nextMarker = result.NextMarker;
    }

    return allMatches;
  }
}

module.exports = { LambdaClient };
