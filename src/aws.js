const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

class AWSConfiguration {
  constructor(profile, region) {
    return {
      region,
      credentialDefaultProvider: defaultProvider({
        roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
        profile,
      }),
    };
  }
}

module.exports = { AWSConfiguration };
