#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkssmStack } from '../lib/cdkssm-stack';

const app = new cdk.App();
new CdkssmStack(app, 'CdkssmStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
