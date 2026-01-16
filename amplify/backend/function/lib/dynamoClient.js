const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

/**
 * Create a singleton DynamoDB Document client with sane defaults.
 * @returns {DynamoDBDocumentClient}
 */
function getDynamoDocClient() {
  if (!global.__dynamoDocClient) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
    });

    global.__dynamoDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }

  return global.__dynamoDocClient;
}

module.exports = { getDynamoDocClient };
