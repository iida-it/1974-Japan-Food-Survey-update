import { CategorySpec, SurveyItem, CategoryStatus, SurveyRowData } from '../types';

export const FOOD_NAMES_1974: Record<number, { ja: string; en: string }> = {
  // ① ごはん・麺・パン (Directly from 1974 Survey Excel Template)
  1: { ja: "親子丼", en: "Oyakodon (Chicken & Egg Bowl)" },
  9: { ja: "筍ご飯", en: "Takenoko Gohan (Bamboo Shoot Rice)" },
  13: { ja: "赤飯", en: "Sekihan (Red Bean Rice)" },
  14: { ja: "のり巻きずし", en: "Norimaki Sushi" },
  15: { ja: "ちらしずし", en: "Chirashi Sushi" },
  16: { ja: "いなりずし", en: "Inari Sushi" },
  19: { ja: "チキンライス", en: "Chicken Rice" },
  20: { ja: "カレーライス", en: "Curry Rice" },
  21: { ja: "ハヤシライス", en: "Hayashi Rice" },
  22: { ja: "オムライス", en: "Omurice" },
  25: { ja: "チャーハン", en: "Fried Rice (Chahan)" },
  27: { ja: "ラーメン", en: "Ramen" },
  28: { ja: "うどん", en: "Udon Noodles" },
  29: { ja: "そば", en: "Soba (Buckwheat Noodles)" },
  30: { ja: "そうめん", en: "Somen Noodles" },
  31: { ja: "焼きそば", en: "Yakisoba" },
  32: { ja: "スパゲティ", en: "Spaghetti" },
  33: { ja: "マカロニ", en: "Macaroni" },
  37: { ja: "食パン", en: "White Bread (Shokupan)" },
  39: { ja: "菓子パン", en: "Sweet Pastry Bread" },

  // ② 卵
  43: { ja: "卵焼き", en: "Rolled Omelet (Tamagoyaki)" },
  46: { ja: "目玉焼き", en: "Fried Egg" },
  48: { ja: "ゆで卵", en: "Boiled Egg" },
  50: { ja: "生卵", en: "Raw Egg" },
  52: { ja: "茶碗蒸し", en: "Chawanmushi (Egg Custard)" },
  53: { ja: "オムレツ", en: "Omelet" },
  54: { ja: "スクランブルエッグ", en: "Scrambled Eggs" },
  55: { ja: "かに玉", en: "Kanitama (Egg Foo Young)" },
  58: { ja: "マヨネーズ料理", en: "Mayonnaise Dishes" },
  59: { ja: "プリン", en: "Custard Pudding" },

  // ③ 鶏肉
  65: { ja: "焼き鳥", en: "Yakitori (Grilled Chicken)" },
  67: { ja: "から揚げ", en: "Karaage (Fried Chicken)" },
  70: { ja: "水炊き", en: "Mizutaki (Chicken Stew)" },
  71: { ja: "筑前煮", en: "Chikuzenni" },
  76: { ja: "ローストチキン", en: "Roast Chicken" },
  77: { ja: "チキンカツ", en: "Chicken Cutlet" },

  // ④ 豚肉
  85: { ja: "とんかつ", en: "Tonkatsu (Pork Cutlet)" },
  86: { ja: "豚の生姜焼き", en: "Pork Ginger (Shogayaki)" },
  88: { ja: "豚汁", en: "Tonjiru (Pork Miso Soup)" },
  92: { ja: "酢豚", en: "Sweet and Sour Pork" },
  94: { ja: "豚の角煮", en: "Kakuni (Braised Pork)" },
  95: { ja: "餃子", en: "Gyoza" },
  96: { ja: "シューマイ", en: "Shumai" },
  97: { ja: "チャーシュー", en: "Chashu Pork" },
  98: { ja: "ポークソテー", en: "Pork Saute" },

  // ⑤ 牛肉
  103: { ja: "すき焼き", en: "Sukiyaki" },
  108: { ja: "牛ステーキ・焼肉", en: "Beef Steak / Yakiniku" },

  // ⑦ 豆腐
  128: { ja: "冷奴", en: "Hiyayakko (Chilled Tofu)" },
  130: { ja: "湯豆腐", en: "Yudofu (Boiled Tofu)" },
  134: { ja: "麻婆豆腐", en: "Mapo Tofu" },
  135: { ja: "豆腐の味噌汁", en: "Tofu Miso Soup" },
  140: { ja: "揚げ出し豆腐", en: "Agedashi Tofu" },

  // ⑧ 納豆
  144: { ja: "納豆", en: "Natto" },

  // ⑩ うの花
  154: { ja: "うの花炒り煮", en: "Unohana Simmered" },

  // ⑪ がんもどき
  159: { ja: "がんもどきの煮物", en: "Simmered Ganmodoki" },

  // ⑫ 高野豆腐
  162: { ja: "高野豆腐の煮物", en: "Simmered Koya-dofu" },

  // ⑬ 生揚げ
  165: { ja: "生揚げ焼き・煮物", en: "Thick Fried Tofu Dish" },

  // ⑯ じゃが芋
  182: { ja: "肉じゃが", en: "Nikujaga (Beef & Potato)" },
  183: { ja: "ポテトサラダ", en: "Potato Salad" },
  187: { ja: "フライドポテト", en: "French Fries" },
  190: { ja: "コロッケ", en: "Potato Croquette" },
  191: { ja: "じゃが芋の味噌汁", en: "Potato Miso Soup" },
  193: { ja: "粉ふき芋", en: "Mashed / Boiled Potato" },

  // ⑱ 山芋
  201: { ja: "とろろ・山芋短冊", en: "Tororo / Grated Yam" },

  // ⑲ 里芋
  206: { ja: "里芋の煮物", en: "Simmered Taro" },

  // ⑳ さつま芋
  211: { ja: "焼き芋・天ぷら", en: "Roasted Sweet Potato / Tempura" },

  // ㉒ なす
  223: { ja: "焼きなす", en: "Grilled Eggplant" },
  230: { ja: "なすの味噌炒め", en: "Miso Sautéed Eggplant" },
  231: { ja: "なすの漬物", en: "Pickled Eggplant" },

  // ㉓ 大根
  237: { ja: "大根の味噌汁", en: "Daikon Miso Soup" },
  239: { ja: "おでん・ふろふき大根", en: "Oden / Simmered Daikon" },
  243: { ja: "大根おろし", en: "Grated Daikon" },
  244: { ja: "たくあん・浅漬け", en: "Takuan / Pickled Daikon" },

  // ㉔ キャベツ
  248: { ja: "千切りキャベツ", en: "Shredded Cabbage" },
  249: { ja: "野菜炒め（キャベツ）", en: "Stir-fried Cabbage" },
  250: { ja: "ロールキャベツ", en: "Cabbage Rolls" },
  252: { ja: "コールスロー", en: "Coleslaw" },

  // ㉕ 人参
  257: { ja: "きんぴら人参", en: "Kinpira Carrot" },
  258: { ja: "人参の煮物", en: "Simmered Carrots" },

  // ㉖ トマト
  262: { ja: "生トマトスライス", en: "Fresh Sliced Tomato" },
  263: { ja: "トマトサラダ", en: "Tomato Salad" },

  // ㉗ きゅうり
  268: { ja: "きゅうりの酢の物", en: "Cucumber Sunomono" },
  271: { ja: "きゅうりの浅漬け", en: "Pickled Cucumber" },

  // ㉘ 小松菜
  275: { ja: "小松菜のお浸し", en: "Komatsuna Ohitashi" },
  277: { ja: "小松菜の味噌汁", en: "Komatsuna Miso Soup" },

  // ㉙ 玉葱
  281: { ja: "オニオンスライス", en: "Sliced Onion Salad" },
  282: { ja: "玉葱の味噌汁", en: "Onion Miso Soup" },

  // ㉛ ホウレン草
  289: { ja: "ホウレン草のお浸し", en: "Spinach Ohitashi" },
  290: { ja: "ホウレン草の胡麻和え", en: "Spinach Sesame Salad" },
  296: { ja: "ホウレン草のバターソテー", en: "Sauteed Spinach in Butter" },

  // ㉜ かぼちゃ
  300: { ja: "かぼちゃの煮物", en: "Simmered Pumpkin" },

  // ㉝ ピーマン
  305: { ja: "青椒肉絲（チンジャオロース）", en: "Pepper Steak" },
  306: { ja: "ピーマンの肉詰め", en: "Stuffed Bell Peppers" },

  // ㉞ 筍
  311: { ja: "若竹煮・筍の土佐煮", en: "Wakatakeni / Bamboo Shoots" },

  // ㉟ ごぼう
  319: { ja: "きんぴらごぼう", en: "Kinpira Gobo" },
  320: { ja: "たたきごぼう", en: "Tataki Gobo" },

  // ㊲ もやし
  326: { ja: "もやし炒め", en: "Stir-fried Bean Sprouts" },
  328: { ja: "もやしのナムル・酢の物", en: "Seasoned Bean Sprouts" },

  // ㊴ れんこん
  337: { ja: "れんこんのきんぴら", en: "Kinpira Lotus Root" },

  // ㊷ セロリ
  351: { ja: "セロリスティック・サラダ", en: "Celery Sticks / Salad" },

  // ㊸ しいたけ
  354: { ja: "焼きしいたけ・煮物", en: "Grilled Shiitake" },

  // ㊺ ハム・ソーセージ
  361: { ja: "ロースハム", en: "Loin Ham" },
  362: { ja: "ウインナーソーセージ", en: "Wiener Sausages" },
  363: { ja: "プレスハム・ボロニア", en: "Pressed Ham / Bologna" },

  // ㊻ かまぼこ
  366: { ja: "板わさ・焼きかまぼこ", en: "Sliced Kamaboko" },

  // ㊼ アジ
  376: { ja: "アジの開き干物", en: "Dried Horse Mackerel" },
  378: { ja: "アジの塩焼き", en: "Salt-grilled Horse Mackerel" },
  382: { ja: "アジフライ", en: "Fried Horse Mackerel" },

  // ㊽ サバ
  386: { ja: "サバの味噌煮", en: "Saba Miso (Mackerel in Miso)" },
  394: { ja: "サバの塩焼き", en: "Salt-grilled Mackerel" },

  // 50 タイ
  419: { ja: "タイの塩焼き", en: "Salt-grilled Sea Bream" },
  421: { ja: "タイの刺身", en: "Sea Bream Sashimi" },
  422: { ja: "タイのあら煮", en: "Simmered Sea Bream" },

  // 53 えび
  438: { ja: "エビフライ・天ぷら", en: "Fried Shrimp / Tempura" },

  // 54 マグロ
  446: { ja: "マグロの刺身", en: "Tuna Sashimi" },

  // 55 鮭
  452: { ja: "塩鮭・焼き鮭", en: "Salt-grilled Salmon" },
  454: { ja: "鮭のムニエル", en: "Salmon Meuniere" },
  459: { ja: "スモークサーモン", en: "Smoked Salmon" },

  // 56 タコ
  463: { ja: "タコの酢の物", en: "Octopus Sunomono" },
  464: { ja: "ゆでタコ・刺身", en: "Boiled Octopus / Sashimi" },

  // 57 カツオ
  469: { ja: "カツオのたたき", en: "Seared Bonito (Katsuo Tataki)" },

  // 60 しじみ、あさり、はまぐり
  484: { ja: "あさりの味噌汁・酒蒸し", en: "Clam Miso Soup / Steamed Clams" },

  // 62 イワシ
  499: { ja: "イワシの丸干し・塩焼き", en: "Dried / Grilled Sardines" },
  502: { ja: "イワシの梅煮・生姜煮", en: "Simmered Sardines" },

  // 67 さんま
  534: { ja: "さんまの塩焼き", en: "Salt-grilled Pacific Saury" }
};

// Exact 1974 Specification: 45 Categories with historical row IDs and bilingual names
export const RAW_1974_SPEC: CategorySpec[] = [
  { cat: "①ごはん・麺・パン", name_ja: "①ごはん・麺・パン", name_en: "① Rice, Noodles, Bread", ids: [1, 9, 13, 14, 15, 16, 19, 20, 21, 22, 25, 27, 28, 29, 30, 31, 32, 33, 37, 39] },
  { cat: "②卵", name_ja: "②卵", name_en: "② Eggs", ids: [43, 46, 48, 50, 52, 53, 54, 55, 58, 59] },
  { cat: "③鶏肉", name_ja: "③鶏肉", name_en: "③ Chicken", ids: [65, 67, 70, 71, 76, 77] },
  { cat: "④豚肉", name_ja: "④豚肉", name_en: "④ Pork", ids: [85, 86, 88, 92, 94, 95, 96, 97, 98] },
  { cat: "⑤牛肉", name_ja: "⑤牛肉", name_en: "⑤ Beef", ids: [103, 108] },
  { cat: "⑦豆腐", name_ja: "⑦豆腐", name_en: "⑦ Tofu", ids: [128, 130, 134, 135, 140] },
  { cat: "⑧納豆", name_ja: "⑧納豆", name_en: "⑧ Natto (Fermented Soybeans)", ids: [144] },
  { cat: "⑩うの花", name_ja: "⑩うの花", name_en: "⑩ Unohana (Soy Pulp)", ids: [154] },
  { cat: "⑪がんもどき", name_ja: "⑪がんもどき", name_en: "⑪ Ganmodoki (Fried Tofu Fritter)", ids: [159] },
  { cat: "⑫高野豆腐", name_ja: "⑫高野豆腐", name_en: "⑫ Koya-dofu (Dried Tofu)", ids: [162] },
  { cat: "⑬生揚げ", name_ja: "⑬生揚げ", name_en: "⑬ Thick Fried Tofu (Namaage)", ids: [165] },
  { cat: "⑯じゃが芋", name_ja: "⑯じゃが芋", name_en: "⑯ Potatoes", ids: [182, 183, 187, 190, 191, 193] },
  { cat: "⑱山芋", name_ja: "⑱山芋", name_en: "⑱ Japanese Yam", ids: [201] },
  { cat: "⑲里芋", name_ja: "⑲里芋", name_en: "⑲ Taro (Satoimo)", ids: [206] },
  { cat: "⑳さつま芋", name_ja: "⑳さつま芋", name_en: "⑳ Sweet Potatoes", ids: [211] },
  { cat: "㉒なす", name_ja: "㉒なす", name_en: "㉒ Eggplant", ids: [223, 230, 231] },
  { cat: "㉓大根", name_ja: "㉓大根", name_en: "㉓ Daikon Radish", ids: [237, 239, 243, 244] },
  { cat: "㉔キャベツ", name_ja: "㉔キャベツ", name_en: "㉔ Cabbage", ids: [248, 249, 250, 252] },
  { cat: "㉕人参", name_ja: "㉕人参", name_en: "㉕ Carrots", ids: [257, 258] },
  { cat: "㉖トマト", name_ja: "㉖トマト", name_en: "㉖ Tomatoes", ids: [262, 263] },
  { cat: "㉗きゅうり", name_ja: "㉗きゅうり", name_en: "㉗ Cucumbers", ids: [268, 271] },
  { cat: "㉘小松菜", name_ja: "㉘小松菜", name_en: "㉘ Komatsuna (Spinach Mustard)", ids: [275, 277] },
  { cat: "㉙玉葱", name_ja: "㉙玉葱", name_en: "㉙ Onions", ids: [281, 282] },
  { cat: "㉛ホウレン草", name_ja: "㉛ホウレン草", name_en: "㉛ Spinach", ids: [289, 290, 296] },
  { cat: "㉜かぼちゃ", name_ja: "㉜かぼちゃ", name_en: "㉜ Pumpkin (Kabocha)", ids: [300] },
  { cat: "㉝ピーマン", name_ja: "㉝ピーマン", name_en: "㉝ Bell Peppers", ids: [305, 306] },
  { cat: "㉞筍", name_ja: "㉞筍", name_en: "㉞ Bamboo Shoots", ids: [311] },
  { cat: "㉟ごぼう", name_ja: "㉟ごぼう", name_en: "㉟ Burdock Root (Gobo)", ids: [319, 320] },
  { cat: "㊲もやし", name_ja: "㊲もやし", name_en: "㊲ Bean Sprouts", ids: [326, 328] },
  { cat: "㊴れんこん", name_ja: "㊴れんこん", name_en: "㊴ Lotus Root (Renkon)", ids: [337] },
  { cat: "㊷セロリ", name_ja: "㊷セロリ", name_en: "㊷ Celery", ids: [351] },
  { cat: "㊸しいたけ", name_ja: "㊸しいたけ", name_en: "㊸ Shiitake Mushrooms", ids: [354] },
  { cat: "㊺ハム・ソーセージ", name_ja: "㊺ハム・ソーセージ", name_en: "㊺ Ham & Sausages", ids: [361, 362, 363] },
  { cat: "㊻かまぼこ", name_ja: "㊻かまぼこ", name_en: "㊻ Kamaboko (Fish Cake)", ids: [366] },
  { cat: "㊼アジ", name_ja: "㊼アジ", name_en: "㊼ Horse Mackerel (Aji)", ids: [376, 378, 382] },
  { cat: "㊽サバ", name_ja: "㊽サバ", name_en: "㊽ Mackerel (Saba)", ids: [386, 394] },
  { cat: "50タイ", name_ja: "50タイ", name_en: "50 Sea Bream (Tai)", ids: [419, 421, 422] },
  { cat: "53えび", name_ja: "53えび", name_en: "53 Shrimp", ids: [438] },
  { cat: "54マグロ", name_ja: "54マグロ", name_en: "54 Tuna", ids: [446] },
  { cat: "55鮭", name_ja: "55鮭", name_en: "55 Salmon", ids: [452, 454, 459] },
  { cat: "56タコ", name_ja: "56タコ", name_en: "56 Octopus", ids: [463, 464] },
  { cat: "57カツオ", name_ja: "57カツオ", name_en: "57 Bonito (Katsuo)", ids: [469] },
  { cat: "60しじみ、あさり、はまぐり", name_ja: "60しじみ、あさり、はまぐり", name_en: "60 Clams (Shijimi, Asari, Hamaguri)", ids: [484] },
  { cat: "62イワシ", name_ja: "62イワシ", name_en: "62 Sardines", ids: [499, 502] },
  { cat: "67さんま", name_ja: "67さんま", name_en: "67 Pacific Saury (Sanma)", ids: [534] }
];

// Sequential Schema of all 117 items
export const FULL_1974_SCHEMA: SurveyItem[] = [];
let colCounter = 1;
RAW_1974_SPEC.forEach(entry => {
  entry.ids.forEach(id => {
    const food = FOOD_NAMES_1974[id];
    FULL_1974_SCHEMA.push({
      colIndex: colCounter++,
      cat: entry.cat,
      name_ja: entry.name_ja,
      name_en: entry.name_en,
      food_ja: food?.ja,
      food_en: food?.en,
      id: id
    });
  });
});

export function isRowFilled(row?: SurveyRowData): boolean {
  if (!row) return false;
  return row.never_eaten || row.frequency !== null || row.occasion_out_store;
}

export function getCategoryStatus(spec: CategorySpec, answers: Record<number, SurveyRowData>): CategoryStatus {
  const total = spec.ids.length;
  let filled = 0;
  spec.ids.forEach(id => {
    if (isRowFilled(answers[id])) filled++;
  });
  return {
    cat: spec.cat,
    name_ja: spec.name_ja,
    name_en: spec.name_en,
    filled,
    total,
    isComplete: filled === total && total > 0,
    isStarted: filled > 0
  };
}
