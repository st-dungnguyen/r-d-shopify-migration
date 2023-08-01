# Welcome to the CDK TypeScript project

This is a boilerplate project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Prerequisites
### 1.1 Installing AWS CLI
The AWS CLI allows you to interact with AWS services from a terminal session. Make sure you have the latest version of the AWS CLI installed on your system.

- Linux, macOS or Unix: [Bundled installer](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#install-bundle-other)

### 1.2 Setting up AWS account profile for each environment
Edit your aws profile `~/.aws/config` to match project's account profile name

```
[profile <project-name>-dev]
role_arn = arn:aws:iam::<dev_account_id>:role/<your-role>
source_profile = default
[profile <project-name>-stg]
role_arn = arn:aws:iam::<stg_account_id>:role/<your-role>
source_profile = default
[profile <project-name>-prd]
role_arn = arn:aws:iam::<prd_account_id>:role/<your-role>
source_profile = default
```

Following this [guidelines](https://docs.google.com/spreadsheets/d/16FDq-XLqbkw3jB_1xkE_ww1URsq8b0B0j97cNQMJUxg/edit#gid=0) to switch role via AWS CLI

### 1.3 Setting up Node.js
The AWS CDK uses Node.js (>= 10.13.0, except for versions 13.0.0 - 13.6.0). A version in active long-term support (14.x at this writing) is recommended.
To install Node.js visit the [node.js](https://nodejs.org/en/download/) website.
Or you can install via NVM

```bash
$ nvm install v18.15.0
$ nvm use v18.15.0
```

### 1.4 Setting up AWS CDK Toolkit
Open a terminal session and run the following command:

```bash
npm install
npm install -g aws-cdk
```

You can check the toolkit version:

```bash
cdk --version
2.66.1 (build 539d036)
```

---

## Development Guidelines
### 1. Infrastructure

<img width="619" alt="Screen Shot 2023-03-26 at 8 21 53 PM" src="https://user-images.githubusercontent.com/62642499/227778476-e921198f-a2f1-4fca-a90a-7b08dc04265a.png">

```
├── infrastructure
│   ├── bin
│   │   ├── app.ts // Initialize Stacks
│   │   ├── development.ts // Initialize Stack for local
│   ├── lib
│   │   ├── aws-resources
│   │   │   ├── apigateway
│   │   │   │   ├── resources/index.ts // Initialize API Gateway Resources
│   │   │   │   ├── *.ts // Define API Gateway Constructor, Utilities and Helper
│   │   │   ├── dynamodb
│   │   │   │   ├── *.ts // Define Dynamodb Constructor and Utilities
│   │   │   ├── lambda
│   │   │   │   ├── functions/*.ts // Define Lambda Functions
│   │   │   │   ├── index.ts // Rollup Lambda Functions
│   │   │   │   ├── *.ts // Define Lambda Constructor, Utilities and Helper
│   │   │   ├── policy-statement
│   │   │   │   ├── index.ts // Define custom policy statements
│   │   │   ├── ssm
│   │   │   │   ├── *.ts // Define SSM Parameters Store Utilities
│   │   ├── api-stack.ts // Initialize API Resources and Integrations
│   │   ├── dynamodb-stack.ts // Initialize DynamoDB Tables and Global Secondary Indexes
│   │   ├── base-stack.ts // Initialize API Gateway and API Authorizer Function
│   │   ├── lambda-stack.ts // Initialize Lambda Functions
│   │   ├── index.ts // Rollup Stacks
```

### 2. App Structure

```
├── src
│   ├── controllers
│   │   ├── **/*.ts // Handler functions
│   ├── entities
│   │   ├── **/*.ts // Models
│   ├── repositories
│   │   ├── **/*.ts // Database access objects
│   ├── services
│   │   ├── **/*.ts // Logically functions
│   ├── tasks
│   │   ├── **/*.ts // Locally functions such as migration task.
│   ├── validations
│   │   ├── **/*.ts // Validation functions
├── test
│   ├── **/*.ts // Unittest
```

### 3. Dependencies

```ts
{
  "dependencies": {
    // AWS CDK Dependencies (Required)
    "aws-cdk-lib": "^2.69.0",
    "aws-sdk": "^2.1333.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21",

    // Object Schema Validation (You can use other dependencies such as Yup)
    "ajv": "^8.12.0",
    "ajv-errors": "^3.0.0",
    "ajv-formats": "^2.1.1",

    // Authentication Dependencies (This is for Login & Verify Token features)
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",

    // Random unique string - Used to generate ID for object
    "uuid": "^9.0.0"
  }
}
```

### 4. Starting API locally with AWS SAM CLI
#### 4.1 Install Docker
The Docker allows you to running your application locally.

- Get Docker: [Installing](https://docs.docker.com/get-docker/)

```bash
$ docker network create -d bridge sam-cli # one-time-only
$ docker-compose up -d
```

#### 4.2 Validate DynamoDB connection local
Run the below command in the local terminal to make sure the port is correct as per your docker-compose you have defined above.

```bash
$ aws dynamodb list-tables --endpoint-url http://localhost:8000
```

You may get some results like the below.

```json
{
  "TableNames": []
}
```

#### 4.3 Creating local tables
You have to describe your table as json file and save it in `dynamodb` folder.
Run the below command to create new table.

```bash
$ aws dynamodb create-table --cli-input-json file://db/dynamodb/<table-name>.json --endpoint-url http://localhost:8000
```

#### 4.5 Start API
AWS SAM CLI requires a template file to init calls.
Run the below command to generating template files.

```bash
$ bash template.sh
```

#### 4.6 Starting APIs

```bash
$ sam local start-api -t template.yaml --debug --docker-network sam-cli --warm-containers EAGER
```

You may get some results like belows.

```
2023-03-27 15:40:43,529 | 10 APIs found in the template
2023-03-27 15:40:43,532 | Mounting None at http://127.0.0.1:3000/ [OPTIONS]
2023-03-27 15:40:43,532 | Mounting None at http://127.0.0.1:3000/products [OPTIONS]
2023-03-27 15:40:43,532 | Mounting localProductIndexFunction at http://127.0.0.1:3000/products [GET, OPTIONS]
2023-03-27 15:40:43,532 | Mounting localProductCreateFunction at http://127.0.0.1:3000/products [POST, OPTIONS]
2023-03-27 15:40:43,532 | Mounting None at http://127.0.0.1:3000/products/{id} [OPTIONS]
2023-03-27 15:40:43,532 | Mounting localProductShowFunction at http://127.0.0.1:3000/products/{id} [GET, OPTIONS]
2023-03-27 15:40:43,532 | Mounting localProductUpdateFunction at http://127.0.0.1:3000/products/{id} [PUT, OPTIONS]
2023-03-27 15:40:43,532 | Mounting localProductDeleteFunction at http://127.0.0.1:3000/products/{id} [DELETE, OPTIONS]
2023-03-27 15:40:43,532 | Mounting None at http://127.0.0.1:3000/login [OPTIONS]
2023-03-27 15:40:43,532 | Mounting localLoginFunction at http://127.0.0.1:3000/login [POST, OPTIONS]
```

### 5. Implementation
#### 5.1 Creating a new AWS DynamoDB

```
├── db
│   ├── dynamodb
│   │   ├── *.table.ts // Table Definitions
│   │   ├── *.table.json // Table Definitions For Docker DynamoDB
│   │   ├── tables.ts // Table Name Definitions
│   │   ├── index.ts // Rollup Table Definitions
```

1. Creating a new `BaseTableDefinition` to file `db/dynamodb/<table-name>.table.ts` and exporting it

```typescript
export const productsTable = new BaseTableDefinition({
  name: PRODUCTS_TABLE_NAME, // Table Name
  partitionKey: { // Partition Key
    name: 'id',
    type: AttributeType.STRING,
  },
  pointInTimeRecovery: true,
  indexes: [ // Global Secondary Indexes
    {
      partitionKey: {
        name: 'name',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    },
  ],
});
```

2. Rollup exports in `db/dynamodb/index.ts`

```typescript
export const dynamodbTables = [productsTable];
```

3. Creating AWS DynamoDB Tables
In file `lib/dynamodb-stack.ts`, using `DynamodbConstruct` object to create tables

```typescript
export class DynamodbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbConstruct = new DynamodbConstruct(scope, `${appConfig.env}DynamodbConstruct`);
    dbConstruct.createTables(this, dynamodbTables);
  }
}
```

#### 5.2 Creating new AWS Lambda Function

```
├── lib
│   ├── lambda
│   │   ├── functions
│   │   │   ├── *.ts // LambdaFunction Definitions
│   │   ├── index.ts
│   ├── lambda-stack.ts
```

1. Creating a new `LambdaFunction` to file `lib/aws-resources/lambda/functions/<your-function>/*.ts`

```typescript
// Example:
export const productIndexFunction = new LambdaFunction({
  functionName: 'ProductIndex',
  entry: 'products/index.ts',
  timeout: 30, // seconds
  memorySize: 128, // MegaByte
  runtime: Runtime.NODEJS_18_X,
  environment: {},
  ssm: 'ProductIndex',
  method: 'GET', // HTTP methods: GET, POST, PUT, DELETE
  dynamoDbTables: {
    [PRODUCTS_TABLE_NAME]: [DynamodbPermission.READ, DynamodbPermission.INDEX],
  },
});
```

2. Rollup exports in `lib/aws-resources/lambda/index.ts`

```typescript
export const lambdaFunctions = [
  productIndexFunction,
];
```

3. Creating AWS Lambda Function
In file `lib/lambda-stack.ts`, using `LambdaConstruct` object to create lambda functions

```typescript
export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const lambdaConstruct = new LambdaConstruct(this, `${appConfig.env}LambdaConstruct`);
    lambdaConstruct.createLambdaFunctions(this, lambdaFunctions);
  }
}
```

#### 5.3 API Authorizer Function
This is a special function used to authorize access token. It's often used for Login feature.
If your application don't need it. You can disable it.

In `config/index.ts`, change `apiAuthorizer` to true or false to enable or disable Api Authorizer.

### Useful commands

- `npm install` installs a package and any packages that it depends on
- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

### Limitation
Some AWS Services that does not support to execute locally:
- AWS SQS
- AWS SNS
- AWS SES
- AWS API Gateway Authorizer

---

## Deployment Guidelines
### 1. Setting up and deploying CDK on Local
#### 1.1 Initialling & Bootstrapping

```bash
# You have to export all environment variables before deploying
$ export AWS_PROFILE=<project-name>-<env>
$ export ENVIRONMENT=<env>
$ export JWT_TOKEN=<your-jwt-token-by-env>
$ cdk bootstrap --all
```

#### 1.2 Deploying all stacks

```bash
$ export AWS_PROFILE=<project-name>-<env>
$ export ENVIRONMENT=<env>
$ export JWT_TOKEN=<your-jwt-token-by-env>
$ cdk deploy --all
```

#### 1.3 Deploying specific stacks

```bash
$ export AWS_PROFILE=<project-name>-<env>
$ export ENVIRONMENT=<env>
$ export JWT_TOKEN=<your-jwt-token-by-env>
$ cdk deploy {Stack-ID}
# You can deploy multiple stacks by adding whitespace between stacks
# $ cdk deploy {Stack-ID} {Stack2-ID}
```

### 2. Setting up and deploying by Github Workflow
#### 2.1 Adding IAM Identity Provider
1. Open this URL: [Add an Identity Provider](https://us-east-1.console.aws.amazon.com/iamv2/home?region=ap-northeast-1#/identity_providers/create)
2. Click `Add provider`
3. Provider type: Choose `OpenID Connect`
4. Provider URL: Enter `https://token.actions.githubusercontent.com`
5. Click `Get thumbprint`
6. Audience: Enter `sts.amazonaws.com`
7. Click `Add provider`

#### 2.2 Creating IAM Policy for BE Github Action deploy role
1. Open this URL: [IAM/Policies](https://us-east-1.console.aws.amazon.com/iamv2/home#/policies)
2. Click `Create policy`
3. Click `JSON` tab
4. Copy and parse the following policy with corresponding environment

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": [
        "arn:aws:iam::<aws-account-id>:role/cdk-hnb659fds-deploy-role-<aws-account-id>-ap-northeast-1",
        "arn:aws:iam::<aws-account-id>:role/cdk-hnb659fds-file-publishing-role-<aws-account-id>-ap-northeast-1",
        "arn:aws:iam::<aws-account-id>:role/cdk-hnb659fds-image-publishing-role-<aws-account-id>-ap-northeast-1",
        "arn:aws:iam::<aws-account-id>:role/cdk-hnb659fds-lookup-role-<aws-account-id>-ap-northeast-1"
      ]
    }
  ]
}
```

5. Policy name: `<project-name>-<env>-github-action-policy`

#### 2.3 Creating IAM Role for BE Github Action role
1. Open this URL: [IAM/Roles](https://us-east-1.console.aws.amazon.com/iamv2/home?region=ap-northeast-1#/roles)
2. Click `Create role`
3. Trusted entity type: Choose `Custom trust policy`
4. In the `Custom trust policy` policy editor box, enter:
   ​
   **_Replace `<aws-account-id>, <organization>/<repository>` with corresponding values for each environment._**
   ​

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<aws-account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<organization>/<repository>:*"
        }
      }
    }
  ]
}
```

5. Click `Next`
6. In the `Add permissions` section, select `<project-name>-<env>-github-action-policy` policy.
7. Click `Next`
8. In the `Name, review, and create` section
   Role name: Enter `<project-name>-<env>-github-action-role`
9. Click `Create role`

#### 2.4 Adding Github Action role's ARN to cdk-deploy.yml
You need to configure your credentials and environment variables to the workflow at `.github/workflows/cdk-deploy.yml.

```yml
name: CDK Deploy
on:
  push:
    branches: # You can change to `tags` to deploy by tags
      - 'main' # You can specify the branch or tags that will execute jobs belows after pushing it to your github repository.

permissions:
  id-token: write
  contents: read
  actions: read

env: # Define your environment variables here
  ENVIRONMENT: dev # You also can get your secrets from Github Action Secrets. Ex: ${{ secrets.ENVIRONMENT }}
  JWT_TOKEN: dummy

jobs:
  deploy:
    # runs-on: ['self-hosted', 'linux', 'x64'] # This is ST hosted server.
    runs-on: ubuntu-latest # This is provided by Github. You have 2000 minutes free.
    steps:
      - uses: actions/checkout@v2

      - uses: actions/setup-node@v2
        with:
          node-version: 16

      - name: Npm install
        run: |
          npm i -g npm
          npm ci

      - name: ITG Build Code
        run: |
          npm run build

      - uses: aws-actions/configure-aws-credentials@v1
        with:
          role-to-assume: arn:aws:iam::632145475845:role/be-deploy-role # Change to your
          role-session-name: deploy-role-session
          aws-region: ap-northeast-1

      - run: aws sts get-caller-identity

      - run: npm run cdk:deploy
```

### 3. Applying new changes to your deployment stage
After finish deploying, your changes may not be reflected automatically.
You have to deploy api to your API Stage manually on the API Gateway web console.

<img width="764" alt="Screen Shot 2023-03-26 at 7 58 53 PM" src="https://user-images.githubusercontent.com/62642499/227777391-f7b4edc1-9df3-4956-a399-ad51eed42727.png">

Choosing your deployment stage and then click `Deploy`.

<img width="537" alt="Screen Shot 2023-03-26 at 8 02 23 PM" src="https://user-images.githubusercontent.com/62642499/227777473-19ca2479-07f8-48a2-86aa-9e9d87c9dbc2.png">
