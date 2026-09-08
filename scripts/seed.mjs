import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {dirname, resolve} from "node:path";
import mongoose from "mongoose";
import {loadEnv} from "./load-env.mjs";
import {AddOn, Category, Product, SiteSettings} from "../src/models/index.js";

const COLORS = {
  accent: "#e0565f",
  text: "#6b010f",
  textSoft: "#8a2b33",
  bgStart: "#fbebdb",
  bgEnd: "#f3d9c4",
};

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, max = 26) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if ([...candidate].length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function svgPlaceholder({title, subtitle, width = 480, height = 360}) {
  const lines = wrapText(title, 26).slice(0, 3);
  const small = width < 300;
  const lineHeight = small ? 30 : 46;
  const midY = subtitle ? 150 : 170;
  const startY = midY - ((lines.length - 1) * lineHeight) / 2;

  const titleText = lines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${small ? 20 : 26}" font-weight="700" fill="${COLORS.text}">${escapeXml(line)}</text>`
    )
    .join("");

  const subtitleText = subtitle
    ? `<text x="${width / 2}" y="${midY + lines.length * lineHeight + 16}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${small ? 13 : 18}" fill="${COLORS.textSoft}">${escapeXml(subtitle)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${COLORS.bgStart}"/>
      <stop offset="1" stop-color="${COLORS.bgEnd}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="${width / 2}" cy="150" r="${small ? 45 : 65}" fill="#ffffff" opacity="0.5"/>
  ${titleText}
  ${subtitleText}
</svg>
`;
}

function writeSvgIfMissing(relativePath, content) {
  const absolutePath = resolve(process.cwd(), relativePath);
  if (existsSync(absolutePath)) {
    return false;
  }
  mkdirSync(dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, content, "utf8");
  return true;
}

function removeUnusedPlaceholders(activeCategorySlugs) {
  const removed = [];
  const categoryDir = resolve(process.cwd(), "public/placeholders/categories");

  if (existsSync(categoryDir)) {
    for (const file of readdirSync(categoryDir)) {
      const slug = file.replace(/\.svg$/, "");
      if (file.endsWith(".svg") && !activeCategorySlugs.has(slug)) {
        unlinkSync(resolve(categoryDir, file));
        removed.push(`categories/${file}`);
      }
    }
  }

  const productDir = resolve(process.cwd(), "public/placeholders/products");
  if (existsSync(productDir)) {
    for (const file of readdirSync(productDir)) {
      if (file.endsWith(".svg")) {
        unlinkSync(resolve(productDir, file));
        removed.push(`products/${file}`);
      }
    }
  }

  return removed;
}

function createPlaceholders(categoryItems) {
  const written = [];

  const brandFiles = [
    {
      path: "public/placeholders/brand/logo.svg",
      svg: svgPlaceholder({title: "PIZZATO", subtitle: "بيزاتو"}),
    },
    {
      path: "public/placeholders/brand/favicon.svg",
      svg: svgPlaceholder({title: "PZ", width: 256, height: 256}),
    },
  ];

  for (const item of [...brandFiles, ...categoryItems]) {
    if (writeSvgIfMissing(item.path, item.svg)) {
      written.push(item.path);
    }
  }

  return written;
}

const TOP_LEVEL_CATEGORIES = [
  {
    slug: "pizzas",
    name: {en: "PIZZAS", ar: "البيتزا"},
    description: {
      en: "Hand-stretched dough, wood-fired, loaded your way.",
      ar: "عجينة مفردة باليد، مخبوزة على الحطب، محمّلة على ذوقك.",
    },
    children: [
      {
        slug: "vegetarian-pizza",
        name: {en: "VEGETARIAN PIZZA", ar: "بيتزا خضار"},
        description: {
          en: "Garden-fresh toppings.",
          ar: "إضافات خضار طازجة.",
        },
      },
      {
        slug: "cheese-pizza",
        name: {en: "CHEESE PIZZA", ar: "بيتزا جبن"},
        description: {
          en: "Made for the cheese obsessed.",
          ar: "لعشاق الجبن.",
        },
      },
      {
        slug: "chicken-pizza",
        name: {en: "CHICKEN PIZZA", ar: "بيتزا دجاج"},
        description: {
          en: "Juicy chicken, balanced flavors.",
          ar: "دجاج طري بنكهات متوازنة.",
        },
      },
      {
        slug: "meat-pizza",
        name: {en: "MEAT PIZZA", ar: "بيتزا لحم"},
        description: {
          en: "Serious toppings for meat lovers.",
          ar: "إضافات غنية لعشاق اللحوم.",
        },
      },
      {
        slug: "seafood-pizza",
        name: {en: "SEAFOOD PIZZA", ar: "بيتزا بحرية"},
        description: {
          en: "Fresh-from-the-sea toppings.",
          ar: "إضافات بحرية طازجة.",
        },
      },
    ],
  },
  {
    slug: "sides",
    name: {en: "SIDES", ar: "الأطباق الجانبية"},
    description: {
      en: "Crispy sides made to share.",
      ar: "أطباق جانبية مقرمشة للمشاركة.",
    },
  },
  {
    slug: "salads",
    name: {en: "SALADS", ar: "السلطات"},
    description: {
      en: "Fresh bowls, done right.",
      ar: "سلطات طازجة على أصولها.",
    },
  },
  {
    slug: "desserts",
    name: {en: "DESSERTS", ar: "الحلويات"},
    description: {
      en: "Sweet endings, done differently.",
      ar: "نهاية حلوة بأسلوب مختلف.",
    },
  },
  {
    slug: "drinks",
    name: {en: "DRINKS", ar: "المشروبات"},
    description: {
      en: "Chilled drinks to wash it down.",
      ar: "مشروبات مثلجة في كل وقت.",
    },
  },
  {
    slug: "add-ons",
    name: {en: "ADD-ONS", ar: "الإضافات"},
    description: {
      en: "Size your pizza, top it your way.",
      ar: "حدد مقاسك وأضف ما تحب.",
    },
  },
];

const INGREDIENTS = {
  "tomato sauce": {en: "Tomato sauce", ar: "صوص الطماطم"},
  mozzarella: {en: "Mozzarella", ar: "موتزاريلا"},
  "green pepper": {en: "Green pepper", ar: "فلفل أخضر"},
  "black olives": {en: "Black olives", ar: "زيتون أسود"},
  "fresh mushroom": {en: "Fresh mushroom", ar: "مشروم طازج"},
  "fresh mushrooms": {en: "Fresh mushrooms", ar: "مشروم طازج"},
  roumy: {en: "Roumy cheese", ar: "جبن رومي"},
  gouda: {en: "Gouda cheese", ar: "جبن جودة"},
  "blue cheese": {en: "Blue cheese", ar: "جبنة زرقاء"},
  labneh: {en: "Labneh", ar: "لبنة"},
  honey: {en: "Honey", ar: "عسل"},
  "chicken breast": {en: "Chicken breast", ar: "صدر دجاج"},
  "ranch sauce": {en: "Ranch sauce", ar: "صوص الرانش"},
  "hot dog": {en: "Hot dog", ar: "هوت دوج"},
  "BBQ sauce": {en: "BBQ sauce", ar: "صوص الباربكيو"},
  "barbecue sauce": {en: "BBQ sauce", ar: "صوص الباربكيو"},
  "chicken popcorn": {en: "Chicken popcorn", ar: "بوب كورن دجاج"},
  "smoked duck bacon": {en: "Smoked duck bacon", ar: "بيكون بط مدخن"},
  "chicken tenders": {en: "Chicken tenders", ar: "ستريبس دجاج"},
  sauce: {en: "Sauce", ar: "صوص"},
  pickles: {en: "Pickles", ar: "مخلل"},
  "caramelized onions": {en: "Caramelized onions", ar: "بصل مكرمل"},
  "Nashville sauce": {en: "Nashville sauce", ar: "صوص ناشفيل"},
  "Nashville seasoning": {en: "Nashville seasoning", ar: "بهارات ناشفيل"},
  "double beef pepperoni": {en: "Double beef pepperoni", ar: "بيبروني لحم مضاعف"},
  pepperoni: {en: "Pepperoni", ar: "بيبروني"},
  "pure ground beef": {en: "Pure ground beef", ar: "لحم مفروم صافي"},
  onions: {en: "Onions", ar: "بصل"},
  pastrami: {en: "Pastrami", ar: "باسترمي"},
  "mini burger": {en: "Mini burger", ar: "ميني برجر"},
  "truffle mayo sauce": {en: "Truffle mayo sauce", ar: "صوص مايونيز الترافل"},
  burger: {en: "Beef burger", ar: "برجر لحم"},
  "American cheese": {en: "American cheese", ar: "جبنة أمريكية"},
  "smoky sauce": {en: "Smoky sauce", ar: "صوص سموكي"},
  "Beijing hot dog": {en: "Beijing hot dog", ar: "هوت دوج بكين"},
  "smoked beef": {en: "Smoked beef", ar: "لحم مدخن"},
  "smoked turkey": {en: "Smoked turkey", ar: "ديك رومي مدخن"},
  tuna: {en: "Tuna", ar: "تونة"},
  shrimp: {en: "Shrimp", ar: "جمبري"},
  crab: {en: "Crab", ar: "كراب"},
};

function buildIngredients(tags) {
  return tags.map((tag) => {
    const entry = INGREDIENTS[tag];
    if (!entry) {
      throw new Error(`Unknown ingredient tag: ${tag}`);
    }
    return {...entry};
  });
}

const SIZE_NAMES = {
  S: {ar: "صغير", en: "Small"},
  M: {ar: "وسط", en: "Medium"},
  L: {ar: "كبير", en: "Large"},
};

const PIZZA_SIZE_KEYS = ["S", "M", "L"];

const PIZZAS = [
  {
    slug: "vegetable-pizza",
    name: {en: "Vegetable Pizza", ar: "بيتزا الخضروات"},
    description: {
      en: "Market-fresh veggies over tomato sauce with mozzarella.",
      ar: "خضروات طازجة على صوص الطماطم مع الموتزاريلا.",
    },
    subcategory: "vegetarian-pizza",
    ingredients: ["tomato sauce", "mozzarella", "green pepper", "black olives"],
    sizes: {S: 110, M: 155, L: 225},
  },
  {
    slug: "mushroom-pizza",
    name: {en: "Mushroom Pizza", ar: "بيتزا المشروم"},
    description: {
      en: "Fresh mushrooms, peppers and olives — a veggie-loaded classic.",
      ar: "مشروم طازج وفلفل وزيتون أسود — كلاسيكية محمّلة بالخضار.",
    },
    subcategory: "vegetarian-pizza",
    ingredients: [
      "tomato sauce",
      "mozzarella",
      "fresh mushroom",
      "green pepper",
      "black olives",
    ],
    sizes: {S: 115, M: 170, L: 240},
  },
  {
    slug: "margherita-pizza",
    name: {en: "Margherita Pizza", ar: "بيتزا مارغريتا"},
    description: {
      en: "Tomato sauce and mozzarella. Pure and simple.",
      ar: "صوص الطماطم والموتزاريلا. بساطة أصيلة.",
    },
    subcategory: "cheese-pizza",
    ingredients: ["tomato sauce", "mozzarella"],
    sizes: {S: 110, M: 150, L: 220},
  },
  {
    slug: "cheese-lovers-pizza",
    name: {en: "Cheese Lovers Pizza", ar: "بيتزا عشاق الجبن"},
    description: {
      en: "Four cheeses layered into one irresistible pizza.",
      ar: "أربعة أنواع جبن في بيتزا واحدة لا تُقاوم.",
    },
    subcategory: "cheese-pizza",
    ingredients: ["tomato sauce", "mozzarella", "roumy", "gouda", "blue cheese"],
    sizes: {S: 135, M: 195, L: 275},
  },
  {
    slug: "sweet-and-sour-pizza",
    name: {en: "Sweet & Sour Pizza", ar: "بيتزا حلوة وحامضة"},
    description: {
      en: "Labneh and mozzarella with a drizzle of honey.",
      ar: "لبنة وموتزاريلا مع رشة عسل.",
    },
    subcategory: "cheese-pizza",
    ingredients: ["labneh", "mozzarella", "honey"],
    sizes: {M: 175, L: 250},
  },
  {
    slug: "chicken-ranch-pizza",
    name: {en: "Chicken Ranch Pizza", ar: "بيتزا دجاج رانش"},
    description: {
      en: "Juicy chicken and ranch over a classic base.",
      ar: "دجاج طري ورانش على قاعدة كلاسيكية.",
    },
    subcategory: "chicken-pizza",
    ingredients: [
      "tomato sauce",
      "chicken breast",
      "mozzarella",
      "green pepper",
      "black olives",
      "ranch sauce",
    ],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "chicken-bbq-pizza",
    name: {en: "Chicken BBQ Pizza", ar: "بيتزا دجاج باربكيو"},
    description: {
      en: "Chicken, hot dog and smoky BBQ sauce.",
      ar: "دجاج وهوت دوج مع صوص باربكيو مدخن.",
    },
    subcategory: "chicken-pizza",
    ingredients: [
      "tomato sauce",
      "chicken breast",
      "hot dog",
      "mozzarella",
      "green pepper",
      "black olives",
      "BBQ sauce",
    ],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "chicken-duck-pizza",
    name: {en: "Chicken Duck Pizza", ar: "بيتزا دجاج بالبط"},
    description: {
      en: "Crispy chicken popcorn and smoked duck bacon.",
      ar: "بوب كورن دجاج مقرمش مع بيكون بط مدخن.",
    },
    subcategory: "chicken-pizza",
    ingredients: [
      "tomato sauce",
      "chicken popcorn",
      "smoked duck bacon",
    ],
    sizes: {S: 185, M: 260, L: 350},
  },
  {
    slug: "nashville-pizza",
    name: {en: "Nashville Pizza", ar: "بيتزا ناشفيل"},
    description: {
      en: "Hot Nashville chicken with pickles and caramelized onions.",
      ar: "دجاج ناشفيل الحار مع المخلل والبصل المكرمل.",
    },
    subcategory: "chicken-pizza",
    ingredients: [
      "chicken tenders",
      "sauce",
      "pickles",
      "caramelized onions",
      "Nashville sauce",
      "Nashville seasoning",
      "mozzarella",
    ],
    sizes: {S: 170, M: 240, L: 330},
    isNewItem: true,
  },
  {
    slug: "double-pepperoni-pizza",
    name: {en: "Double Pepperoni Pizza", ar: "بيتزا بيبروني مزدوجة"},
    description: {
      en: "Double beef pepperoni over tomato sauce.",
      ar: "بيبروني لحم مضاعف على صوص الطماطم.",
    },
    subcategory: "meat-pizza",
    ingredients: ["tomato sauce", "double beef pepperoni", "mozzarella"],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "super-supreme-pizza",
    name: {en: "Super Supreme Pizza", ar: "بيتزا سوبر سوبريم"},
    description: {
      en: "Pepperoni, pure ground beef, mushrooms and more.",
      ar: "بيبروني، لحم مفروم صافي، مشروم، والمزيد.",
    },
    subcategory: "meat-pizza",
    ingredients: [
      "tomato sauce",
      "pepperoni",
      "pure ground beef",
      "fresh mushrooms",
      "mozzarella",
      "onions",
      "green pepper",
      "black olives",
    ],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "pastrami-pizza",
    name: {en: "Pastrami Pizza", ar: "بيتزا باسترمي"},
    description: {
      en: "Sliced pastrami with peppers and olives.",
      ar: "باسترمي شرائح مع الفلفل والزيتون الأسود.",
    },
    subcategory: "meat-pizza",
    ingredients: [
      "tomato sauce",
      "pastrami",
      "mozzarella",
      "green pepper",
      "black olives",
    ],
    sizes: {S: 130, M: 185, L: 260},
  },
  {
    slug: "truffle-burger-pizza",
    name: {en: "Truffle Burger Pizza", ar: "بيتزا ترافل برجر"},
    description: {
      en: "Mini burgers with creamy truffle mayo.",
      ar: "ميني برجر مع صوص مايونيز الترافل الكريمي.",
    },
    subcategory: "meat-pizza",
    ingredients: [
      "tomato sauce",
      "mini burger",
      "mozzarella",
      "fresh mushroom",
      "green pepper",
      "truffle mayo sauce",
    ],
    sizes: {S: 195, M: 280, L: 380},
    isNewItem: true,
  },
  {
    slug: "smoky-burger-pizza",
    name: {en: "Smoky Burger Pizza", ar: "بيتزا برجر سموكي"},
    description: {
      en: "Beef burger with American cheese and smoky sauce.",
      ar: "برجر لحم مع جبنة أمريكية وصوص سموكي.",
    },
    subcategory: "meat-pizza",
    ingredients: [
      "tomato sauce",
      "burger",
      "American cheese",
      "mozzarella",
      "green pepper",
      "pickles",
      "smoky sauce",
    ],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "beijing-pizza",
    name: {en: "Beijing Pizza", ar: "بيتزا بكين"},
    description: {
      en: "Beijing hot dog with barbecue sauce.",
      ar: "هوت دوج بكين مع صوص الباربكيو.",
    },
    subcategory: "meat-pizza",
    ingredients: ["Beijing hot dog", "mozzarella", "barbecue sauce"],
    sizes: {S: 160, M: 220, L: 300},
    isNewItem: true,
  },
  {
    slug: "smoked-pizza",
    name: {en: "Smoked Pizza", ar: "بيتزا مدخنة"},
    description: {
      en: "Smoked beef and turkey over mozzarella.",
      ar: "لحم وديك رومي مدخنان مع الموتزاريلا.",
    },
    subcategory: "meat-pizza",
    ingredients: [
      "tomato sauce",
      "black olives",
      "smoked beef",
      "smoked turkey",
      "mozzarella",
      "green pepper",
    ],
    sizes: {S: 135, M: 195, L: 275},
  },
  {
    slug: "tuna-pizza",
    name: {en: "Tuna Pizza", ar: "بيتزا تونة"},
    description: {
      en: "Tuna, peppers and olives over tomato sauce.",
      ar: "تونة وفلفل وزيتون أسود على صوص الطماطم.",
    },
    subcategory: "seafood-pizza",
    ingredients: [
      "tomato sauce",
      "tuna",
      "mozzarella",
      "green pepper",
      "black olives",
    ],
    sizes: {S: 160, M: 220, L: 300},
  },
  {
    slug: "sea-ranch-pizza",
    name: {en: "Sea Ranch Pizza", ar: "بيتزا سي رانش"},
    description: {
      en: "Shrimp and crab with ranch dressing.",
      ar: "جمبري وكراب مع صوص الرانش.",
    },
    subcategory: "seafood-pizza",
    ingredients: [
      "tomato sauce",
      "shrimp",
      "crab",
      "mozzarella",
      "green pepper",
      "black olives",
      "ranch sauce",
    ],
    sizes: {S: 195, M: 280, L: 380},
  },
];

const SIDES = [
  {
    slug: "fries",
    name: {en: "Fries", ar: "بطاطس مقلية"},
    description: {
      en: "Served with sauce of your choice.",
      ar: "تُقدم مع صوص من اختيارك.",
    },
    price: 55,
  },
  {
    slug: "buffalo-chicken-wings-6-pcs",
    name: {en: "Buffalo Chicken Wings (6 pcs)", ar: "أجنحة بافلو دجاج (6 قطع)"},
    description: {
      en: "Crispy wings tossed in buffalo sauce.",
      ar: "أجنحة مقرمشة مغطاة بصوص البافلو.",
    },
    price: 90,
  },
  {
    slug: "potato-wedges",
    name: {en: "Potato Wedges", ar: "بطاطس ويدجز"},
    description: {
      en: "Golden wedges, served with sauce of your choice.",
      ar: "ويدجز ذهبية تُقدم مع صوص من اختيارك.",
    },
    price: 85,
  },
  {
    slug: "bbq-chicken-wings-6-pcs",
    name: {en: "BBQ Chicken Wings (6 pcs)", ar: "أجنحة باربكيو دجاج (6 قطع)"},
    description: {
      en: "With BBQ sauce, served with ranch dressing.",
      ar: "بصوص الباربكيو، تُقدم مع الرانش.",
    },
    price: 80,
  },
];

const SALADS = [
  {
    slug: "coleslaw",
    name: {en: "Coleslaw", ar: "كول سلو"},
    description: {
      en: "Cabbage, carrots and creamy mayo.",
      ar: "كرنب وجزر مع مايونيز كريمي.",
    },
    price: 35,
  },
  {
    slug: "potato-mayo-salad",
    name: {en: "Potato Mayo Salad", ar: "سلطة بطاطس بالمايونيز"},
    description: {
      en: "Diced potatoes in creamy mayo dressing.",
      ar: "بطاطس مقطعة بصوص المايونيز الكريمي.",
    },
    price: 35,
  },
  {
    slug: "green-bean-salad",
    name: {en: "Green Bean Salad", ar: "سلطة فاصوليا خضراء"},
    description: {
      en: "Green beans with red onion, dill and celery.",
      ar: "فاصوليا خضراء مع بصل أحمر وشبت وكرفس.",
    },
    price: 35,
  },
  {
    slug: "russian-salad",
    name: {en: "Russian Salad", ar: "سلطة روسية"},
    description: {
      en: "Diced potatoes, peas, carrots and sweet corn.",
      ar: "بطاطس مقطعة وبازلاء وجزر وذرة حلوة.",
    },
    price: 40,
  },
];

const DESSERTS = [
  {
    slug: "blue",
    name: {en: "Blue", ar: "بلو"},
    description: {
      en: "Blueberry mille-feuille & milk cake.",
      ar: "ميلفوي التوت الأزرق مع كعكة الحليب.",
    },
    price: 145,
  },
  {
    slug: "razz",
    name: {en: "Razz", ar: "راز"},
    description: {
      en: "Raspberry mille-feuille & milk cake.",
      ar: "ميلفوي التوت الأحمر مع كعكة الحليب.",
    },
    price: 130,
  },
  {
    slug: "choco",
    name: {en: "Choco", ar: "شوكو"},
    description: {
      en: "Brownies with cookie & Belgian chocolate.",
      ar: "براونيز مع كوكيز وشوكولاتة بلجيكية.",
    },
    price: 180,
  },
  {
    slug: "moco",
    name: {en: "Moco", ar: "موكو"},
    description: {
      en: "Mango & coconut tiramisu.",
      ar: "تيراميسو المانجو وجوز الهند.",
    },
    price: 150,
  },
  {
    slug: "lemo",
    name: {en: "Lemo", ar: "ليمو"},
    description: {
      en: "Lemon tiramisu.",
      ar: "تيراميسو الليمون.",
    },
    price: 90,
  },
];

const DRINKS = [
  {
    slug: "orange-juice",
    name: {en: "Orange Juice", ar: "عصير برتقال"},
    description: {
      en: "Chilled orange juice.",
      ar: "عصير برتقال مثلج.",
    },
    price: 40,
  },
  {
    slug: "mango-juice",
    name: {en: "Mango Juice", ar: "عصير مانجو"},
    description: {
      en: "Chilled mango juice.",
      ar: "عصير مانجو مثلج.",
    },
    price: 50,
  },
  {
    slug: "soda-cola-peach-lemon",
    name: {en: "Soda (Cola, Peach, Lemon)", ar: "صودا (كولا، خوخ، ليمون)"},
    description: {
      en: "Chilled soft drink — cola, peach or lemon.",
      ar: "مشروب غازي مثلج — كولا أو خوخ أو ليمون.",
    },
    price: 20,
  },
  {
    slug: "mineral-water-small",
    name: {en: "Mineral Water (small)", ar: "مياه معدنية (صغير)"},
    description: {
      en: "Still mineral water, small bottle.",
      ar: "مياه معدنية غير غازية، عبوة صغيرة.",
    },
    price: 10,
  },
];

const ADDONS = [
  {
    name: {en: "Tuna", ar: "تونة"},
    priceMode: "bySize",
    sizePrices: {S: 30, M: 35, L: 38},
  },
  {
    name: {en: "Mushroom", ar: "مشروم"},
    priceMode: "bySize",
    sizePrices: {S: 30, M: 35, L: 38},
  },
  {
    name: {en: "Meat", ar: "لحم"},
    priceMode: "bySize",
    sizePrices: {S: 32, M: 37, L: 40},
  },
  {
    name: {en: "Cheese", ar: "جبن"},
    priceMode: "bySize",
    sizePrices: {S: 32, M: 37, L: 40},
  },
  {
    name: {en: "Crab", ar: "كراب"},
    priceMode: "bySize",
    sizePrices: {S: 32, M: 37, L: 40},
  },
  {
    name: {en: "Chicken", ar: "دجاج"},
    priceMode: "bySize",
    sizePrices: {S: 32, M: 37, L: 40},
  },
  {
    name: {en: "Jalapeño", ar: "هالبينو"},
    priceMode: "bySize",
    sizePrices: {S: 6, M: 8, L: 10},
  },
  {
    name: {en: "Vegetables", ar: "خضروات"},
    priceMode: "bySize",
    sizePrices: {S: 6, M: 8, L: 10},
  },
  {
    name: {en: "Ranch Sauce", ar: "صوص رانش"},
    priceMode: "flat",
    price: 20,
  },
  {
    name: {en: "BBQ Sauce", ar: "صوص باربكيو"},
    priceMode: "flat",
    price: 20,
  },
  {
    name: {en: "Smoky Sauce", ar: "صوص سموكي"},
    priceMode: "flat",
    price: 20,
  },
];

const SITE_SETTINGS = {
  singletonKey: "site",
  brandName: {en: "PIZZATO", ar: "بيزاتو"},
  logo: {
    url: "/placeholders/brand/logo.svg",
    fileId: null,
    alt: {en: "PIZZATO logo", ar: "شعار بيزاتو"},
  },
  favicon: {
    url: "/placeholders/brand/favicon.svg",
    fileId: null,
    alt: {en: "PIZZATO logo", ar: "شعار بيزاتو"},
  },
  phone: "+201000000000",
  email: "hello@pizzato.eg",
  instagram: "pizzato",
  facebook: "pizzato",
  branches: [
    {
      name: {en: "PIZZATO Cairo", ar: "بيزاتو القاهرة"},
      address: {en: "PIZZATO, Cairo, Egypt", ar: "بيزاتو، القاهرة، مصر"},
      phone: "+201000000000",
      mapUrl: "https://maps.app.goo.gl/EXAMPLE",
    },
  ],
  openingHours: {
    en: "Daily · 12:00 – 02:00",
    ar: "يومياً · 12:00 – 02:00",
  },
  contactMessage: {
    en: "Craving real pizza? Call us to order.",
    ar: "تشتهي بيتزا حقيقية؟ اتصل بنا للطلب.",
  },
  mapEmbedUrl: "",
  mapLatitude: 30.0444,
  mapLongitude: 31.2357,
};

function buildCategoryList() {
  const list = [];

  TOP_LEVEL_CATEGORIES.forEach((category, index) => {
    list.push({
      slug: category.slug,
      name: category.name,
      description: category.description,
      parentSlug: null,
      sortOrder: index,
    });

    (category.children ?? []).forEach((child, childIndex) => {
      list.push({
        slug: child.slug,
        name: child.name,
        description: child.description,
        parentSlug: category.slug,
        sortOrder: childIndex,
      });
    });
  });

  return list;
}

function buildCategoryDocs() {
  return buildCategoryList().map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: true,
    sortOrder: category.sortOrder,
    parent: null,
    image: {
      url: `/placeholders/categories/${category.slug}.svg`,
      fileId: null,
      alt: category.name,
    },
  }));
}

function pizzaMeasuringUnit(sizes) {
  const options = PIZZA_SIZE_KEYS.filter((key) => typeof sizes[key] === "number").map(
    (key, optionIndex) => ({
      name: SIZE_NAMES[key],
      price: sizes[key],
      key,
      isActive: true,
      sortOrder: optionIndex,
    })
  );

  return {unitType: "size", options};
}

const FEATURED_PIZZA_SLUGS = new Set([
  "margherita-pizza",
  "double-pepperoni-pizza",
  "chicken-ranch-pizza",
  "nashville-pizza",
  "truffle-burger-pizza",
  "beijing-pizza",
]);

function buildPizzaDocs() {
  return PIZZAS.map((pizza, index) => {
    const measuringUnit = pizzaMeasuringUnit(pizza.sizes);
    const prices = measuringUnit.options.map((option) => option.price);

    return {
      name: pizza.name,
      slug: pizza.slug,
      description: pizza.description,
      category: pizza.subcategory,
      price: Math.min(...prices),
      isActive: true,
      isAvailable: true,
      isFeatured: FEATURED_PIZZA_SLUGS.has(pizza.slug),
      isNewItem: pizza.isNewItem === true,
      sortOrder: index,
      ingredients: buildIngredients(pizza.ingredients),
      images: [],
      hasMeasuringUnit: true,
      measuringUnit,
    };
  });
}

function buildSimpleProductDocs(products, categorySlug) {
  return products.map((product, index) => ({
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: categorySlug,
    price: product.price,
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isNewItem: false,
    sortOrder: index,
    ingredients: [],
    images: [],
    hasMeasuringUnit: false,
    measuringUnit: {unitType: "size", options: []},
  }));
}

function buildAddOnDocs() {
  return ADDONS.map((addOn, index) => ({
    name: addOn.name,
    priceMode: addOn.priceMode,
    price: addOn.priceMode === "flat" ? addOn.price : null,
    sizePrices:
      addOn.priceMode === "bySize" ? addOn.sizePrices : {S: null, M: null, L: null},
    isActive: true,
    sortOrder: index,
  }));
}

async function main() {
  loadEnv();

  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error(
      "MONGODB_URI is not defined. Load an .env.local or .env file with MONGODB_URI and try again."
    );
    process.exit(1);
  }

  try {
    const {connectDB} = await import("../src/lib/db.js");
    await connectDB();

    const categoryList = buildCategoryList();
    const activeCategorySlugs = new Set(categoryList.map((category) => category.slug));
    const categoryPlaceholders = categoryList.map((category) => ({
      path: `public/placeholders/categories/${category.slug}.svg`,
      svg: svgPlaceholder({title: category.name.en, subtitle: category.name.ar}),
    }));

    const writtenFiles = createPlaceholders(categoryPlaceholders);
    const removedFiles = removeUnusedPlaceholders(activeCategorySlugs);
    console.log(
      `Placeholder images ready (${writtenFiles.length} new, rest already exist).`
    );
    if (removedFiles.length > 0) {
      console.log(`Removed ${removedFiles.length} unused placeholder image(s).`);
    }

    await Promise.all([
      AddOn.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      SiteSettings.deleteMany({}),
    ]);

    const categoryDocs = buildCategoryDocs();
    const insertedCategories = await Category.insertMany(categoryDocs);
    const categoryMap = new Map(
      insertedCategories.map((category) => [category.slug, category._id])
    );

    const childParentPairs = categoryList
      .filter((category) => category.parentSlug !== null)
      .map((category) => ({
        _id: categoryMap.get(category.slug),
        parent: categoryMap.get(category.parentSlug),
      }));

    for (const pair of childParentPairs) {
      if (!pair._id || !pair.parent) {
        throw new Error("Category parent reference could not be resolved.");
      }
      await Category.updateOne({_id: pair._id}, {$set: {parent: pair.parent}});
    }

    const replaceCategoryRefs = (docs) =>
      docs.map((doc) => ({...doc, category: categoryMap.get(doc.category)}));

    const pizzaDocs = buildPizzaDocs();
    const sidesDocs = buildSimpleProductDocs(SIDES, "sides");
    const saladsDocs = buildSimpleProductDocs(SALADS, "salads");
    const dessertsDocs = buildSimpleProductDocs(DESSERTS, "desserts");
    const drinksDocs = buildSimpleProductDocs(DRINKS, "drinks");

    const allProductDocs = replaceCategoryRefs([
      ...pizzaDocs,
      ...sidesDocs,
      ...saladsDocs,
      ...dessertsDocs,
      ...drinksDocs,
    ]);

    if (allProductDocs.some((doc) => !doc.category)) {
      throw new Error("One or more products reference an unknown category.");
    }

    const insertedProducts = await Product.insertMany(allProductDocs);

    const addOnDocs = buildAddOnDocs();
    const insertedAddOns = await AddOn.insertMany(addOnDocs);

    await SiteSettings.create(SITE_SETTINGS);

    const byCategory = (slug) =>
      insertedProducts.filter((product) => String(product.category) === String(categoryMap.get(slug))).length;

    console.log(`\nSeeded ${insertedCategories.length} categories (5 top-level + 1 add-ons + 5 pizza subcategories).`);
    console.log(`\nSeeded ${pizzaDocs.length} pizzas (${pizzaDocs.filter((p) => p.isNewItem).length} isNewItem):`);
    console.log(`  Vegetarian: ${byCategory("vegetarian-pizza")}`);
    console.log(`  Cheese:      ${byCategory("cheese-pizza")}`);
    console.log(`  Chicken:     ${byCategory("chicken-pizza")}`);
    console.log(`  Meat:        ${byCategory("meat-pizza")}`);
    console.log(`  Seafood:     ${byCategory("seafood-pizza")}`);
    console.log(`Seeded ${sidesDocs.length} sides.`);
    console.log(`Seeded ${saladsDocs.length} salads.`);
    console.log(`Seeded ${dessertsDocs.length} desserts.`);
    console.log(`Seeded ${drinksDocs.length} drinks.`);
    console.log(
      `Seeded ${insertedAddOns.length} add-ons (${insertedAddOns.filter((a) => a.priceMode === "bySize").length} bySize, ${insertedAddOns.filter((a) => a.priceMode === "flat").length} flat).`
    );
    console.log(`\nTotal products: ${insertedProducts.length}.`);
    console.log("Seeded site settings.");
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`Seed failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});