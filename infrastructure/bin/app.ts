#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { appConfig } from '../../config';
import { ApigatewayStack, BaseStack, LambdaStack } from '../lib';

const app = new cdk.App();
// Note: Stacks will be executed in A-Z order of stack id
new BaseStack(app, 'B-BaseStack', {
  env: {
    account: appConfig.profile.accountId,
    region: appConfig.profile.region,
  },
});

new LambdaStack(app, 'C-LambdaStack', {
  env: {
    account: appConfig.profile.accountId,
    region: appConfig.profile.region,
  },
});

new ApigatewayStack(app, 'D-ApigatewayStack', {
  env: {
    account: appConfig.profile.accountId,
    region: appConfig.profile.region,
  },
});
