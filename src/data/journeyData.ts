export interface SimpleFraction {
  num: number;
  den: number;
}

export interface GovernorateStop {
  id: string;
  order: number;
  governorateName: string;
  shortName: string;
  cityOrLandmark: string;
  searchQuery: string;
  heritageHighlights: string[];
  heritageSummary: string;
  lessonElement: string;
  strategy: string;
  objectivesCodes: string[];
  mapPos: { x: number; y: number };
  landmarkType: 'dhow' | 'dunes' | 'opera' | 'fort' | 'coast' | 'tombs' | 'frankincense' | 'fjords';
}

export const LESSON_STEPS_RULES: string[] = [
  '١) إذا كانت قيم المقام متساوية، فاجمع أو اطرح الأعداد الموجودة في البسط فقط.',
  '٢) إذا كانت قيم المقام غير متساوية، فاكتب الكسور المتكافئة للكسرين بحيث تحتوي على نفس المقام ثم اجمع أو اطرح قيم البسط فقط.',
  '٣) ضع الناتج في أبسط صورة.',
  '٤) إذا كان الناتج عبارة عن كسر غير اعتيادي، فاكتبه في صورة عدد كسري.',
];

export const SUCCESS_CRITERIA = [
  {
    code: '٧Nf٥',
    title: 'جمع وطرح الكسور البسيطة',
    description: 'أستطيع أن أجمع وأطرح الكسور البسيطة، وأكتب الناتج في أبسط صورة أو عدد كسري.',
  },
  {
    code: '٧Ps٣',
    title: 'الاستقصاء المنطقي',
    description: 'أستطيع أن أستقصي المشكلات بطريقة منطقية وأتوصل إلى استنتاجات بسيطة.',
  },
  {
    code: '٧Pt٧',
    title: 'حل المشكلات اللفظية',
    description: 'أستطيع أن أحل المشكلات اللفظية في مجموعة من السياقات المختلفة.',
  },
];

export const TEACHER_NOTES = {
  commonErrors: [
    'من الأخطاء الشائعة جمع البسط والمقام معاً.',
    'استخدم المخططات للتوضيح للطلاب أن ١/٢ + ١/٣ = ٥/٦ وليس ٢/٥.',
  ],
  problemSolvingSummary: [
    'يتم التركيز على هدف حل المشكلات ٧Ps٣: «يعمل بطريقة منطقية ويتوصل إلى استنتاجات بسيطة» في نشاط عائشة (كتاب النشاط ص ٨٠ رقم ٦).',
    'يتم التركيز على هدفي حل المشكلات ٧Pt٧: «يحل المسائل الكلامية التي تتضمن الأعداد الكاملة أو النسب المئوية أو الأعداد العشرية أو النقود أو القياسات» و٧Ps٣ في السؤال ٤ من التمرين الختامي.',
  ],
  resources: [
    'بطاقات',
    'كتاب الطالب',
    'كتاب النشاط',
    'السبورات البيضاء',
    'ورقة المصادر (٤-٦)',
  ],
};

export const JOURNEY_STOPS: GovernorateStop[] = [
  {
    id: 'south-sharqiyah',
    order: 1,
    governorateName: 'محافظة جنوب الشرقية',
    shortName: 'جنوب الشرقية',
    cityOrLandmark: 'صور ورأس الحد',
    searchQuery: 'صور، محافظة جنوب الشرقية، سلطنة عُمان',
    heritageHighlights: ['صناعة السفن التقليدية', 'محمية السلاحف برأس الحد', 'قلهات التاريخية'],
    heritageSummary:
      'نقطة انطلاق الرحلة من ولاية صور العريقة المشهورة بصناعة السفن الشراعية، ومحمية السلاحف برأس الحد، ومدينة قلهات المطلة على بحر العرب.',
    lessonElement: 'التمهيد والتعلم القبلي والمفاهيم',
    strategy: 'الحوار والمناقشة الجماعي',
    objectivesCodes: ['٧Nf٥'],
    mapPos: { x: 432, y: 185 },
    landmarkType: 'dhow',
  },
  {
    id: 'north-sharqiyah',
    order: 2,
    governorateName: 'محافظة شمال الشرقية',
    shortName: 'شمال الشرقية',
    cityOrLandmark: 'بدية وإبراء',
    searchQuery: 'إبراء، محافظة شمال الشرقية، سلطنة عُمان',
    heritageHighlights: ['رمال الشرقية الذهبية', 'الأفلاج والواحات', 'الأسواق التراثية'],
    heritageSummary:
      'تمتاز برمال الشرقية الذهبية في ولاية بدية، والواحات الخضراء التي ترويها الأفلاج العُمانية، والأسواق التراثية في إبراء.',
    lessonElement: 'النشاط الافتتاحي الجماعي (النشاط الأساسي)',
    strategy: 'المناقشة + طرح الأسئلة',
    objectivesCodes: ['٧Nf٥'],
    mapPos: { x: 372, y: 170 },
    landmarkType: 'dunes',
  },
  {
    id: 'muscat',
    order: 3,
    governorateName: 'محافظة مسقط',
    shortName: 'مسقط',
    cityOrLandmark: 'مسقط ومطرح',
    searchQuery: 'مسقط، سلطنة عُمان',
    heritageHighlights: ['قلعتا الجلالي والميراني', 'سوق مطرح', 'دار الأوبرا السلطانية'],
    heritageSummary:
      'عاصمة السلطنة العامرة، وتشتهر بقلعتي الجلالي والميراني، وقصر العلم، وسوق مطرح التراثي المطل على البحر.',
    lessonElement: 'مثال وتطبيق جماعي (كتاب الطالب ص ١١٣)',
    strategy: 'المناقشة + رفع اليدين',
    objectivesCodes: ['٧Nf٥'],
    mapPos: { x: 358, y: 112 },
    landmarkType: 'opera',
  },
  {
    id: 'batinah',
    order: 4,
    governorateName: 'محافظتا شمال وجنوب الباطنة',
    shortName: 'الباطنة',
    cityOrLandmark: 'صحار والرستاق',
    searchQuery: 'صحار، سلطنة عُمان',
    heritageHighlights: ['قلعة الرستاق وحصن الحزم', 'السهل الساحلي الخصيب', 'ميناء صحار التاريخي'],
    heritageSummary:
      'تجمع بين الساحل الخصيب والمزارع الغنّاء، وتضم قلعة الرستاق وعين الكسفة وحصن الحزم وميناء صحار العريق.',
    lessonElement: 'تمرين جماعي / ثنائي (السبورات البيضاء)',
    strategy: 'التعلم بالأقران + التعلم التعاوني',
    objectivesCodes: ['٧Nf٥', '٧Ps٣'],
    mapPos: { x: 266, y: 84 },
    landmarkType: 'coast',
  },
  {
    id: 'musandam',
    order: 5,
    governorateName: 'محافظة مسندم',
    shortName: 'مسندم',
    cityOrLandmark: 'خصب والخلجان البحرية',
    searchQuery: 'خصب، محافظة مسندم، سلطنة عُمان',
    heritageHighlights: ['الخلجان البحرية الشاهقة', 'جبل حارم', 'حصن خصب'],
    heritageSummary:
      'شمال السلطنة الساحر بخلجانه البحرية التي تشبه المضايق الصخرية، وجبل حارم الشامخ، وحصن خصب المطل على الخليج.',
    lessonElement: 'نشاط فردي — تمرين (١): أخبر زميل وتقويم الخطأ الشائع',
    strategy: 'المناقشة + السبورة البيضاء + الأنشطة الفردية',
    objectivesCodes: ['٧Nf٥', '٧Ps٣'],
    mapPos: { x: 248, y: 34 },
    landmarkType: 'fjords',
  },
  {
    id: 'dhahirah',
    order: 6,
    governorateName: 'محافظة الظاهرة',
    shortName: 'الظاهرة',
    cityOrLandmark: 'عبري ومقابر بات',
    searchQuery: 'عبري، محافظة الظاهرة، سلطنة عُمان',
    heritageHighlights: ['مقابر بات الأثرية', 'حصن عبري', 'الأودية والواحات الصحراوية'],
    heritageSummary:
      'بوابة التاريخ القديم بمقابر بات والخطم والعين المدرجة في التراث العالمي، وحصن عبري العريق.',
    lessonElement: 'نشاط فردي — تمرين (٢) وبطاقة الخروج',
    strategy: 'تقويم تحقق معايير النجاح الفردي',
    objectivesCodes: ['٧Nf٥', '٧Ps٣'],
    mapPos: { x: 222, y: 126 },
    landmarkType: 'tombs',
  },
  {
    id: 'dakhiliyah',
    order: 7,
    governorateName: 'محافظة الداخلية',
    shortName: 'الداخلية',
    cityOrLandmark: 'نزوى والجبل الأخضر',
    searchQuery: 'نزوى، محافظة الداخلية، سلطنة عُمان',
    heritageHighlights: ['قلعة نزوى الشهباء', 'الجبل الأخضر', 'جبل شمس وفلج دارس'],
    heritageSummary:
      'عاصمة الثقافة والتاريخ في نزوى بقلعتها المستديرة الشامخة، ومدرجات الجبل الأخضر، وأعلى قمم جبال الحجر.',
    lessonElement: 'تفريد التعليم (نشاط علاجي + نشاط إثرائي)',
    strategy: 'تفريد التعليم حسب مستوى الطالب',
    objectivesCodes: ['٧Nf٥', '٧Ps٣'],
    mapPos: { x: 306, y: 158 },
    landmarkType: 'fort',
  },
  {
    id: 'dhofar',
    order: 8,
    governorateName: 'محافظة ظفار',
    shortName: 'ظفار',
    cityOrLandmark: 'صلالة ووادي دربات',
    searchQuery: 'صلالة، محافظة ظفار، سلطنة عُمان',
    heritageHighlights: ['موسم الخريف الأخضر', 'أرض اللبان التاريخية', 'وادي دربات والمغسيل'],
    heritageSummary:
      'لؤلؤة الجنوب التي تكتسي بالخضرة والضباب في موسم الخريف، وموطن شجرة اللبان العريقة وشلالات وادي دربات.',
    lessonElement: 'التقويم الختامي والواجب المنزلي',
    strategy: 'حل المشكلات والتقويم الختامي',
    objectivesCodes: ['٧Pt٧', '٧Ps٣'],
    mapPos: { x: 140, y: 404 },
    landmarkType: 'frankincense',
  },
];

// بيانات المسائل المطابقة تماماً للتحضير المرفق
export const WARMUP_SIMPLIFY = [
  { id: 'a', label: 'أ', num: 2, den: 10, ansNum: 1, ansDen: 5 },
  { id: 'b', label: 'ب', num: 15, den: 25, ansNum: 3, ansDen: 5 },
  { id: 'c', label: 'ج', num: 6, den: 9, ansNum: 2, ansDen: 3 },
];

export const WARMUP_EQUIVALENT = [
  {
    id: 'eq-a',
    label: 'أ',
    givenLeft: { num: 4, den: 10 },
    targetDen: 5,
    opText: '÷ ٢',
    ansNum: 2,
  },
  {
    id: 'eq-b',
    label: 'ب',
    givenLeft: { num: 9, den: 12 },
    targetDen: 4,
    opText: '÷ ٣',
    ansNum: 3,
  },
];

export const TEXTBOOK_113_EXAMPLES = [
  {
    id: 'ex-a',
    label: 'أ',
    left: { num: 1, den: 5 },
    op: '+' as const,
    right: { num: 3, den: 5 },
    ansWhole: 0,
    ansNum: 4,
    ansDen: 5,
    explanation: 'المقامان متساويان (٥)، نجمع البسطين فقط: ١ + ٣ = ٤، فيكون الناتج ٤/٥.',
  },
  {
    id: 'ex-b',
    label: 'ب',
    left: { num: 5, den: 8 },
    op: '+' as const,
    right: { num: 11, den: 16 },
    ansWhole: 1,
    ansNum: 5,
    ansDen: 16,
    improperNum: 21,
    improperDen: 16,
    explanation: 'نوحد المقامين إلى ١٦: ٥/٨ = ١٠/١٦، ثم ١٠/١٦ + ١١/١٦ = ٢١/١٦، وبصورة عدد كسري يساوي ١ ٥/١٦.',
  },
  {
    id: 'ex-c',
    label: 'ج',
    left: { num: 5, den: 7 },
    op: '-' as const,
    right: { num: 2, den: 7 },
    ansWhole: 0,
    ansNum: 3,
    ansDen: 7,
    explanation: 'المقامان متساويان (٧)، نطرح البسطين فقط: ٥ - ٢ = ٣، فيكون الناتج ٣/٧.',
  },
  {
    id: 'ex-d',
    label: 'د',
    left: { num: 5, den: 6 },
    op: '-' as const,
    right: { num: 11, den: 18 },
    ansWhole: 0,
    ansNum: 2,
    ansDen: 9,
    unsimplifiedNum: 4,
    unsimplifiedDen: 18,
    explanation: 'نوحد المقامين إلى ١٨: ٥/٦ = ١٥/١٨، ثم ١٥/١٨ - ١١/١٨ = ٤/١٨، وبالتبسيط (÷٢) يساوي ٢/٩.',
  },
];

export const FORMATIVE_EX1_ITEMS = [
  {
    id: 'f-1',
    label: 'د',
    prompt: '١/٢ + ١/٣',
    left: { num: 1, den: 2 },
    op: '+' as const,
    right: { num: 1, den: 3 },
    commonMistake: '٢/٥ (خطأ جمع البسط والمقام!)',
    ansNum: 5,
    ansDen: 6,
    explanation: 'المقام المشترك هو ٦: ١/٢ = ٣/٦ و ١/٣ = ٢/٦، إذن ٣/٦ + ٢/٦ = ٥/٦ وليس ٢/٥.',
  },
  {
    id: 'f-2',
    label: 'هـ',
    prompt: '٥/٨ + ١/٤',
    left: { num: 5, den: 8 },
    op: '+' as const,
    right: { num: 1, den: 4 },
    commonMistake: '٦/١٢ (خطأ جمع البسط والمقام!)',
    ansNum: 7,
    ansDen: 8,
    explanation: 'نوحد المقام إلى ٨: ١/٤ = ٢/٨، ثم نجمع البسطين: ٥/٨ + ٢/٨ = ٧/٨.',
  },
  {
    id: 'f-3',
    label: 'ز',
    prompt: '٨/١٥ - ٣/١٥',
    left: { num: 8, den: 15 },
    op: '-' as const,
    right: { num: 3, den: 15 },
    commonMistake: 'ترك ٥/١٥ دون تبسيط إلى أبسط صورة',
    ansNum: 1,
    ansDen: 3,
    explanation: 'المقامان متساويان (١٥): ٨ - ٣ = ٥ ← ٥/١٥، ثم نبسط بقسمة البسط والمقام على ٥ لنحصل على ١/٣.',
  },
];
