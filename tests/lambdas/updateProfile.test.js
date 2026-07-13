jest.mock('sinon', () => require('sinon/lib/sinon'));

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('../../amplify/backend/function/updateProfile/src/index');

const ddbMock = mockClient(DynamoDBDocumentClient);

function createAuthorizedEvent(body) {
  return {
    requestContext: {
      authorizer: {
        claims: {
          sub: 'user-123',
          email: 'user@example.com',
        },
      },
    },
    body: JSON.stringify(body),
  };
}

describe('updateProfile lambda', () => {
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
    const event = {
      body: JSON.stringify({
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      }),
    };

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

  test('returns 400 for out-of-range input', async () => {
    // Arrange
    const event = createAuthorizedEvent({
      bodyWeightKg: 39,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    });

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(parsedBody).toEqual({
      success: false,
      message: 'bodyWeightKg must be between 40 and 200',
    });
    expect(ddbMock.calls()).toHaveLength(0);
  });

  test('writes PROFILE and TARGETS and returns DTO on success', async () => {
    // Arrange
    const fixedTimestamp = 1700000000000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

    ddbMock.on(GetCommand).resolves({
      Item: {
        PK: 'USER#user-123',
        SK: 'PROFILE',
        email: 'existing@example.com',
        createdAt: 1600000000000,
      },
    });
    ddbMock.on(PutCommand).resolves({});

    const requestBody = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };
    const event = createAuthorizedEvent(requestBody);

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);
    const putCalls = ddbMock.commandCalls(PutCommand);
    const putItems = putCalls.map((call) => call.args[0].input.Item);
    const profileItem = putItems.find((item) => item.SK === 'PROFILE');
    const targetsItem = putItems.find((item) => item.SK === 'TARGETS');

    // Assert
    expect(response.statusCode).toBe(200);
    expect(parsedBody.success).toBe(true);
    expect(parsedBody.profile).toEqual({
      email: 'existing@example.com',
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
      createdAt: 1600000000000,
      updatedAt: fixedTimestamp,
    });
    expect(parsedBody.targets).toEqual({
      proteinGrams: 187,
      carbGrams: 374,
      fatGrams: 99,
      calories: 3135,
      tdee: 2726,
      calculatedAt: fixedTimestamp,
    });

    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(1);
    expect(putCalls).toHaveLength(2);
    expect(profileItem).toMatchObject({
      PK: 'USER#user-123',
      SK: 'PROFILE',
      email: 'existing@example.com',
      GSI1PK: 'EMAIL#existing@example.com',
      GSI1SK: 'PROFILE',
      createdAt: 1600000000000,
      updatedAt: fixedTimestamp,
    });
    expect(targetsItem).toMatchObject({
      PK: 'USER#user-123',
      SK: 'TARGETS',
      proteinGrams: 187,
      carbGrams: 374,
      fatGrams: 99,
      calories: 3135,
      tdee: 2726,
      calculatedAt: fixedTimestamp,
    });
  });
});
