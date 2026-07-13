const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDocClient, getTableName } = require('../../lib/dynamoClient');

const PROFILE_SK = 'PROFILE';
const TARGETS_SK = 'TARGETS';
const UNAUTHORIZED_MESSAGE = 'Unauthorized';
const FAILED_PROFILE_MESSAGE = 'Failed to fetch profile';

function toJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function getUserSub(event) {
  const authorizer = event?.requestContext?.authorizer;
  return authorizer?.claims?.sub || authorizer?.jwt?.claims?.sub || null;
}

function findItemBySk(items, sk) {
  return items.find((item) => item?.SK === sk) || null;
}

function toProfileDto(profileItem) {
  if (!profileItem) {
    return null;
  }

  const profile = { ...profileItem };
  delete profile.PK;
  delete profile.SK;
  delete profile.GSI1PK;
  delete profile.GSI1SK;
  return profile;
}

function toTargetsDto(targetsItem) {
  if (!targetsItem) {
    return null;
  }

  const targets = { ...targetsItem };
  delete targets.PK;
  delete targets.SK;
  return targets;
}

async function queryUserItemBySk(documentClient, tableName, userPk, sk) {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': userPk,
      ':sk': sk,
    },
    ConsistentRead: true,
    Limit: 1,
  });
  const response = await documentClient.send(command);
  return response?.Items?.[0] || null;
}

async function fetchUserProfileItems(userSub) {
  const tableName = getTableName();
  const documentClient = getDynamoDocClient();
  const userPk = `USER#${userSub}`;
  const [profile, targets] = await Promise.all([
    queryUserItemBySk(documentClient, tableName, userPk, PROFILE_SK),
    queryUserItemBySk(documentClient, tableName, userPk, TARGETS_SK),
  ]);

  return [profile, targets].filter(Boolean);
}

/**
 * Returns the authenticated user's profile and target records.
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event - API Gateway event.
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} API response payload.
 */
exports.handler = async (event) => {
  const userSub = getUserSub(event);
  if (!userSub) {
    return toJsonResponse(401, { success: false, message: UNAUTHORIZED_MESSAGE });
  }

  try {
    const items = await fetchUserProfileItems(userSub);
    const profile = toProfileDto(findItemBySk(items, PROFILE_SK));
    const targets = toTargetsDto(findItemBySk(items, TARGETS_SK));

    return toJsonResponse(200, { success: true, profile, targets });
  } catch {
    return toJsonResponse(500, {
      success: false,
      message: FAILED_PROFILE_MESSAGE,
    });
  }
};
