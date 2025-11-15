<!-- Card Image Placeholder Utility -->
<!-- このファイルは、カード画像の管理方法を説明しています -->

# カード画像の配置方法

## 構造

```
public/
  └── cards/
      ├── mine.png
      ├── farm.png
      ├── forest.png
      ├── market.png
      ├── house.png
      ├── factory.png
      ├── school.png
      ├── church.png
      ├── carpenter.png
      ├── farmer.png
      ├── merchant.png
      └── scholar.png
```

## 使用方法

1. 各カード画像を PNG または JPG 形式で `public/cards/` フォルダに配置
2. ファイル名は CardDefs.ts の `id` フィールドと一致させる
3. 推奨サイズ: 200 x 280 px (カードサイズ比率3.5:2.5)

## GameRoom コンポーネントでの使用例

```tsx
<img src={`/cards/${card.id}.png`} alt={card.name} style={styles.cardImage} />
```

## 自動フォールバック

カード画像が見つからない場合は、絵文字とテキストが代わりに表示されます。
