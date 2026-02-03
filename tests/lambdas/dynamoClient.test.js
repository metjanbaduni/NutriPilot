const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation((config) => ({ __config: config })),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn((client, options) => ({ client, options })),
  },
}));

const {
  getAwsRegion,
  getTableName,
  getDynamoDocClient,
} = require('../../amplify/backend/function/lib/dynamoClient');

describe('dynamoClient helpers', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete global.__dynamoDocClient;
    DynamoDBClient.mockClear();
    DynamoDBDocumentClient.from.mockClear();
  });

  test('getAwsRegion prefers AWS_REGION when set', () => {
    // Arrange
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_DEFAULT_REGION = 'us-east-2';

    // Act
    const result = getAwsRegion();

    // Assert
    expect(result).toBe('us-west-2');
  });

  test('getAwsRegion falls back to AWS_DEFAULT_REGION', () => {
    // Arrange
    delete process.env.AWS_REGION;
    process.env.AWS_DEFAULT_REGION = 'eu-central-1';

    // Act
    const result = getAwsRegion();

    // Assert
    expect(result).toBe('eu-central-1');
  });

  test('getAwsRegion uses default when no env is set', () => {
    // Arrange
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;

    // Act
    const result = getAwsRegion();

    // Assert
    expect(result).toBe('us-east-1');
  });

  test('getTableName returns NUTRIPILOT_TABLE_NAME when set', () => {
    // Arrange
    process.env.NUTRIPILOT_TABLE_NAME = 'NutriPilot-dev';
    process.env.TABLE_NAME = 'Fallback';

    // Act
    const result = getTableName();

    // Assert
    expect(result).toBe('NutriPilot-dev');
  });

  test('getTableName falls back to TABLE_NAME', () => {
    // Arrange
    delete process.env.NUTRIPILOT_TABLE_NAME;
    process.env.TABLE_NAME = 'NutriPilot-prod';

    // Act
    const result = getTableName();

    // Assert
    expect(result).toBe('NutriPilot-prod');
  });

  test('getTableName throws when no table name is set', () => {
    // Arrange
    delete process.env.NUTRIPILOT_TABLE_NAME;
    delete process.env.TABLE_NAME;

    // Act
    const action = () => getTableName();

    // Assert
    expect(action).toThrow('DynamoDB table name is required');
  });

  test('getDynamoDocClient returns a singleton client', () => {
    // Arrange
    process.env.AWS_REGION = 'us-west-2';

    // Act
    const first = getDynamoDocClient();
    const second = getDynamoDocClient();

    // Assert
    expect(first).toBe(second);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
  });

  test('getDynamoDocClient uses resolved region', () => {
    // Arrange
    process.env.AWS_REGION = 'ap-southeast-1';

    // Act
    getDynamoDocClient();

    // Assert
    expect(DynamoDBClient).toHaveBeenCalledWith({ region: 'ap-southeast-1' });
  });
});
