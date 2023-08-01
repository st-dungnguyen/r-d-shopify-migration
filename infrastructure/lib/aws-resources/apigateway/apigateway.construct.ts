import { Duration } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  EndpointType,
  IRestApi,
  LambdaIntegration,
  LogGroupLogDestination,
  PassthroughBehavior,
  RestApi,
  TokenAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { appConfig } from '../../../../config';
import { getDynamodbTables } from '../dynamodb';
import { LambdaFunction, authorizeFunction } from '../lambda';
import { DynamodbPermission } from '../lambda/lambda.helpers';
import { getParameter, putParameter } from '../ssm/ssm.utils';
import { getMethodOptionsNoAuth, getMethodOptionsWithAuth } from './apigateway.utils';
import { ApigatewayResource } from './awigateway.helpers';

export class ApigatewayConstruct extends Construct {
  ssmParams: { [key: string]: string };
  restApi: IRestApi;
  authorizer: TokenAuthorizer;

  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  createApiGateway(scope: Construct) {
    this.restApi = new RestApi(scope, appConfig.apiGateway.name, {
      restApiName: appConfig.apiGateway.name,
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(
          new LogGroup(this, `${appConfig.apiGateway.name}LogGroup`, {})
        ),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
        allowCredentials: true,
        statusCode: 200,
      },
      deploy: true,
    });

    // Save API Gateway Ids to SSM Parameters Store
    if (appConfig.env !== 'local') {
      putParameter(this, appConfig.ssm.restApiId, this.restApi.restApiId);
      putParameter(this, appConfig.ssm.rootResourceId, this.restApi.restApiRootResourceId);
    }
  }

  createAuthenticationLambda(scope: Construct) {
    if (appConfig.apiAuthorizer) {
      const dynamodbTables = getDynamodbTables(scope);
      const func = new NodejsFunction(this, authorizeFunction.functionName, {
        entry: authorizeFunction.entry,
        handler: authorizeFunction.handler,
        functionName: authorizeFunction.functionName,
        runtime: authorizeFunction.runtime,
        timeout: Duration.seconds(authorizeFunction.timeout || 30),
        memorySize: authorizeFunction.memorySize,
        environment: {
          ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
          REST_API_ID: this.restApi.restApiId,
          JWT_TOKEN: process.env.JWT_TOKEN || '',
        },
        bundling: {
          target: 'es2020',
          sourceMap: true,
          sourceMapMode: SourceMapMode.INLINE,
          minify: false,
        },
      });
      if (appConfig.env !== 'local') {
        putParameter(this, authorizeFunction.ssm!, func.functionArn);
      }
      if (authorizeFunction.dynamodbTables) {
        Object.keys(dynamodbTables).map((tableName: string) => {
          const permissions = authorizeFunction.dynamodbTables![tableName] || [];
          permissions.map((permission: DynamodbPermission) => {
            if (permission === DynamodbPermission.READ_WRITE) {
              dynamodbTables[tableName]?.table?.grantReadWriteData(func);
            }
            if (permission === DynamodbPermission.READ) {
              dynamodbTables[tableName]?.table?.grantReadData(func);
            }
            if (permission === DynamodbPermission.INDEX) {
              if (dynamodbTables[tableName]?.policy) {
                func.addToRolePolicy(dynamodbTables[tableName]?.policy);
              }
            }
            if (permission === DynamodbPermission.WRITE) {
              dynamodbTables[tableName]?.table?.grantWriteData(func);
            }
            if (permission === DynamodbPermission.FULL) {
              dynamodbTables[tableName]?.table?.grantFullAccess(func);
            }
          });
        });
      }

      // Adding custom policies
      authorizeFunction.customPolicies?.map((policy: PolicyStatement) => {
        func.addToRolePolicy(policy);
      });
    }
  }

  loadParameters(scope: Construct) {
    this.ssmParams = {
      restApiId: getParameter(scope, appConfig.ssm.restApiId),
      rootResourceId: getParameter(scope, appConfig.ssm.rootResourceId),
    };
  }

  loadApiGateway(scope: Construct, restApiId: string, rootResourceId: string) {
    this.restApi = RestApi.fromRestApiAttributes(scope, appConfig.apiGateway.name, {
      restApiId,
      rootResourceId,
    });
  }

  createApiAuthorizer(scope: Construct) {
    if (appConfig.apiAuthorizer) {
      // Create Lambda Function
      const func = NodejsFunction.fromFunctionAttributes(scope, authorizeFunction.functionName, {
        functionArn: getParameter(scope, authorizeFunction.ssm!),
        sameEnvironment: true,
      });

      // Create IAM Policy
      const assumePolicy = new Policy(scope, `${appConfig.env}ApiAssumeRolePolicy`);

      // Add PolicyStatement to IAM Policy
      assumePolicy.addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: ['*'],
        })
      );

      // Create IAM Role
      const iamRole = new Role(scope, `${appConfig.env}ApiAuthorizerIamRole`, {
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      });

      // Add IAM Policy to IAM Role
      iamRole.attachInlinePolicy(assumePolicy);
      func.grantInvoke(iamRole);

      this.authorizer = new TokenAuthorizer(scope, `${appConfig.env}JwtAuthorizer`, {
        handler: func,
        assumeRole: iamRole,
        identitySource: 'method.request.header.Authorization',
        validationRegex: '^(Bearer )[a-zA-Z0-9-_]+?.[a-zA-Z0-9-_]+?.([a-zA-Z0-9-_]+)$',
        resultsCacheTtl: Duration.minutes(1),
      });
    }
  }

  createIntegration(handler: IFunction) {
    return new LambdaIntegration(handler, {
      proxy: false,
      requestTemplates: {
        'application/json': `
            {
              "id": "$context.authorizer.id",
              "method": "$context.httpMethod",
              "body" : $input.json('$'),
              "rawBody" : "$util.escapeJavaScript($input.body).replace("\\'", "'")",
              "headers": {
                #foreach($param in $input.params().header.keySet())
                "$param": "$util.escapeJavaScript($input.params().header.get($param))"
                #if($foreach.hasNext),#end
                #end
              },
              "pathParameters": {
                #foreach($param in $input.params().path.keySet())
                "$param": "$util.escapeJavaScript($input.params().path.get($param))"
                #if($foreach.hasNext),#end
                #end
              },
              "queryStringParameters": {
                #foreach($param in $input.params().querystring.keySet())
                "$param": "$util.escapeJavaScript($input.params().querystring.get($param))"
                #if($foreach.hasNext),#end
                #end
              },
              "multiValueQueryStringParameters": {
                #foreach($key in $method.request.multivaluequerystring.keySet())
                "$key" : [
                  #foreach($val in $method.request.multivaluequerystring.get($key))
                  "$val"#if($foreach.hasNext),#end
                  #end
                  ]#if($foreach.hasNext),#end
                #end
              }
            }
          `,
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': `#set($inputRoot = $input.path('$'))
              $inputRoot.body
              #if($inputRoot.statusCode)
              #set($context.responseOverride.status = $inputRoot.statusCode)
              #end`,
          },
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': `'*'`,
            'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST,GET,PUT,DELETE'",
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization'",
            'method.response.header.Cache-Control': "'no-store, no-cache, must-revalidate'",
            'method.response.header.X-Frame-Options': "'SAMEORIGIN'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
      allowTestInvoke: false,
    });
  }

  createApiResources(scope: Construct, resources: ApigatewayResource[], funcs?: { [key: string]: NodejsFunction }) {
    resources.map((apiResource: ApigatewayResource) => {
      const resource = this.restApi.root.resourceForPath(apiResource.path);
      if (appConfig.env !== 'local') {
        resource.addCorsPreflight({
          allowOrigins: apiResource.allowOrigin!,
          allowHeaders: apiResource.allowHeaders!,
          allowMethods: apiResource.allowMethods!,
          allowCredentials: true,
          statusCode: 200,
        });
      }
      if (apiResource.funcs?.length) {
        apiResource.funcs.map((func: LambdaFunction) => {
          let lambda: IFunction | undefined = undefined;
          if (func.ssm) {
            if (funcs && appConfig.env === 'local') {
              lambda = funcs[func.ssm];
            } else {
              lambda = NodejsFunction.fromFunctionAttributes(scope, func.ssm, {
                functionArn: getParameter(scope, func.ssm),
                sameEnvironment: true,
              });
            }
            const integration = this.createIntegration(lambda);

            const isAuthorizer = func.auth && appConfig.apiAuthorizer;
            resource.addMethod(
              func.apiResourceMethod!,
              integration,
              isAuthorizer ? getMethodOptionsWithAuth(this.authorizer) : getMethodOptionsNoAuth()
            );
          }
        });
      }
    });
  }
}
