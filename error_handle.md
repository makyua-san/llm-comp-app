# エラー解決メモ

## 背景
Pydantic 2.10 より前のバージョンでは、モデル属性とメソッドの衝突を防ぐために `('model_',)` が予約接頭辞として扱われていました。そのため `model_id`、`model_input`、`model_output` などのフィールド名を `BaseModel` で使用するとエラーが発生していました。

## 解決策
Pydantic を **バージョン 2.11** にアップグレードすることで、これらのフィールド名との競合が解消され、`model_id` を含むスキーマを問題なく定義できるようになりました。

```bash
# 例: Poetry を使用する場合
poetry add pydantic@2.11

# 例: pip を使用する場合
pip install --upgrade pydantic==2.11
```

## 参考情報
詳しくは公式 Issue を参照してください。
https://github.com/pydantic/pydantic/issues/10315 

## Pydantic 前方参照と循環インポートによる起動時エラー

### 日時

2024-07-28

### 現象

`uvicorn` でバックエンドサーバーを起動しようとすると、以下のエラーが順番に発生し、起動に失敗した。

1.  `pydantic.errors.PydanticUndefinedAnnotation: name 'BenchmarkBase' is not defined`
2.  `pydantic.errors.PydanticUndefinedAnnotation: name 'ModelBase' is not defined`
3.  `ImportError: cannot import name 'Provider' from partially initialized module ... (most likely due to a circular import)`
4.  `TypeError: BaseModel.model_rebuild() got an unexpected keyword argument 'namespace'`

### 原因

エラーの根本原因は、Pydantic v2 のスキーマ定義における前方参照（Forward References）の解決方法にあった。

1.  **`PydanticUndefinedAnnotation`**:
    *   `ModelWithDetails` スキーマ内で `'BenchmarkBase'` のように文字列で型を定義（前方参照）していた。
    *   しかし、`backend/schemas/__init__.py` で `ModelWithDetails.model_rebuild()` が呼ばれた際、`model.py` の実行時スコープに `BenchmarkBase` が存在せず、名前解決に失敗した。

2.  **`ImportError` (循環インポート)**:
    *   上記エラーを解決するため、`model.py` に `from .provider import Provider`、`provider.py` に `from .model import ModelBase` のような実行時インポートを追加した。
    *   これにより、`model.py` と `provider.py` が互いをインポートし合う「循環インポート」が発生し、Python がモジュールの初期化を完了できなくなった。

3.  **`TypeError`**:
    *   循環インポートを解消し、`__init__.py` で前方参照を解決する方針に切り替えた。
    *   その際、`model_rebuild(namespace=...)` を使用したが、Pydantic v2 における正しい引数名は `_types_namespace` であったため、`TypeError` が発生した。

### 解決策

循環インポートを避けつつ、Pydantic の前方参照を正しく解決するため、以下の手順で修正を行った。

1.  **循環インポートの解消**:
    *   `model.py` や `provider.py` 内で相互に参照していた実行時 `import` 文をすべて削除した。
    *   型ヒント（エディタの補完など）のため、`if TYPE_CHECKING:` ブロック内のインポートは維持した。

2.  **`__init__.py` での前方参照の解決**:
    *   すべてのスキーマモデルが集約されている `backend/schemas/__init__.py` で `model_rebuild()` を実行する。
    *   `model_rebuild()` の `_types_namespace` 引数を使用し、前方参照されている型名（文字列）と、その実体であるクラスオブジェクトをマッピングした辞書を渡す。

    ```python
    # backend/schemas/__init__.py

    # ... (各モデルクラスをインポート)

    # Resolve forward refs explicitly with namespace mapping
    ModelWithDetails.model_rebuild(_types_namespace={
        "Provider": Provider,
        "BenchmarkBase": BenchmarkBase,
        "PricingBase": PricingBase,
    })

    ProviderWithModels.model_rebuild(_types_namespace={
        "ModelBase": ModelBase,
    })
    ```

この修正により、モジュール間の依存関係をクリーンに保ちながら、アプリケーション起動時に Pydantic モデルの前方参照を安全に解決できるようになった。 