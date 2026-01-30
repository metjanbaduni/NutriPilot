const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const DEFAULT_REGION = 'us-east-1';
const TABLE_NAME_ENV_KEYS = ['NUTRIPILOT_TABLE_NAME', 'TABLE_NAME'];
const MISSING_TABLE_NAME_MESSAGE = 'DynamoDB table name is required';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Resolve the AWS region for DynamoDB operations.
 * @returns {string}
 */
function getAwsRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || DEFAULT_REGION;
}

/**
 * Resolve the DynamoDB table name from environment variables.
 * @returns {string}
 * @throws {Error} When a table name is not configured.
 */
function getTableName() {
  for (const key of TABLE_NAME_ENV_KEYS) {
    const value = process.env[key];
    if (isNonEmptyString(value)) {
      return value.trim();
    }
  }

  throw new Error(MISSING_TABLE_NAME_MESSAGE);
}

/**
 * Create a singleton DynamoDB Document client with sane defaults.
 * @returns {DynamoDBDocumentClient}
 */
function getDynamoDocClient() {
  if (!global.__dynamoDocClient) {
    const client = new DynamoDBClient({ region: getAwsRegion() });

    global.__dynamoDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }

  return global.__dynamoDocClient;
}

module.exports = { getAwsRegion, getTableName, getDynamoDocClient };
