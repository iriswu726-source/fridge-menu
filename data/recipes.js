// 菜色資料：每人份、生重（g）
//   m     適用餐別：B＝早餐，LD＝午餐或晚餐
//   items [食材 key, 克數]；"@leafy" 這類寫法代表「該分類中任一種冰箱裡有的食材」
//   "rice" 在設定選糙米時會自動換成糙米
//   nb    不適合隔天當便當（湯麵、蒸蛋、貝類等）
window.FM_DATA = window.FM_DATA || {};

FM_DATA.RECIPES = [
  // ---- 早餐 ----
  { id: "b1", m: "B", n: "起司蛋吐司", d: "全麥吐司・煎蛋・起司片・水果", items: [["toast", 70], ["egg", 55], ["cheese", 20], ["@fruit", 100], ["oil", 3]] },
  { id: "b2", m: "B", n: "燕麥牛奶碗", d: "燕麥・鮮奶・水果・堅果", items: [["oats", 40], ["milk", 240], ["@fruit", 100], ["nuts", 10]] },
  { id: "b3", m: "B", n: "地瓜蛋豆漿", d: "蒸地瓜・水煮蛋・無糖豆漿", items: [["sweetpotato", 150], ["egg", 55], ["soymilk", 300]] },
  { id: "b4", m: "B", n: "優格燕麥杯", d: "無糖優格・燕麥・水果・堅果", items: [["yogurt", 150], ["oats", 30], ["@fruit", 120], ["nuts", 10]] },
  { id: "b5", m: "B", n: "蔬菜烘蛋吐司", d: "蔬菜烘蛋・全麥吐司", items: [["egg", 110], ["@veg", 80], ["toast", 70], ["oil", 5]] },
  { id: "b6", m: "B", n: "雞胸三明治", d: "全麥吐司・雞胸肉・番茄・小黃瓜・鮮奶", items: [["chicken", 60], ["toast", 70], ["tomato", 40], ["cucumber", 30], ["milk", 200]] },
  { id: "b7", m: "B", n: "蔬菜肉末粥", d: "白粥・豬絞肉・蛋花・青菜", items: [["pork_mince", 30], ["rice", 40], ["egg", 55], ["@leafy", 60]] },
  { id: "b8", m: "B", n: "香蕉鮮奶早餐", d: "香蕉・鮮奶・水煮蛋・吐司", items: [["egg", 55], ["banana", 100], ["milk", 240], ["toast", 35]] },
  { id: "b9", m: "B", n: "豆漿燕麥", d: "無糖豆漿煮燕麥・水果・堅果", items: [["soymilk", 300], ["oats", 40], ["@fruit", 100], ["nuts", 8]] },
  { id: "b10", m: "B", n: "馬鈴薯蛋沙拉三明治", d: "馬鈴薯・蛋・小黃瓜・優格醬・吐司", items: [["egg", 55], ["potato", 80], ["cucumber", 30], ["yogurt", 30], ["toast", 70]] },
  { id: "b11", m: "B", n: "菇菇蛋捲飯糰", d: "鮮菇蛋捲・小飯糰・豆漿", items: [["egg", 110], ["@mush", 50], ["rice", 45], ["soymilk", 240], ["oil", 4]] },
  { id: "b12", m: "B", n: "雞胸優格碗", d: "雞胸肉・優格・小黃瓜番茄・地瓜", items: [["chicken", 80], ["yogurt", 120], ["cucumber", 50], ["tomato", 60], ["sweetpotato", 100]] },
  { id: "b13", m: "B", n: "黑芝麻豆漿燕麥", d: "無糖豆漿・燕麥・黑芝麻粉・水果", items: [["soymilk", 300], ["oats", 40], ["sesame", 10], ["@fruit", 100]] },
  { id: "b14", m: "B", n: "毛豆蔬菜蛋捲", d: "毛豆蛋捲・全麥吐司・番茄", items: [["egg", 110], ["edamame", 40], ["toast", 35], ["tomato", 60], ["oil", 4]] },
  { id: "b15", m: "B", n: "小魚紫菜粥", d: "小魚乾・紫菜・蛋花・青菜粥", items: [["smallfish", 8], ["rice", 40], ["egg", 55], ["seaweed", 3], ["@leafy", 60]] },

  // ---- 午餐／晚餐 ----
  { id: "l1", m: "LD", n: "番茄炒蛋定食", d: "番茄炒蛋・炒青菜・白飯", items: [["egg", 110], ["tomato", 150], ["@leafy", 150], ["rice", 80], ["oil", 10]] },
  { id: "l2", m: "LD", n: "三杯雞定食", d: "三杯雞腿・炒青菜・白飯", items: [["chicken_thigh", 150], ["@leafy", 150], ["@mush", 40], ["rice", 80], ["oil", 12]] },
  { id: "l3", m: "LD", n: "青椒肉絲定食", d: "青椒肉絲・清炒高麗菜・白飯", items: [["pork", 100], ["greenpepper", 100], ["carrot", 30], ["cabbage", 120], ["rice", 80], ["oil", 10]] },
  { id: "l4", m: "LD", n: "麻婆豆腐定食", d: "麻婆豆腐・燙青菜・白飯", items: [["tofu", 200], ["pork_mince", 50], ["@leafy", 150], ["rice", 80], ["oil", 10]] },
  { id: "l5", m: "LD", n: "鹽烤鮭魚盤", d: "鹽烤鮭魚・烤青花菜・烤地瓜", items: [["salmon", 120], ["broccoli", 120], ["sweetpotato", 150], ["oil", 5]] },
  { id: "l6", m: "LD", n: "清蒸鯛魚定食", d: "清蒸鯛魚・燙青菜・紅蘿蔔絲・白飯", items: [["fish", 150], ["@leafy", 150], ["carrot", 40], ["rice", 80], ["oil", 6]] },
  { id: "l7", m: "LD", n: "蝦仁炒蛋定食", d: "蝦仁炒蛋・蒜炒青花菜・白飯", items: [["shrimp", 80], ["egg", 55], ["broccoli", 120], ["rice", 80], ["oil", 10]] },
  { id: "l8", m: "LD", n: "洋蔥牛肉定食", d: "洋蔥炒牛肉・燙青菜・白飯", items: [["beef", 120], ["onion", 100], ["@leafy", 150], ["rice", 80], ["oil", 10]] },
  { id: "l9", m: "LD", n: "日式咖哩雞", d: "咖哩雞・馬鈴薯紅蘿蔔・燙青菜・白飯", items: [["chicken", 120], ["potato", 100], ["carrot", 50], ["onion", 50], ["@leafy", 100], ["rice", 70], ["oil", 10]] },
  { id: "l10", m: "LD", n: "番茄牛肉麵", d: "番茄燉牛肉・青菜・麵條", nb: true, items: [["beef", 100], ["tomato", 150], ["noodles", 90], ["@leafy", 100], ["onion", 30], ["oil", 5]] },
  { id: "l11", m: "LD", n: "豆干肉絲定食", d: "豆干炒肉絲・炒青菜・白飯", items: [["dried_tofu", 80], ["pork", 60], ["carrot", 30], ["@leafy", 150], ["rice", 80], ["oil", 10]] },
  { id: "l12", m: "LD", n: "高麗菜肉末炒飯", d: "高麗菜肉末蛋炒飯・蔬菜湯", items: [["pork_mince", 40], ["rice", 90], ["egg", 55], ["cabbage", 100], ["carrot", 30], ["corn", 30], ["@veg", 80], ["oil", 12]] },
  { id: "l13", m: "LD", n: "雞肉蔬菜湯麵", d: "雞胸肉・青菜・鮮菇・麵條", nb: true, items: [["chicken", 100], ["noodles", 80], ["@leafy", 150], ["@mush", 50], ["carrot", 30], ["oil", 3]] },
  { id: "l14", m: "LD", n: "香菇雞湯定食", d: "香菇雞湯・炒青菜・白飯", items: [["chicken_thigh", 120], ["mushroom", 60], ["@leafy", 150], ["rice", 80], ["oil", 6]] },
  { id: "l15", m: "LD", n: "肉末茄子定食", d: "肉末茄子・蒸蛋・燙青菜・白飯", items: [["pork_mince", 60], ["eggplant", 150], ["egg", 55], ["@leafy", 100], ["rice", 80], ["oil", 12]] },
  { id: "l16", m: "LD", n: "蒜炒蝦仁青花", d: "蒜炒蝦仁青花菜・玉米・白飯", items: [["shrimp", 120], ["broccoli", 150], ["corn", 50], ["rice", 80], ["oil", 8]] },
  { id: "l17", m: "LD", n: "馬鈴薯燉肉", d: "馬鈴薯燉豬肉・燙青菜・半碗飯", items: [["pork", 100], ["potato", 150], ["carrot", 60], ["onion", 60], ["@leafy", 100], ["rice", 40], ["oil", 8]] },
  { id: "l18", m: "LD", n: "豆腐鮮菇煲", d: "豆腐鮮菇煲・高麗菜・白飯", items: [["tofu", 200], ["cabbage", 100], ["@mush", 60], ["carrot", 30], ["egg", 55], ["rice", 80], ["oil", 6]] },
  { id: "l19", m: "LD", n: "滷雞腿便當", d: "滷雞腿・滷蛋・滷豆干・炒高麗菜", items: [["chicken_thigh", 150], ["egg", 55], ["dried_tofu", 40], ["cabbage", 150], ["rice", 80], ["oil", 6]] },
  { id: "l20", m: "LD", n: "香煎鯛魚地瓜飯", d: "香煎鯛魚・燙青菜・地瓜飯", items: [["fish", 150], ["sweetpotato", 80], ["rice", 50], ["@leafy", 150], ["oil", 8]] },
  { id: "l21", m: "LD", n: "雞胸蔬菜沙拉", d: "雞胸肉・番茄・小黃瓜・玉米・地瓜・優格醬", items: [["chicken", 150], ["cucumber", 60], ["tomato", 80], ["corn", 50], ["sweetpotato", 150], ["yogurt", 40], ["@leafy", 60]] },
  { id: "l22", m: "LD", n: "牛肉炒青花定食", d: "牛肉炒青花菜・紅蘿蔔・白飯", items: [["beef", 100], ["broccoli", 150], ["carrot", 30], ["rice", 80], ["oil", 10]] },
  { id: "l23", m: "LD", n: "鮭魚菇菇炊飯", d: "鮭魚鮮菇炊飯・燙青菜", items: [["salmon", 100], ["@mush", 80], ["rice", 80], ["@leafy", 120], ["oil", 4]] },
  { id: "l24", m: "LD", n: "菠菜豬肉湯麵", d: "豬里肌・菠菜・蛋・麵條", nb: true, items: [["pork", 80], ["spinach", 150], ["egg", 55], ["noodles", 80], ["oil", 3]] },
  { id: "l25", m: "LD", n: "雞胸溫沙拉碗", d: "水煮雞胸・燙青花菜・蒸地瓜・溏心蛋", items: [["chicken", 150], ["broccoli", 120], ["@leafy", 80], ["sweetpotato", 120], ["egg", 55]] },
  { id: "l26", m: "LD", n: "清燙蝦仁豆腐", d: "清燙蝦仁・嫩煎豆腐・燙青菜・半碗飯", items: [["shrimp", 100], ["tofu", 150], ["@leafy", 150], ["rice", 45], ["oil", 4]] },

  // 補鐵、鈣、纖維
  { id: "l27", m: "LD", n: "毛豆炒蝦仁", d: "毛豆炒蝦仁・炒青菜・白飯", items: [["shrimp", 100], ["edamame", 80], ["carrot", 30], ["@leafy", 120], ["rice", 80], ["oil", 8]] },
  { id: "l28", m: "LD", n: "紅莧菜豆腐湯定食", d: "煎豬里肌・紅莧菜豆腐湯・白飯", items: [["pork", 90], ["amaranth", 150], ["tofu", 100], ["rice", 80], ["oil", 8]] },
  { id: "l29", m: "LD", n: "蛤蜊蒸蛋定食", d: "蛤蜊蒸蛋・炒青菜・白飯", nb: true, items: [["clam", 250], ["egg", 110], ["@leafy", 150], ["rice", 80], ["oil", 5]] },
  { id: "l30", m: "LD", n: "照燒雞腿芝麻菠菜", d: "照燒雞腿・芝麻拌菠菜・白飯", items: [["chicken_thigh", 130], ["spinach", 150], ["sesame", 8], ["rice", 80], ["oil", 6]] },
  { id: "l31", m: "LD", n: "鮮蚵豆腐煲", d: "鮮蚵豆腐煲・燙青菜・白飯", nb: true, items: [["oyster", 120], ["tofu", 150], ["@leafy", 120], ["rice", 70], ["oil", 6]] },
  { id: "l32", m: "LD", n: "芥蘭炒牛肉", d: "芥蘭炒牛肉・紅蘿蔔・白飯", items: [["beef", 100], ["kailan", 180], ["carrot", 20], ["rice", 80], ["oil", 10]] },
  { id: "l33", m: "LD", n: "木耳炒肉絲", d: "黑木耳炒肉絲・炒青菜・白飯", items: [["pork", 80], ["woodear", 80], ["carrot", 40], ["@leafy", 120], ["rice", 80], ["oil", 10]] },
  { id: "l34", m: "LD", n: "秋葵雞胸地瓜盤", d: "秋葵雞胸・玉米・蒸地瓜・芝麻", items: [["chicken", 130], ["okra", 100], ["corn", 40], ["sweetpotato", 120], ["sesame", 5], ["oil", 6]] },

  // 蛋奶素也能吃
  { id: "l35", m: "LD", n: "毛豆豆干炒木耳", d: "毛豆豆干炒黑木耳・炒青菜・白飯", items: [["dried_tofu", 100], ["edamame", 60], ["woodear", 60], ["@leafy", 150], ["rice", 80], ["oil", 10]] },
  { id: "l36", m: "LD", n: "番茄豆腐燴飯", d: "番茄豆腐蛋燴飯・燙青菜", items: [["tofu", 200], ["tomato", 150], ["egg", 55], ["@leafy", 100], ["rice", 80], ["oil", 8]] },
  { id: "l37", m: "LD", n: "菇菇蔬菜蛋炒麵", d: "鮮菇高麗菜蛋炒麵", items: [["egg", 110], ["noodles", 80], ["@mush", 80], ["cabbage", 100], ["carrot", 30], ["oil", 10]] },
  { id: "l38", m: "LD", n: "蔬菜咖哩豆腐", d: "豆腐咖哩・馬鈴薯紅蘿蔔・燙青菜・白飯", items: [["tofu", 150], ["potato", 100], ["carrot", 50], ["onion", 50], ["@leafy", 100], ["rice", 70], ["oil", 8]] },
  { id: "l39", m: "LD", n: "毛豆玉米蛋炒飯", d: "毛豆玉米蛋炒飯・燙青菜", items: [["egg", 110], ["rice", 90], ["edamame", 50], ["corn", 40], ["@leafy", 120], ["oil", 10]] }
];
