import * as cdk from '@aws-cdk/core';
import * as ssm from "@aws-cdk/aws-ssm";


export class CdkssmStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const SSM_PARAM_NAME = '/blog/database/table/name'

    // https://docs.aws.amazon.com/ja_jp/cdk/latest/guide/get_ssm_value.html

    // > Returns a token that will resolve (during deployment) to the string value of an SSM string parameter.
    // deployment time
    // cdk.context.json はつくられない
    // ssm paramの値をかえて、cdk deployすれば、デプロイされてoutputの値も変わる
    // ssm paramの名前をかえて、cdk deployすれば、もしその名前のパラメータがなければchange set作成の段階でエラーとなる
    // ssm paramの名前をかえて、cdk deployすれば、デプロイされてoutputの値も変わる
    const v1 = ssm.StringParameter.valueForStringParameter(this, SSM_PARAM_NAME)

    new cdk.CfnOutput(this, 'out-v1', {value: v1})

    // > Imports an external string parameter by name.
    // cdk.context.json はつくられない
    // ssm paramの値をかえて、cdk deployすれば、デプロイされてoutputの値も変わる
    // ssm paramの名前をかえて、cdk deployすれば、もしその名前のパラメータがなければchangesetがno changeとなりデプロイされない（既存のデプロイの内容がそのままとなる）
    // ssm paramの名前をかえて、cdk deployすれば、changesetがno changeとなりデプロイされない（既存のデプロイの内容がそのままとなる）
    const v2 = ssm.StringParameter.fromStringParameterName(this, 'param', 
    	SSM_PARAM_NAME).stringValue

    new cdk.CfnOutput(this, 'out-v2', {value: v2})

    // > Reads the value of an SSM parameter during synthesis through an environmental context provider.
    // cdk.context.json がつくられる
    // [AWSのドキュメント](https://docs.aws.amazon.com/cdk/latest/guide/context.html)
    // によればcdk.context.jsonはCDKが得た値のキャッシュを残すところ
    // バージョンコントロールに含めることが推奨されている
    // ssm paramの値をかえて、cdk deployすれば、changesetがno changeとなりデプロイされない（既存のデプロイの内容がそのままとなる）
    // cdk.context.jsonを削除してssm paramの値をかえて、cdk deployすればデプロイされてoutputの値も変わる
    // ssm paramの名前をかえて、cdk deployすれば、もしその名前のパラメータがなければエラーとなる
    // ssm paramの名前をかえて、cdk deployすれば、デプロイされてoutputの値も変わる
    const v3 = ssm.StringParameter.valueFromLookup(this, SSM_PARAM_NAME)

	new cdk.CfnOutput(this, 'out-v3', {value: v3})
    
  }
}
