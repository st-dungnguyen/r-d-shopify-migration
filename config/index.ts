const configsByEnv: any = {
  local: {
    profile: {
      accountId: '632145475845',
      region: 'ap-southeast-1',
    },
  },
  dev: {
    profile: {
      accountId: '632145475845',
      region: 'ap-southeast-1',
    },
  },
  stg: {
    profile: {
      accountId: '632145475845',
      region: 'ap-southeast-1',
    },
  },
  prd: {
    profile: {
      accountId: '632145475845',
      region: 'ap-southeast-1',
    },
  },
};

export interface AppConfig {
  env: string;
  profile: { accountId: string; region: string };
  apiGateway: { name: string };
  apiAuthorizer: boolean;
  ssm: {
    restApiId: string;
    rootResourceId: string;
  };
  dynamodb: {
    apiVersion: string;
    region: string;
    endpoint: string;
  };
  jwtSecretKey: string;
}

export const getConfig = (env: string | undefined = process.env.ENVIRONMENT) => {
  if (!env) {
    throw new Error('Missing environment variables. Please pass in "ENVIRONMENT={env} your_command".');
  }

  const region = configsByEnv[env].profile.region;
  const appConfig: AppConfig = {
    ...configsByEnv[env],
    env,
    apiGateway: {
      name: `${env}RestApiExample`,
    },
    apiAuthorizer: true,
    ssm: {
      restApiId: `${env}RestApiId`,
      rootResourceId: `${env}RootResourceId`,
    },
    dynamodb: {
      apiVersion: '2012-08-10',
      region,
      endpoint: env === 'local' ? 'http://host.docker.internal:8000' : `http://dynamodb.${region}.amazonaws.com`,
    },
    jwtSecretKey: process.env.JWT_TOKEN || '',
  };

  return appConfig;
};

export const appConfig = getConfig(process.env.ENVIRONMENT);
