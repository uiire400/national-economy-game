# カード効果一覧

## 公共職場（初期）

### 採石場 (quarry)

- **効果**: 建物カード1枚を引く
- **effect**: `draw_card_1`
- **備考**: 山の一番上のカードを引く

### 鉱山 (mine)

- **効果**: 手札1枚を捨てて、家計から$6獲得
- **effect**: `gain_coins_6_multi`
- **備考**: 既に労働者が置かれていても使用可能（複数配置可能）
- **制限**: 家計に$6以上必要

### 学校 (school)

- **効果**: 労働者+1（研修中、次ラウンドから使用可能）
- **effect**: `hire_worker_training`
- **備考**: 研修中の労働者にも賃金が発生する

### 大工 (carpenter) ×2-3枚

- **効果**: 手札から建物を1つ建てる
- **effect**: `build_card`
- **備考**: コストは建物カードでも消費財カードでも支払える

## 公共職場（ラウンド追加）

### 露店 (shop)

- **効果**: 手札1枚を捨てて、家計から$6獲得
- **effect**: `gain_coins_6`
- **制限**: 家計に$6以上必要、1-2人プレイ時は1ラウンドに1回のみ

### 市場 (market)

- **効果**: 手札2枚を捨てて、家計から$12獲得
- **effect**: `gain_coins_12`
- **制限**: 家計に$12以上必要、1-2人プレイ時は1ラウンドに1回のみ

### 高等学校 (high_school)

- **効果**: 労働者を4人にする（不足分を補充）
- **effect**: `hire_to_4_workers`
- **制限**: 労働者が4人以上いる時は使えない

### スーパーマーケット (supermarket)

- **効果**: 手札2枚を捨てて、家計から$18獲得
- **effect**: `gain_coins_18`
- **制限**: 家計に$18以上必要、1-2人プレイ時は1ラウンドに1回のみ

### 大学 (university)

- **効果**: 労働者を5人にする（不足分を補充）
- **effect**: `hire_to_5_workers`
- **制限**: 労働者が5人以上いる時は使えない

### 百貨店 (department_store)

- **効果**: 手札3枚を捨てて、家計から$24獲得
- **effect**: `gain_coins_24`
- **制限**: 家計に$24以上必要、1-2人プレイ時は1ラウンドに1回のみ

### 専門学校 (vocational_school)

- **効果**: 労働者+1（即座に使用可能）
- **effect**: `hire_worker_instant`
- **備考**: 研修中にならず、そのラウンドからすぐ働ける

### 万博 (expo)

- **効果**: 手札3枚を捨てて、家計から$30獲得
- **effect**: `gain_coins_30`
- **制限**: 家計に$30以上必要、1-2人プレイ時は1ラウンドに1回のみ

## 私有職場

### 菜園 (vegetable_garden)

- **効果**: 消費財カード2枚+勝利点トークン1枚を取得
- **effect**: `gain_goods_2_vp_1`

### 鉄工所 (ironworks)

- **効果**: 建物カード2枚を引く
- **effect**: `draw_card_2_need_mine`
- **条件**: 先に鉱山に労働者を配置している必要がある

### 宝くじ (lottery)

- **効果**: 家計から$20取り、$10を返す（正味$10獲得）
- **effect**: `gain_coins_20_pay_10`
- **制限**: 家計に$20以上必要

### 遊園地 (amusement_park)

- **効果**: 家計から$25獲得
- **effect**: `gain_coins_25`
- **制限**: 家計に$25以上必要

### 芋畑 (potato_field)

- **効果**: 手札枚数に応じて消費財を引く（0枚→3枚、1枚→2枚、2枚→1枚）
- **effect**: `gain_goods_hand_size`
- **制限**: 手札が3枚以上ある時は使えない

### 観光牧場 (tourist_ranch)

- **効果**: 手札の消費財1枚につき$4を家計から獲得
- **effect**: `gain_coins_4_per_good`
- **備考**: 消費財を捨てる必要はない

### 建築会社 (construction_company)

- **効果**: 施設アイコンの建物を建て、その後建物カード2枚を引く
- **effect**: `build_facility_draw_2`

### 研究所 (research_lab)

- **効果**: 建物カード2枚+勝利点トークン1枚を取得
- **effect**: `draw_card_2_vp_1`

### 食品工場 (food_factory)

- **効果**: 手札2枚を捨て、その後建物カード4枚を引く
- **effect**: `discard_2_draw_4`
- **コスト低減**: 農業アイコンの建物を所有していればコスト-1

### 醸造所 (brewery)

- **効果**: 消費財カード4枚を引き、次ラウンド開始時に手札に加える
- **effect**: `draw_goods_4_next_round`
- **備考**: 手札上限チェックより後

### 総合建設 (general_construction)

- **効果**: 建物を2つ建て、手札が空なら建物カード3枚を引く
- **effect**: `build_2_draw_3`
- **備考**: 2つの建物は同時に建つため、相互のコスト低減不可

### 石油コンビナート (oil_complex)

- **効果**: 建物カード4枚を引く
- **effect**: `draw_card_4`

### 大聖堂 (cathedral)

- **効果**: なし（得点のみ）
- **effect**: `none`
- **コスト低減**: 勝利点トークン5枚以上でコスト-4

### 宮大工 (palace_carpenter)

- **効果**: 建物を1つ建て、その後勝利点トークン1枚を取得
- **effect**: `build_card_vp_1`
- **備考**: 大聖堂のコスト低減条件は宮大工使用前に満たす必要あり

### 造船所 (shipyard)

- **効果**: 手札3枚を捨て、その後建物カード6枚を引く
- **effect**: `discard_3_draw_6`

### 工業団地 (industrial_complex)

- **効果**: 建物カード3枚を引く
- **effect**: `draw_card_3`
- **コスト低減**: 工業建物1つにつきコスト-1（最小0）

### 食堂 (cafeteria)

- **効果**: 家計から$8獲得
- **effect**: `gain_coins_8`
- **制限**: 家計に$8以上必要

### プレハブ工務店 (prefab_builder)

- **効果**: 資産価値$10以下の建物を無料で建てる
- **effect**: `build_free_under_10`

### 養殖場 (fish_farm)

- **効果**: 手札に消費財がなければ2枚、あれば3枚の消費財を引く
- **effect**: `gain_goods_2or3`

### 旧市街 (old_town)

- **効果**: なし（カテゴリアイコン3つ）
- **effect**: `passive`

## パッシブ効果（終了時ボーナス）

### 会計事務所 (accounting_office)

- **効果**: 勝利点トークンから2倍の得点
- **endGameBonus**: `double_victory_tokens`
- **備考**: 職場として使用不可

### 墓地 (cemetery)

- **効果**: 施設建物を持っていなければ+8点
- **endGameBonus**: `8_if_no_facility`
- **備考**: 職場として使用不可

### 輸出港 (export_port)

- **効果**: 建物6つ以上で+24点
- **endGameBonus**: `24_if_6_plus_buildings`
- **備考**: 職場として使用不可

### 鉄道駅 (railway_station)

- **効果**: 建物8つ以上で+18点（鉄道駅自体も含む）
- **endGameBonus**: `18_if_8_plus_buildings`
- **備考**: 職場として使用不可

### 投資銀行 (investment_bank)

- **効果**: 施設建物4つ以上で+30点（投資銀行自体も含む）
- **endGameBonus**: `30_if_4_plus_facilities`
- **備考**: 職場として使用不可

### 植物園 (botanical_garden)

- **効果**: 農業建物4つ以上で+22点
- **endGameBonus**: `22_if_4_plus_agriculture`
- **備考**: 職場として使用不可

### 博物館 (museum)

- **効果**: なし（得点のみ）
- **effect**: `passive`
