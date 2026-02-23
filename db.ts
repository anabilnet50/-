import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataPath = process.env.DATA_PATH || process.cwd();
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const db = new Database(path.join(dataPath, 'news.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    image_url TEXT,
    video_url TEXT,
    author TEXT DEFAULT 'صلاح حيدرة',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_urgent INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    tags TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles (id)
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add views and tags if they don't exist (for existing databases)
try {
  db.exec("ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0");
} catch (e) { }
try {
  db.exec("ALTER TABLE articles ADD COLUMN tags TEXT");
} catch (e) { }
try {
  db.exec("ALTER TABLE articles ADD COLUMN video_url TEXT");
} catch (e) { }


// Ensure all required categories exist (by slug)
const ensureCategories = [
  { name: 'عام', slug: 'general' },
  { name: 'اقتصاد', slug: 'economy' },
  { name: 'سياحة', slug: 'tourism' },
  { name: 'رياضة', slug: 'sports' },
  { name: 'تكنولوجيا', slug: 'tech' },
  { name: 'حقوق وحريات', slug: 'rights' },
  { name: 'مقالات', slug: 'opinion' },
  { name: 'هاشتاج', slug: 'hashtag' },
];

for (const cat of ensureCategories) {
  const exists = db.prepare("SELECT id FROM categories WHERE slug = ?").get(cat.slug);
  if (!exists) {
    db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(cat.name, cat.slug);
  }
}

// Helper: get category id by slug
function getCatId(slug: string): number {
  const row = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as any;
  return row?.id;
}

// Ensure demo articles exist for each category (looked up by slug, not hardcoded ID)
const demoBySlug = [
  {
    slug: 'general',
    articles: [
      { title: 'عاجل: وفد الشيخ يغادر صنعاء دون اللقاء بالوفد الوطني', content: 'تفاصيل الخبر هنا... كشفت مصادر ميدانية إصابة عدد من الجنود في اشتباكات مسلحة بين قوات هادي والقوات التابعة للحوثيين في جبهة الوازعية بتعز وسط غارات مكثفة شنتها مقاتلات التحالف العربي.', image: 'https://picsum.photos/seed/yemen/1000/500', urgent: 1 },
      { title: 'أجراس | صعدة: اشتباكات في الوازعية', content: 'كشفت مصادر ميدانية إصابة عدد من الجنود في اشتباكات مسلحة بين قوات هادي والقوات التابعة للحوثيين في جبهة الوازعية بتعز.', image: 'https://picsum.photos/seed/soldier1/400/300', urgent: 0 },
      { title: 'أجراس | تعز: هدوء حذر في جبهات القتال', content: 'كشفت مصادر ميدانية إصابة عدد من الجنود في اشتباكات مسلحة بين قوات هادي والقوات التابعة للحوثيين في جبهة الوازعية بتعز.', image: 'https://picsum.photos/seed/soldier2/400/300', urgent: 0 },
      { title: 'تعز: مسيرة جماهيرية حاشدة تنديداً بتدهور الأوضاع المعيشية', content: 'شهدت مدينة تعز اليوم مسيرة جماهيرية حاشدة جابت شوارع المدينة تنديداً بتدهور الأوضاع المعيشية وانهيار العملة الوطنية.', image: 'https://picsum.photos/seed/taiz1/400/300', urgent: 0 },
    ]
  },
  {
    slug: 'rights',
    articles: [
      { title: 'حقوقي: رصد انتهاكات جسيمة في مناطق التماس بتعز', content: 'أفاد تقرير حقوقي صادر عن منظمة محلية برصد عشرات الانتهاكات الجسيمة ضد المدنيين في مناطق التماس بمدينة تعز.', image: 'https://picsum.photos/seed/rights1/400/300', urgent: 0 },
      { title: 'منظمة حقوقية توثق 200 انتهاك خلال الشهر الماضي', content: 'رصدت منظمة حقوقية مستقلة أكثر من مئتي انتهاك طال مدنيين في مختلف المناطق خلال الشهر الماضي، وطالبت بفتح تحقيقات دولية.', image: 'https://picsum.photos/seed/rights2/400/300', urgent: 0 },
    ]
  },
  {
    slug: 'sports',
    articles: [
      { title: 'المنتخب الوطني للناشئين يبدأ معسكره التدريبي في عدن', content: 'بدأ المنتخب الوطني للناشئين لكرة القدم اليوم معسكره التدريبي الداخلي في مدينة عدن.', image: 'https://picsum.photos/seed/sports1/400/300', urgent: 0 },
      { title: 'نادي الوحدة يفوز في دوري الأبطال العربية بنتيجة كبيرة', content: 'حقق نادي الوحدة اليمني انتصاراً كبيراً في منافسات دوري الأبطال العربية أمام منافسه بهدفين نظيفين.', image: 'https://picsum.photos/seed/sports2/400/300', urgent: 0 },
    ]
  },
  {
    slug: 'tourism',
    articles: [
      { title: 'افتتاح معرض الصور الفوتوغرافية "ملامح من اليمن" في سيئون', content: 'افتتح اليوم في مدينة سيئون معرض الصور الفوتوغرافية الذي ينظمه اتحاد المصورين العرب.', image: 'https://picsum.photos/seed/tourism1/400/300', urgent: 0 },
      { title: 'جزيرة سقطرى تستعيد بريقها السياحي بعد سنوات من الانقطاع', content: 'تشهد جزيرة سقطرى اليمنية عودة تدريجية للسياحة الدولية بعد سنوات من الانقطاع بسبب الحرب.', image: 'https://picsum.photos/seed/socotra/400/300', urgent: 0 },
    ]
  },
  {
    slug: 'opinion',
    articles: [
      { title: 'تحليل رصين للتحولات الجيوسياسية في اليمن والمنطقة', content: 'في ظل التغيرات المتسارعة التي تشهدها المنطقة، يبرز الدور اليمني كمحور أساسي في صياغة التحالفات المستقبلية.', image: 'https://picsum.photos/seed/opinion1/400/300', urgent: 0 },
      { title: 'أبعاد التنمية المستدامة في ظل التحديات الحالية', content: 'كيف يمكن بناء اقتصاد مستدام عندما تكون البنية التحتية منهكة؟ هذا المقال يستعرض حلولاً مبتكرة للنهوض بالواقع الاقتصادي.', image: 'https://picsum.photos/seed/opinion2/400/300', urgent: 0 },
      { title: 'مستقبل التعليم: من التلقين إلى الابتكار', content: 'ضرورة تحديث المناهج لتتواكب مع متطلبات العصر الرقمي وبناء جيل قادر على المنافسة في سوق العمل العالمي.', image: 'https://picsum.photos/seed/opinion3/400/300', urgent: 0 },
      { title: 'دور الشباب في صناعة التغيير الاجتماعي', content: 'الشباب ليسوا فقط قادة المستقبل، بل هم شركاء الحاضر الأساسيين في أي تنمية حقيقية.', image: 'https://picsum.photos/seed/opinion4/400/300', urgent: 0 },
      { title: 'أزمة المناخ وتأثيراتها المحلية', content: 'تغير المناخ ظاهرة عالمية لكن تأثيراتها تلامس واقعنا المحلي بشكل مباشر ويجب الاستعداد لها.', image: 'https://picsum.photos/seed/opinion5/400/300', urgent: 0 }
    ]
  },
  {
    slug: 'studies',
    articles: [
      { title: 'دراسة استشرافية حول مستقبل الاقتصاد الرقمي اليمني', content: 'تستشرف هذه الدراسة آفاق النمو في قطاع تكنولوجيا المعلومات والفرص المتاحة للشركات الناشئة.', image: 'https://picsum.photos/seed/study1/400/300', urgent: 0 },
      { title: 'توثيق التراث الثقافي: رؤية أكاديمية للحفاظ على الهوية', content: 'ورقة بحثية تناقش أهمية استخدام التكنولوجيا الحديثة في توثيق وحماية التراث المعماري والثقافي.', image: 'https://picsum.photos/seed/study2/400/300', urgent: 0 },
      { title: 'أثر التغيرات المناخية على القطاع الزراعي المحلي', content: 'بحث معمق يحلل تراجع الإنتاج الزراعي في السنوات الأخيرة وعلاقته بتبدل المواسم وأنماط هطول الأمطار.', image: 'https://picsum.photos/seed/study3/400/300', urgent: 0 },
      { title: 'تطور الصحافة الإلكترونية في العقد الأخير', content: 'دراسة تحليلية تقارن بين الصحافة الورقية والإلكترونية وتأثير الأخيرة على تشكيل الرأي العام.', image: 'https://picsum.photos/seed/study4/400/300', urgent: 0 },
      { title: 'الذكاء الاصطناعي في خدمة الرعاية الصحية', content: 'تسلط هذه الدراسة الضوء على التطبيقات الحالية للذكاء الاصطناعي في تشخيص الأمراض وتحسين جودة الرعاية.', image: 'https://picsum.photos/seed/study5/400/300', urgent: 0 }
    ]
  },
  {
    slug: 'economy',
    articles: [
      { title: 'تقرير: نمو ملحوظ في استخدام الدفع الإلكتروني باليمن', content: 'كشف تقرير اقتصادي حديث عن نمو ملحوظ في استخدام خدمات الدفع الإلكتروني والمحافظ الرقمية في اليمن.', image: 'https://picsum.photos/seed/economy1/400/300', urgent: 0 },
      { title: 'الريال اليمني يشهد تحسناً نسبياً أمام العملات الأجنبية', content: 'سجّل الريال اليمني تحسناً نسبياً في مقابل العملات الأجنبية هذا الأسبوع وسط توقعات بمزيد من الاستقرار.', image: 'https://picsum.photos/seed/economy2/400/300', urgent: 0 },
    ]
  },
  {
    slug: 'tech',
    articles: [
      { title: 'منصات التواصل الاجتماعي تشهد إقبالاً غير مسبوق من اليمنيين', content: 'كشفت إحصائيات حديثة عن ارتفاع ملحوظ في أعداد اليمنيين المستخدمين لمنصات التواصل الاجتماعي خلال العام الحالي.', image: 'https://picsum.photos/seed/tech1/400/300', urgent: 0 },
      { title: 'تقرير: نمو ملحوظ في استخدام الدفع الإلكتروني باليمن', content: 'كشف تقرير اقتصادي حديث عن نمو ملحوظ في استخدام خدمات الدفع الإلكتروني.', image: 'https://picsum.photos/seed/tech2/400/300', urgent: 0 },
    ]
  },
];

{
  const checkByTitle = db.prepare('SELECT id FROM articles WHERE title = ?');
  const insertArt = db.prepare('INSERT INTO articles (title, content, category_id, image_url, is_urgent) VALUES (?, ?, ?, ?, ?)');
  for (const group of demoBySlug) {
    const catId = getCatId(group.slug);
    if (!catId) continue;
    for (const art of group.articles) {
      const exists = checkByTitle.get(art.title);
      if (!exists) {
        insertArt.run(art.title, art.content, catId, art.image, art.urgent);
      }
    }
  }
}

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
insertSetting.run('wisdom_right', 'الحرية شمس يجب أن تشرق في كل نفس.');
insertSetting.run('wisdom_left', 'العلم يبني بيوتاً لا عماد لها، والجهل يهدم بيت العز والكرم.');


export default db;

