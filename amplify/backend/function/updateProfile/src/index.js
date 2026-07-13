const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { calculateMacros } = require('../../lib/calculateMacros');
const { getDynamoDocClient, getTableName } = require('../../lib/dynamoClient');

const PROFILE_SK = 'PROFILE';
const TARGETS_SK = 'TARGETS';
const UNAUTHORIZED_MESSAGE = 'Unauthorized';
const INVALID_BODY_MESSAGE = 'Invalid request body';
const FAILED_UPDATE_MESSAGE = 'Failed to update profile';

const REQUIRED_FIELDS = [
  'bodyWeightKg',
  'heightCm',
  'ageYears',
  'gender',
  'activityLevel',
  'goal',
];

function toJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getAuthClaims(event) {
  const authorizer = event?.requestContext?.authorizer;
  return authorizer?.claims || authorizer?.jwt?.claims || null;
}

function parseEventBody(event) {
  const body = event?.body;
  if (body == null) {
    throw createHttpError(400, INVALID_BODY_MESSAGE);
  }

  if (typeof body === 'object' && !Array.isArray(body)) {
    return body;
  }

  if (typeof body !== 'string') {
    throw createHttpError(400, INVALID_BODY_MESSAGE);
  }

  try {
    const parsedBody = JSON.parse(body);
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      throw new Error(INVALID_BODY_MESSAGE);
    }
    return parsedBody;
  } catch {
    throw createHttpError(400, INVALID_BODY_MESSAGE);
  }
}


async function fetchExistingProfileItem(documentClient, tableName, userPk) {
  const command = new GetCommand({
    TableName: tableName,
    Key: { PK: userPk, SK: PROFILE_SK },
    ConsistentRead: true,
  });
  const response = await documentClient.send(command);
  return response?.Item || null;
}

async function writeProfileAndTargets(documentClient, tableName, profileItem, targetsItem) {
  const profileCommand = new PutCommand({
    TableName: tableName,
    Item: profileItem,
  });
  const targetsCommand = new PutCommand({
    TableName: tableName,
    Item: targetsItem,
  });

  await Promise.all([documentClient.send(profileCommand), documentClient.send(targetsCommand)]);
}

function buildProfileItem({ userPk, profileInput, existingProfile, email, timestamp }) {
  const profileEmail = existingProfile?.email || email || undefined;
  return {
    PK: userPk,
    SK: PROFILE_SK,
    email: profileEmail,
    GSI1PK: profileEmail ? `EMAIL#${profileEmail}` : existingProfile?.GSI1PK,
    GSI1SK: profileEmail ? PROFILE_SK : existingProfile?.GSI1SK,
    bodyWeightKg: profileInput.bodyWeightKg,
    heightCm: profileInput.heightCm,
    ageYears: profileInput.ageYears,
    gender: profileInput.gender,
    activityLevel: profileInput.activityLevel,
    goal: profileInput.goal,
    createdAt: existingProfile?.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function toProfileDto(profileItem) {
  const profile = { ...profileItem };
  delete profile.PK;
  delete profile.SK;
  delete profile.GSI1PK;
  delete profile.GSI1SK;
  return profile;
}

function toTargetsDto(targetsItem) {
  const targets = { ...targetsItem };
  delete targets.PK;
  delete targets.SK;
  return targets;
}

/**
 * Updates user profile and recalculates targets for the authenticated user.
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event - API Gateway event payload.
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} Update response.
 */
exports.handler = async (event) => {
  const claims = getAuthClaims(event);
  const userSub = claims?.sub;
  if (!userSub) {
    return toJsonResponse(401, { success: false, message: UNAUTHORIZED_MESSAGE });
  }

  try {
    const profileInput = parseEventBody(event);
    REQUIRED_FIELDS.forEach((field) => {
      if (profileInput[field] == null) {
        throw createHttpError(400, `${field} is required`);
      }
    });

    let targets;
    try {
      targets = calculateMacros(profileInput);
    } catch (error) {
      throw createHttpError(400, error?.message || FAILED_UPDATE_MESSAGE);
    }
    const timestamp = Date.now();
    const userPk = `USER#${userSub}`;
    const tableName = getTableName();
    const documentClient = getDynamoDocClient();
    const existingProfile = await fetchExistingProfileItem(documentClient, tableName, userPk);
    const profileItem = buildProfileItem({
      userPk,
      profileInput,
      existingProfile,
      email: claims?.email,
      timestamp,
    });
    const targetsItem = { PK: userPk, SK: TARGETS_SK, ...targets, calculatedAt: timestamp };

    await writeProfileAndTargets(documentClient, tableName, profileItem, targetsItem);

    return toJsonResponse(200, {
      success: true,
      profile: toProfileDto(profileItem),
      targets: toTargetsDto(targetsItem),
    });
  } catch (error) {
    if (error?.statusCode) {
      return toJsonResponse(error.statusCode, { success: false, message: error.message });
    }
    return toJsonResponse(500, { success: false, message: FAILED_UPDATE_MESSAGE });
  }
};
