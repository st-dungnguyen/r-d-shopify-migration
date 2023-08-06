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
  }
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
  shopify: {
    storeName: string;
    accessToken: string;
  };
}

export const getConfig = (env: string | undefined = process.env.ENVIRONMENT) => {
  if (!env) {
    throw new Error('Missing environment variables. Please pass in "ENVIRONMENT={env} your_command".');
  }

  const appConfig: AppConfig = {
    ...configsByEnv[env],
    env,
    apiGateway: {
      name: `${env}RestApiExample`,
    },
    apiAuthorizer: false,
    ssm: {
      restApiId: `${env}RestApiId`,
      rootResourceId: `${env}RootResourceId`,
    },
    shopify: {
      storeName: 'db-migration-s2',
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    },
  };

  return appConfig;
};

export const appConfig = getConfig(process.env.ENVIRONMENT);
