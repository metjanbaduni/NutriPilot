jest.mock('sinon', () => require('sinon/lib/sinon'));

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('../../amplify/backend/function/getProfile/src/index');

const ddbMock = mockClient(DynamoDBDocumentClient);

function createAuthorizedEvent() {
  return {
    requestContext: {
      authorizer: {
        claims: {
          sub: 'user-123',
        },
      },
    },
  };
}

describe('getProfile lambda', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TABLE_NAME: 'NutriPilot-dev',
      AWS_REGION: 'us-east-1',
    };
    ddbMock.reset();
    delete global.__dynamoDocClient;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns 401 when auth context is missing', async () => {
    // Arrange
    const event = {};

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);

    // Assert
    expect(response.statusCode).toBe(401);
    expect(parsedBody).toEqual({
      success: false,
      message: 'Unauthorized',
    });
    expect(ddbMock.calls()).toHaveLength(0);
  });

  test('returns profile and targets DTO on success', async () => {
    // Arrange
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [
          {
            PK: 'USER#user-123',
            SK: 'PROFILE',
            GSI1PK: 'EMAIL#user@example.com',
            GSI1SK: 'PROFILE',
            email: 'user@example.com',
            bodyWeightKg: 78,
            heightCm: 183,
            ageYears: 34,
            gender: 'male',
            activityLevel: 'moderate',
            goal: 'bulk',
            createdAt: 1600000000000,
            updatedAt: 1700000000000,
          },
        ],
      })
      .resolvesOnce({
        Items: [
          {
            PK: 'USER#user-123',
            SK: 'TARGETS',
            proteinGrams: 187,
            carbGrams: 374,
            fatGrams: 99,
            calories: 3135,
            tdee: 2726,
            calculatedAt: 1700000000000,
          },
        ],
      });

    const event = createAuthorizedEvent();

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);
    const queryCalls = ddbMock.commandCalls(QueryCommand);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(parsedBody).toEqual({
      success: true,
      profile: {
        email: 'user@example.com',
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
        createdAt: 1600000000000,
        updatedAt: 1700000000000,
      },
      targets: {
        proteinGrams: 187,
        carbGrams: 374,
        fatGrams: 99,
        calories: 3135,
        tdee: 2726,
        calculatedAt: 1700000000000,
      },
    });

    expect(queryCalls).toHaveLength(2);
    expect(queryCalls[0].args[0].input.ExpressionAttributeValues).toEqual({
      ':pk': 'USER#user-123',
      ':sk': 'PROFILE',
    });
    expect(queryCalls[1].args[0].input.ExpressionAttributeValues).toEqual({
      ':pk': 'USER#user-123',
      ':sk': 'TARGETS',
    });
  });

  test('returns null profile and targets when user records are missing', async () => {
    // Arrange
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    const event = createAuthorizedEvent();

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(parsedBody).toEqual({
      success: true,
      profile: null,
      targets: null,
    });
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(2);
  });
});
