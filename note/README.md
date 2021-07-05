+++
title = "Systems Managerパラメータストアの参照方法"
date = "2021-04-06"
tags = ["Systems Manager"]
+++

CDKからSystems Managerのパラメーターストアを参照する方法はいくつかあるのでそれを比較をした。

[AWSのドキュメント](https://docs.aws.amazon.com/ja_jp/cdk/latest/guide/get_ssm_value.html)に書かれているように、パラメータを得るのがデプロイ時なのかCloudFormationテンプレートが作られる時なのかなどの違いが利用する[StringParameterのMethod](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ssm.StringParameter.html)によって発生する。

今のところ4つ関数がある。

* valueFromLookup
* valueForStringParameter
* fromStringParameterName
* fromStringParameterAttributes

がこのうちfromStringParameterAttributesは今回はバージョンを指定しないので比較する対象から外した。（そもそも比較するといっても大したことをしているわけではないですが。）

今回使った[CDKのコード](https://github.com/suzukiken/cdkssm)

これは値をSSMから取り込んで`CfnOutput`するだけというスタックになっている。（こんなスタックを作ることは常識的にないと思うのであまり良いサンプルではなかったと今は思っています。）

どの関数を使っても最初の`cdk deploy`でデプロイ時のOutput内容は変わらない。ところがパラメーターストアの値や名前を変更して再度`cdk deploy`した時にはその違いがある。

その結果はこのようなものだった。

#### valueForStringParameter

* ssm paramの値を変更して`cdk deploy`: デプロイされてoutputの値も変わる
* ssm paramの名前を変更して`cdk deploy`: デプロイされてoutputの値も変わる
* ssm paramの名前を存在しない名前に変更して`cdk deploy`: エラーとなりデプロイされない
* cdk.context.json: つくられない
* AWS CDKの解説文: Returns a token that will resolve (during deployment) to the string value of an SSM string parameter.

#### fromStringParameterName

* ssm paramの値を変更して`cdk deploy`: デプロイされてoutputの値も変わる
* ssm paramの名前を変更して`cdk deploy`: no changeとなりデプロイされない
* ssm paramの名前を存在しない名前に変更して`cdk deploy`: no changeとなりデプロイされない（なんで？）
* cdk.context.json: つくられない
* AWS CDKの解説文: Imports an external string parameter by name.

#### valueFromLookup

* ssm paramの値を変更して`cdk deploy`: no changeとなりデプロイされない。ただしcdk.context.jsonを削除すればデプロイされてoutputの値も変わる。
* ssm paramの名前を変更して`cdk deploy`: デプロイされてoutputの値も変わる。
* ssm paramの名前を存在しない名前に変更して`cdk deploy`: エラーとなりデプロイされない。
* cdk.context.json: つくられる
* AWS CDKの解説文: Reads the value of an SSM parameter during synthesis through an environmental context provider.

### cdk.context.jsonについて

cdk.context.jsonというファイルは[AWSのドキュメント](https://docs.aws.amazon.com/cdk/latest/guide/context.html)によればバージョンコントロールに含めることがおすすめされている。
 
### 試した結果から思うこと
 
どの関数を使うかは注意が必要だと思ったのは当然なのだけど、もう1つ気になったのがfromStringParameterNameの挙動だった。

このメソッドは[AWSのドキュメント](https://docs.aws.amazon.com/ja_jp/cdk/latest/guide/get_ssm_value.html)には記載がないのだけど生成されるCloudFormationテンプレートを確認するとデプロイ時に値が読み込まれるvalueForStringParameterと同じ動作になるのだと思う。

こういうタイプのCloudFormationテンプレートはAWSのドキュメント的に[動的な参照](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/dynamic-references.html)と呼べばいいのかもしれない。

2つのメソッドがどちらも同じ動的な参照なら、2つもメソッドが存在しなくていいだろうからそこに理由はあるのだろうけど、ちょっと挙動の謎さが気になるので今後利用するのは動作が想定できるvalueForStringParameterかvalueFromLookupのどちらかにしておこうと思っている。

というわけなので今後使っていくつもりの以下2つのメソッドの使い分けのポイントを挙げるとこうなる。

* valueFromLookup: 
	* cdk.context.jsonを使った値の管理ができる。
	* CloudFormationテンプレートに値が直接書き込まれる。
* valueForStringParameter: 
	* バージョンの指定ができる。
	* デプロイ時まで値が確定しない。

