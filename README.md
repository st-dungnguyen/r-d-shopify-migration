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
### 1. Starting API locally with AWS SAM CLI
#### 1.1 Create AWS SAM template
AWS SAM CLI requires a template file to init calls.
Run the below command to generating template files.

```bash
$ bash template.sh
```

#### 1.2 Starting APIs

```bash
$ sam local start-api -t template.yaml --debug --warm-containers EAGER
```

### Useful commands

- `npm install` installs a package and any packages that it depends on
- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
