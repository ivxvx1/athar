/* ==========================================================
   ATHAR | Bilingual strings and the language switch
   ----------------------------------------------------------
   How this file works:
   1. The STRINGS object holds every piece of text on the site under a
      single key, in Arabic and English.
   2. Every element in the HTML carries data-i18n="key".
   3. setLang() walks all of those elements and swaps their text.

   Two rules that are never broken:
   - Arabic is always the default. The browser language is never read.
   - The chosen language is never persisted. No localStorage, no cookies.
     Reloading the page returns it to Arabic, and that is deliberate:
     the victim's device may be monitored, so no trace may survive.

   SECURITY NOTE: every string in this file is authored here. None of it
   comes from user input, which is why the small number of innerHTML
   assignments in setLang() are safe. Anything the user types is rendered
   with textContent or escaped explicitly in athar.js.
   ========================================================== */

const STRINGS = {

  /* ======================= Arabic ======================= */
  ar: {
    /* --- Identity and navigation --- */
    'brand.name':      'أثر',
    'brand.tagline':   'احفظي الأثر قبل أن يزول',
    'nav.tool':        'توثيق ملف',
    'nav.about':       'عن المنصة',
    'nav.firstHour':   'الساعة الأولى',
    'nav.verify':      'التحقق من بصمة',
    'lang.toggle':     'EN',
    'lang.aria':       'Switch to English',
    'skip':            'تخطّي إلى المحتوى',
    'urgent.bar':      'ما لا يجب فعله الآن ←',
    'foot.note':       'أثر · أداة حفظ وفرز أولي، وليست جهة تحقيق ولا مصدر استشارة قانونية.',
    'foot.local':      'كل ما يجري في هذه الصفحة يجري داخل متصفحك وحده.',

    /* --- Tab titles, deliberately neutral so a passer-by learns nothing --- */
    'title.home':      'أثر · توثيق ملف',
    'title.about':     'أثر · عن المنصة',
    'title.firstHour': 'أثر · الساعة الأولى',
    'title.verify':    'أثر · التحقق من بصمة',
    'meta.home':       'أداة تحفظ الأدلة الرقمية داخل متصفحك. لا يغادر ملفك جهازك.',
    'meta.about':      'كيف تعمل أثر، ولماذا لا يوجد حساب ولا خادم، وما الذي لا تفعله المنصة.',
    'meta.firstHour':  'ما لا يجب فعله في الساعة الأولى، وقائمة الأدلة الناقصة.',
    'meta.verify':     'تحققي من أن ملفًا ما زال مطابقًا لبصمته الرقمية.',

    /* --- Home page --- */
    'home.title':      'أسقطي الملف هنا',
    'home.sub':        'لن يغادر جهازك. لا حساب ولا تسجيل.',
    'drop.main':       'اسحبي الملف إلى هنا',
    'drop.sub':        'أو اضغطي لاختياره من جهازك',
    'drop.hint':       'صورة، لقطة شاشة، تسجيل صوتي، فيديو، أو محادثة محفوظة',
    'drop.aria':       'اختاري ملفًا لتوثيقه',
    'drop.busy':       'جارٍ حساب البصمة داخل متصفحك…',
    'drop.busyBig':    'الملف كبير، وقد يستغرق بضع ثوانٍ. لا تُغلقي الصفحة.',

    /* --- Error messages: explain what happened and how to fix it --- */
    'error.title':     'تعذّر التوثيق',
    'error.noCrypto':  'متصفحك لا يتيح حساب البصمة في هذا الوضع. افتحي الموقع عبر رابط https بدل فتح الملف مباشرة من الجهاز، أو جرّبي متصفحًا حديثًا.',
    'error.read':      'تعذّرت قراءة الملف حتى نهايته. تأكدي أن الملف لم يُنقل أو يُحذف أثناء القراءة، ثم أعيدي إسقاطه.',
    'error.empty':     'هذا الملف فارغ، لا يحتوي أي بايت. اختاري ملفًا آخر.',
    'error.zipLib':    'تعذّر تحميل أداة ضغط الملفات لأن الاتصال بالإنترنت انقطع. أعيدي تحميل الصفحة وأنتِ متصلة، ثم أعيدي إسقاط الملف.',
    'error.zipMake':   'تعذّر إنشاء الحزمة. الملف قد يكون أكبر من قدرة ذاكرة المتصفح. جرّبي متصفحًا على حاسوب بدل الهاتف.',

    /* --- Fingerprint --- */
    /* Benefit first, then the mechanism, then the technical term last */
    'hash.label':      'بصمة ملفك',
    'hash.caption':    'احتفظي بهذا السطر. هو ما يُثبت لاحقًا أن ملفك لم يتغيّر: لو حُسب مرة أخرى بعد شهر وتطابق، فالملف هو نفسه ولم يُمسّ.',
    'hash.tech':       'تقنيًا: خوارزمية SHA-256 تقرأ محتوى الملف وتُنتج هذه الخانات الـ64. تغيير أصغر شيء في الملف يقلبها بالكامل.',
    'btn.copy':        'نسخ البصمة',
    'btn.copied':      'تم النسخ',
    'btn.copyFail':    'انسخيها يدويًا من السطر أعلاه',

    /* --- File and timeline --- */
    'file.label':      'ملفك، ومتى وثّقتِه',
    'file.intro':      'هذه بطاقة ملفك: ما هو، ومتى وُثّق بالضبط. لحظة التوثيق هذه هي المرجع الذي يُقارَن به لاحقًا.',
    'f.ref':           'مرجع الحالة',
    'f.name':          'اسم الملف',
    'f.size':          'الحجم',
    'f.type':          'النوع',
    'f.deviceDate':    'تاريخ الملف على جهازك',
    'f.documentedAt':  'لحظة التوثيق في أثر',
    'f.gap':           'المدة بين التاريخين',
    'f.typeUnknown':   'غير محدد',
    'note.deviceDate': '<strong>عن تاريخ الملف:</strong> مأخوذ من نظام التشغيل على جهازك، وهو قابل للتعديل، ويُعرض للاسترشاد لا للإثبات. أما لحظة التوثيق فمسجّلة الآن.',
    'note.imagesOnly': '<strong>ملاحظة:</strong> تم حفظ الملف وتوثيقه بالكامل. الفحص التقني المتعمق متاح حاليًا للصور فقط.',

    /* --- Descriptive technical indicators, images only --- */
    'tech.label':      'ماذا وجدنا مكتوبًا داخل الصورة',
    'tech.intro':      'كل صورة تحمل بداخلها معلومات كتبها الجهاز أو البرنامج الذي أنتجها. نقرأها ونعرضها كما هي، لأنها قد تفيد المحقق.',
    'tech.dims':       'أبعاد الصورة',
    'tech.px':         'بكسل',
    'tech.signature':  'توقيع الملف الداخلي',
    'tech.sigMatch':   'مطابق للنوع المعلن',
    'tech.sigDiff':    'لا يطابق الامتداد المعلن',
    'tech.exif':       'بيانات EXIF',
    'tech.exifYes':    'موجودة',
    'tech.exifNo':     'غير موجودة',
    'tech.exifDate':   'تاريخ الالتقاط المسجَّل داخل الصورة',
    'tech.camera':     'جهاز الالتقاط المسجَّل',
    'tech.gps':        'إحداثيات موقع مضمّنة',
    'tech.gpsYes':     'موجودة داخل الملف',
    'tech.gpsNo':      'غير موجودة',
    'tech.none':       'لم يُعثر على مؤشرات وصفية إضافية داخل هذا الملف.',
    'tech.disclaimer': 'هذه قراءة وصفية لما هو مكتوب داخل الملف نفسه. غياب بيانات EXIF أمر شائع جدًا، لأن تطبيقات المراسلة تزيلها عند الإرسال، وهو لا يعني شيئًا عن أصالة الصورة. أثر لا تصدر أي حكم على أصالة المحتوى.',

    /* --- Incident record --- */
    'ctx.label':       'توثيق الحادثة',
    'ctx.intro':       'كل الحقول اختيارية. ما تكتبينه يبقى في هذه الصفحة فقط، ويدخل في تقريرك.',
    'ctx.type':        'نوع الدليل',
    'ctx.type.image':  'صورة',
    'ctx.type.screen': 'لقطة شاشة',
    'ctx.type.audio':  'تسجيل صوتي',
    'ctx.type.video':  'فيديو',
    'ctx.type.chat':   'محادثة محفوظة',
    'ctx.type.doc':    'مستند',
    'ctx.platform':    'من أين وصلك',
    'ctx.pf.whatsapp': 'واتساب',
    'ctx.pf.instagram':'إنستغرام',
    'ctx.pf.snapchat': 'سناب شات',
    'ctx.pf.telegram': 'تيليجرام',
    'ctx.pf.x':        'X',
    'ctx.pf.sms':      'رسالة نصية',
    'ctx.pf.email':    'بريد إلكتروني',
    'ctx.pf.other':    'أخرى',
    'ctx.choose':      'اختاري…',
    'ctx.when':        'متى وصلك',
    'ctx.sender':      'اسم الحساب أو الرقم',
    'ctx.senderPh':    'كما ظهر لك تمامًا',
    'ctx.note':        'ماذا حدث، بكلماتك',
    'ctx.notePh':      'اكتبي ما تتذكرينه الآن. التفاصيل تُنسى بسرعة.',
    'ctx.privacy':     'هذه البيانات تبقى في ذاكرة المتصفح المؤقتة، ولا تُرسل ولا تُحفظ. إغلاق الصفحة يمحوها.',

    /* --- Buttons and notices --- */
    'btn.report':      'إنشاء التقرير',
    'btn.reportBusy':  'جارٍ تجهيز الحزمة…',
    'btn.reportDone':  'تم تنزيل الحزمة',
    'btn.clear':       'امسحي كل شيء',
    'clear.confirm':   'سيُمسح كل ما على هذه الصفحة ولا يمكن استرجاعه. هل حمّلتِ تقريرك؟',
    'warn.download':   'حمّلي تقريرك قبل إغلاق الصفحة. لا شيء يُحفظ هنا.',
    'pkg.done':        '<strong>نزلت الحزمة.</strong> افتحيها وابدئي بملف <strong>START-HERE.html</strong>، فهو يشرح البقية بلغة بسيطة. ولطباعة تقرير PDF، افتحي <strong>report.html</strong> واضغطي زر الطباعة في أعلاه. احفظي نسخة من الحزمة في مكان آمن خارج الهاتف.',

    /* --- Limits of the report: binding wording, not to be reworded --- */
    'limits.proves':        'ما يثبته هذا التقرير',
    'limits.provesText':    'أن الملف كان موجودًا بهذه الحالة عند الطابع الزمني المسجل، وأن أي تعديل لاحق عليه سيغيّر بصمته الرقمية.',
    'limits.notProves':     'ما لا يثبته',
    'limits.notProvesText': 'هوية منشئ الملف، ولا تاريخ إنشائه الأصلي، ولا صدق محتواه، ولا أصالة ما يعرضه. تقدير ذلك من اختصاص الجهات الرسمية وحدها.',
    'limits.disclaimer':    'أثر أداة حفظ وفرز أولي، وليست جهة تحقيق ولا مصدر استشارة قانونية.',

    /* --- Units of size and time --- */
    'u.bytes':    'بايت',
    'u.kb':       'كيلوبايت',
    'u.mb':       'ميجابايت',
    'u.gb':       'جيجابايت',
    'u.lessMin':  'أقل من دقيقة',
    'u.minute':   'دقيقة',
    'u.hour':     'ساعة',
    'u.day':      'يوم',
    'u.and':      'و',
    'u.future':   'تاريخ الملف على الجهاز لاحق للحظة التوثيق',

    /* --- About page --- */
    'about.h1':    'عن المنصة',
    'about.sub':   'أثر تحفظ الدليل. لا تحكم عليه، ولا تبحث عن صاحبه.',
    'about.s1':    'لماذا هذه المنصة',
    'about.s1p1':  'حين تصل رسالة ابتزاز، يقع أخطر ما يقع في الساعة الأولى. الشخص المصدوم يحذف المحادثة لينجو من رؤيتها، ويحظر المُبتزّ، وربما يعيد ضبط هاتفه. وهذه تصرفات طبيعية تمامًا ممن يعيش لحظة رعب.',
    'about.s1p2':  'لكنها تعني أنه حين يقرر التبليغ لاحقًا، يصل إلى الجهة المختصة بلا شيء يحمله. القضية تموت قبل أن تبدأ، لا لضعف القانون، بل لأن الدليل لم يعد موجودًا.',
    'about.pull1': 'مجلد في هاتفك يحفظ ملفًا. أثر تحفظ دليلًا.',
    'about.s2':    'كيف تعمل',
    'about.st1h':  'تُسقطين الملف',
    'about.st1p':  'يُقرأ داخل متصفحك مباشرة. لا يُرفع إلى أي خادم، ولا يُرسل إلى أي جهة.',
    'about.st2h':  'تُحسب بصمته الرقمية',
    'about.st2p':  'سلسلة من 64 خانة تُشتق من محتوى الملف نفسه بدالة تجزئة اسمها SHA-256. لو تغيّر بايت واحد في الملف، تغيّرت السلسلة بالكامل. وهي ليست تشفيرًا، فلا يمكن استرجاع الملف منها إطلاقًا.',
    'about.st3h':  'يُوثَّق الخط الزمني',
    'about.st3p':  'تاريخ الملف على جهازك، ولحظة توثيقه هنا، والفارق بينهما. هذا ما يُسمّى في الأدلة الجنائية سلسلة الحيازة.',
    'about.st4h':  'تُوثّقين الحادثة بكلماتك',
    'about.st4p':  'نوع الدليل، ومن أين وصلك، ومتى، واسم الحساب كما ظهر لك. التفاصيل تُنسى بسرعة، والدليل بلا سياق أضعف بكثير.',
    'about.st5h':  'تحصلين على حزمة أدلتك',
    'about.st5p':  'ملف مضغوط واحد يضم الملف الأصلي بايتًا ببايت، وتقريرًا ثنائي اللغة قابلًا للطباعة، وكشف بصمات نصيًا، وسجل حيازة بالتوقيت.',
    'about.s3':    'لماذا لا يوجد حساب ولا خادم',
    'about.s3p0':  'هذا أهم قرار في بناء المنصة، وهو مقصود بالكامل، وله ثلاثة أسباب.',
    'about.s3p1':  '<strong>لأن الملف لا يجب أن يغادر جهازك.</strong> إنسان في لحظة صدمة لن يرفع ملفًا حساسًا إلى موقع لا يعرفه، ولا يصح أن يُطلب منه ذلك.',
    'about.s3p2':  '<strong>ولأن ما لا يُجمع لا يمكن كشفه.</strong> قاعدة بيانات تضم أسماء ضحايا ابتزاز هي من أثمن الأهداف الممكنة لأي مهاجم. أثر لا تُنشئ هذا الهدف من الأساس.',
    'about.s3p3':  '<strong>ولأن التسجيل حاجز في أسوأ لحظة.</strong> لا أحد ينشئ حسابًا وينتظر بريد تفعيل وهو مرعوب في منتصف الليل.',
    'about.s3p4':  'البصمة نفسها تحمي خصوصيتك أيضًا، لأنها أحادية الاتجاه. فيمكنك تسليمها أو تسجيلها لدى جهة مختصة <strong>دون أن يرى أحد الصورة</strong>، ثم يُثبت الملف لاحقًا بمطابقتها.',
    'about.s4':    'ما لا تفعله أثر',
    'about.s4p1':  'المنصة ليست كاشفًا للصور المولّدة بالذكاء الاصطناعي، ولا تصدر حكمًا على أصالة أي ملف. وهذا قرار علمي لا نقص تقني، لأن أدوات الكشف الحالية غير موثوقة ونسب الخطأ فيها عالية في الاتجاهين، ولأن إعطاء ضحية حقيقية جوابًا خاطئًا ضرر جسيم.',
    'about.s4p2':  'كما أنها لا تحدد هوية المُرسل ولا تتعقبه. هذا اختصاص جهات إنفاذ القانون وحدها.',
    'about.yes':   'ما يثبته تقريرك',
    'about.yes1':  'أن الملف كان موجودًا بهذه الحالة عند لحظة التوثيق',
    'about.yes2':  'أن أي تعديل لاحق عليه سيغيّر بصمته ويُكشف',
    'about.yes3':  'ما وثّقتِه أنتِ عن ظروف وصوله إليك',
    'about.no':    'ما لا يثبته',
    'about.no1':   'هوية من أنشأ الملف أو أرسله',
    'about.no2':   'تاريخ إنشائه الأصلي',
    'about.no3':   'صدق محتواه أو أصالة ما يعرضه',
    'about.pull2': 'الأداة التي تقول «لا أستطيع الجزم» بدقة، أنفع لك من أداة تكذب عليك بثقة.',
    'about.s5':    'عن المشروع',
    'about.s5p1':  'أثر مشروع من سلطنة عُمان، في مجال الأمن السيبراني والأدلة الجنائية الرقمية.',
    'about.s5p2':  'المنصة ملفات ثابتة بلا خادم ولا قاعدة بيانات ولا اشتراكات، فتكلفة تشغيلها قريبة من الصفر وتستطيع البقاء عاملة دون تمويل. والمسار القانوني مفصول في ملف بيانات مستقل، ما يعني أن إضافة أي دولة عربية تتم بتحرير ملف نصي دون تعديل سطر برمجي واحد.',
    'about.s5p3':  'يمكنك التحقق من كل ما سبق بنفسك: افتحي أدوات المطور في متصفحك، وراقبي تبويب الشبكة أثناء إسقاط ملف. لن ترى أي طلب يحمل ملفك إلى أي مكان.',

    /* --- First-hour page --- */
    'fh.h1':       'الساعة الأولى',
    'fh.sub':      'أخطر ما يُفقد من الأدلة، يُفقد في أول ستين دقيقة. اقرئي هذه الصفحة قبل أن تفعلي أي شيء آخر.',
    'fh.s1':       'ما لا يجب فعله الآن',
    'fh.d1h':      'لا تحذفي المحادثة',
    'fh.d1p':      'الحذف يريحك دقيقة، ويُفقدك القضية كلها. المحادثة هي الدليل، وليست ذكرى مؤلمة فقط.',
    'fh.d2h':      'لا تحظري الحساب قبل توثيق كل شيء',
    'fh.d2p':      'الحظر في بعض التطبيقات يخفي المحادثة والملف الشخصي عنك. وثّقي أولًا، ثم احظري.',
    'fh.d3h':      'لا تعيدي ضبط الهاتف',
    'fh.d3p':      'إعادة الضبط تمسح الرسائل والملفات وبياناتها الزمنية مسحًا لا رجعة فيه.',
    'fh.d4h':      'لا تعيدي إرسال الملف عبر أي تطبيق',
    'fh.d4p':      'تطبيقات المراسلة تعيد ضغط الصور وتمسح بياناتها المدمجة. الملف الذي يصل صديقتك ليس هو الملف الأصلي، وبصمته مختلفة.',
    'fh.d5h':      'لا تقصّي لقطة الشاشة',
    'fh.d5p':      'القص يغيّر الملف، ويحذف ما قد يكون مهمًا: الوقت، واسم الحساب، وشريط الحالة.',
    'fh.d6h':      'لا تدفعي',
    'fh.d6p':      'الدفع لا ينهي الابتزاز، بل يثبت للمبتزّ أن الأسلوب ناجح فيطلب المزيد.',
    'fh.s2':       'قائمة الأدلة الناقصة',
    'fh.s2p':      'مرّي على هذه القائمة قبل أن تُغلقي التطبيق الذي وصلك منه التهديد. علّمي ما أنجزتِه. القائمة للاسترشاد البصري فقط، ولا تُحفظ في أي مكان، وتختفي بإعادة تحميل الصفحة.',
    'fh.c1':       'المحادثة كاملة من أولها، لا آخر رسالة فقط',
    'fh.c2':       'صورة الملف الشخصي للحساب',
    'fh.c3':       'رابط الحساب أو اسم المستخدم كما هو مكتوب',
    'fh.c4':       'لقطة تُظهر التاريخ والوقت على الشاشة',
    'fh.c5':       'أي رسائل صوتية، محفوظة كملفات لا كلقطات',
    'fh.s3':       'المسار القانوني',
    'fh.legalTag': 'تحت التحقق من مصادر رسمية',
    'fh.legalP1':  'هذا القسم مخصص للجهة المختصة بتلقي البلاغ، وطريقة التقديم، والمواد القانونية ذات الصلة.',
    'fh.legalP2':  'لم يُكتب بعد، عمدًا. المحتوى القانوني لا يُكتب بالتخمين، وهو قيد التحقق من مصادر رسمية عُمانية معتمدة. إدراج جهة خاطئة أو مادة قانونية غير دقيقة أمام شخص في أزمة ضرر لا يقل عن ضرر عدم وجود المعلومة.',
    'fh.legalP3':  'المحتوى يُقرأ من ملف بيانات منفصل اسمه <code>legal-om.json</code>. حين تُعتمد المصادر، يُحرَّر ذلك الملف وحده وتظهر المعلومة هنا. وإضافة أي دولة عربية لاحقًا تتم بإضافة ملف مماثل، دون تعديل أي سطر برمجي.',
    'fh.legalErr': 'تعذّر قراءة ملف المحتوى القانوني. إن كنتِ تفتحين الموقع من ملف محلي، فالمتصفح يمنع قراءة الملفات المجاورة لأسباب أمنية. افتحيه عبر رابط https.',
    'fh.legalUpd': 'آخر مراجعة',

    /* --- Verify page --- */
    'vf.h1':       'التحقق من بصمة',
    'vf.sub':      'أسقطي ملفًا لتعرفي بصمته الآن، أو الصقي بصمة معلومة لمطابقتها بالملف.',
    'vf.step1':    'البصمة المعروفة، اختيارية',
    'vf.step1p':   'الصقي هنا البصمة التي حصلتِ عليها سابقًا، من تقرير أثر أو من أي مصدر آخر. اتركيه فارغًا إن كنتِ تريدين حساب البصمة فقط.',
    'vf.ph':       'الصقي 64 خانة هنا',
    'vf.step2':    'الملف',
    'vf.drop':     'اسحبي الملف إلى هنا أو اضغطي لاختياره',
    'vf.dropSub':  'يُقرأ داخل متصفحك، ولا يُرفع إلى أي مكان',
    'vf.matchH':   'مطابق',
    'vf.matchP':   'بصمة هذا الملف تطابق البصمة المُدخلة تمامًا. الملف لم يتغيّر فيه بايت واحد منذ حُسبت تلك البصمة.',
    'vf.noMatchH': 'غير مطابق',
    'vf.noMatchP': 'بصمة هذا الملف لا تطابق البصمة المُدخلة. هذا يعني أن محتوى الملف مختلف، ولو كان الفارق بايتًا واحدًا. تأكدي أولًا من أنك نسختِ البصمة كاملة، ومن أنك أسقطتِ الملف نفسه لا نسخة أُعيد إرسالها عبر تطبيق.',
    'vf.infoH':    'حُسبت البصمة',
    'vf.infoP':    'هذه بصمة الملف الذي أسقطتِه. لمطابقتها ببصمة معلومة، الصقي تلك البصمة في الحقل أعلاه ثم أعيدي إسقاط الملف.',
    'vf.badHash':  'ما لصقتِه ليس بصمة SHA-256 صالحة. البصمة الصحيحة 64 خانة، حروفها من a إلى f وأرقام من 0 إلى 9 فقط. تأكدي أنك نسختِ السطر كاملًا.',
    'vf.expected': 'البصمة المُدخلة',
    'vf.actual':   'بصمة الملف',
    'vf.file':     'الملف المفحوص',
    'vf.note':     'المقارنة تتم داخل متصفحك، ولا تُحفظ البصمة المُدخلة ولا الملف في أي مكان.',
    'vf.reset':    'ابدئي من جديد',

    /* ===== Strings specific to this edition ===== */
    'hero.badge':   'يعمل داخل متصفحك · لا يُرفع أي ملف',
    'hero.cta1':    'كيف تعمل أثر؟',
    'hero.cta2':    'عندي بصمة وأريد مطابقتها',

    'stat1':        'خانة تُحسب من محتوى ملفك',
    'stat2':        'ملف يُرفع إلى أي خادم',
    'stat3':        'ملفات داخل حزمة أدلتك',

    'feat.eyebrow': 'لماذا أثر',
    'feat.h2':      'أداة واحدة، وقواعد لا تتغيّر',
    'feat.sub':     'كل قرار في هذه المنصة اتُّخذ لصالح شخص واحد: من يفتحها في أسوأ لحظة.',
    'feat1h':       'الملف لا يغادر جهازك',
    'feat1p':       'تُقرأ الملفات وتُحسب بصماتها داخل متصفحك. لا رفع، ولا خادم، ولا وسيط.',
    'feat2h':       'لا حساب ولا كلمة مرور',
    'feat2p':       'لا تسجيل ولا بريد تفعيل. تفتحين الصفحة فتعمل الأداة في اللحظة نفسها.',
    'feat3h':       'لا يبقى أثر بعد الإغلاق',
    'feat3p':       'لا كوكيز ولا تخزين محلي. إعادة تحميل الصفحة تمحو كل شيء، وهذا مقصود.',
    'feat4h':       'دليل على أن ملفك لم يتغيّر',
    'feat4p':       'نحسب لملفك بصمة خاصة به وقت التوثيق. لو تغيّر فيه شيء لاحقًا، تغيّرت البصمة وانكشف الأمر.',
    'feat5h':       'حزمة جاهزة للتسليم',
    'feat5p':       'الملف الأصلي، وتقرير ثنائي اللغة قابل للطباعة، وكشف بصمات، وسجل حيازة.',
    'feat6h':       'حدودها معلنة بصراحة',
    'feat6p':       'أثر تحفظ الدليل ولا تحكم على أصالته. ما لا تستطيع إثباته تقوله بوضوح.',

    'steps.eyebrow':'خمس خطوات',
    'steps.h2':     'كيف تعمل، من الإسقاط إلى التسليم',

    'cta.h2':       'الدليل الذي تحفظينه الآن، هو الذي سيتكلم عنك لاحقًا',
    'cta.p':        'لا تحتاجين حسابًا ولا تسجيلًا. أسقطي الملف، واحصلي على حزمتك في أقل من دقيقة.',
    'cta.btn':      'ابدئي التوثيق الآن',

    'about.eyebrow':'عن المنصة',
    'fh.eyebrow':   'قبل أي شيء آخر',
    'vf.eyebrow':   'مطابقة',
    'foot.tagline': 'ما يُحفظ اليوم، يُثبت غدًا',
    'toast.copied': 'نُسخت البصمة',
    'toast.pkg':    'نزلت حزمة الأدلة',

    /* ===== The START-HERE.html guide, and the print buttons ===== */
    'sh.title':     'حزمة أدلتك',
    'sh.sub':       'اقرئي هذه الصفحة أولًا. تشرح ما بداخل الحزمة، وماذا تفعلين بها.',
    'sh.printBtn':  'طباعة هذه الصفحة أو حفظها PDF',
    'sh.printHow':  'للحصول على ملف PDF: اضغطي الزر، ثم اختاري «حفظ كـ PDF» أو «Microsoft Print to PDF» بدل اسم الطابعة، ثم احفظي. الطريقة نفسها تعمل في report.html.',
    'sh.printHint': 'اطبعي هذا التقرير أو احفظيه PDF من متصفحك. اختاري «حفظ كـ PDF» بدل اسم الطابعة.',
    'sh.contents':  'ماذا في هذه الحزمة',
    'sh.colFile':   'الملف',
    'sh.colWhy':    'ما فائدته',
    'sh.f1':        'هذه الصفحة. دليلك المبسّط، وليست وثيقة رسمية.',
    'sh.f2':        'ملفك الأصلي كما هو، بايتًا ببايت، بلا أي تعديل ولا إعادة ضغط.',
    'sh.f3':        'التقرير الرسمي بالعربية والإنجليزية معًا. هذا هو المعدّ للتسليم وللطباعة.',
    'sh.f4':        'البصمات والأحجام والطوابع الزمنية بنص عادي، ليتحقق أي طرف بنفسه بأدوات نظامه.',
    'sh.f5':        'سجل بالتوقيت لكل ما جرى أثناء التوثيق، من اختيار الملف إلى إنشاء الحزمة.',
    'sh.now':       'ماذا تفعلين الآن',
    'sh.n1':        'احفظي نسخة من هذه الحزمة في مكان آمن خارج هاتفك: حاسوب، أو ذاكرة خارجية، أو بريدك الإلكتروني الخاص.',
    'sh.n2':        'لا تعيدي إرسال الملف الأصلي عبر أي تطبيق مراسلة. التطبيقات تعيد ضغط الملفات فتتغيّر بصمتها، ويفقد التوثيق قيمته.',
    'sh.n3':        'لا تحذفي المحادثة ولا تحظري الحساب قبل توثيق كل ما يمكن توثيقه.',
    'sh.n4':        'عند التبليغ، سلّمي الحزمة كاملة كما هي، ولا تفتحي الملف الأصلي ببرنامج قد يعدّله أو يحفظه من جديد.',
    'sh.n5':        'إن طُلب منك ورق، افتحي report.html واطبعيه PDF من متصفحك.',
    'sh.hand':      'إن سُئلتِ: ماذا تسلّمين؟',
    'sh.handText':  'هذا وصف جاهز يمكنك قراءته أو نسخه كما هو. وهو وصف لمحتوى الحزمة فقط، وليس صياغة قانونية.',
    'sh.handBody':  'أُسلّم حزمة أدلة رقمية أنشأتها أداة «أثر» داخل متصفح جهازي. تحتوي الحزمة على الملف الأصلي دون تعديل، وعلى بصمته الرقمية SHA-256 وهي {HASH}، وعلى لحظة توثيقه {TIME}، تحت مرجع الحالة {REF}. لم يُرفع الملف إلى أي خادم، ويمكن التحقق من البصمة بأي أداة قياسية.',
    'sh.summary':   'ملخص سريع',
    'sh.reminder':  'المسار القانوني، أي الجهة التي تتلقى البلاغ وطريقة التقديم، قيد التحقق من مصادر رسمية ولم يُنشر بعد. لا تعتمدي فيه على هذه الصفحة.',
    'sh.langNote':  'هذه الصفحة مكتوبة بلغة الواجهة وقت إنشاء الحزمة. أما report.html فيحمل اللغتين معًا دائمًا، لأنه هو المعدّ للتسليم.',

    /* ===== The save-as-PDF button on the site ===== */
    'btn.pdf':      'حفظ التقرير PDF',
    'btn.pdfBusy':  'جارٍ فتح نافذة الطباعة…',
    'btn.pdfHint':  'ورقة واحدة للطباعة أو للحفظ PDF. اختاري «حفظ كـ PDF» بدل اسم الطابعة.',
    'btn.reportHint': 'كل شيء في ملف واحد: دليلك كما هو، وتقرير مطبوع، وبصمتك، وسجل بما حدث ومتى. هذا ما تسلّمينه للجهة المختصة.',

    /* ===== Why document at all, when a reporting number exists ===== */
    'why.eyebrow':  'سؤال يستحق الجواب',
    'why.h2':       'أليس يكفي أن أتصل بالشرطة مباشرة؟',
    'why.intro':    'الاتصال بالشرطة هو الخطوة الحاسمة، ولا شيء يُغني عنه. لكن بين لحظة وصول التهديد ولحظة وصولك إلى الجهة المختصة تمر ساعات أو أيام، وفي تلك الفجوة يُفقد الدليل. أثر تعمل في هذه الفجوة وحدها.',
    'why1h':        'البلاغ يبدأ إجراءً، والتوثيق يحفظ دليلًا',
    'why1p':        'حين تتصلين، يُفتح ملف ويبدأ التحقيق. لكن التحقيق يحتاج شيئًا يعمل عليه. إن كانت المحادثة قد حُذفت والحساب اختفى، فالبلاغ يبقى كلامًا بلا سند.',
    'why2h':        'التوثيق لا يُلزمك بقرار',
    'why2p':        'الاتصال قرار كبير، وكثيرات يتردّدن أيامًا خوفًا من الفضيحة أو من ألّا يُصدَّقن. التوثيق يستغرق دقيقة، ولا يُبلغ أحدًا، ولا يُخرج ملفك من جهازك. فإن قررتِ بعد شهر، يكون الدليل سليمًا. وإن لم تقرري، لم تخسري شيئًا.',
    'why3h':        'يثبت أن الملف لم يتغيّر منذ ذلك اليوم',
    'why3p':        'لو صوّرتِ الشاشة اليوم وبلّغتِ بعد شهر، لا شيء يثبت أن الصورة لم تُعدَّل خلال ذلك الشهر. البصمة المسجّلة لحظة التوثيق تُغلق هذا الباب: أي تعديل لاحق يكشف نفسه.',
    'why4h':        'يحمي خصوصيتك في المرحلة الأولى',
    'why4p':        'تستطيعين تسجيل البصمة أو تسليمها دون أن ترى الصورة أي عين. وحين يُطلب الأصل رسميًا، تقدّمينه وتُثبت مطابقته للبصمة المسجّلة سابقًا.',
    'why5h':        'يحوّل الفوضى إلى ملف مرتّب',
    'why5p':        'بدل أربعين لقطة شاشة متناثرة في معرض الصور، ملف واحد منظّم فيه الدليل وتقرير مطبوع باللغتين. يوفّر على المحقق وقتًا، ويوفّر عليك استجوابًا طويلًا وأنت في أسوأ حالك.',
    'why6h':        'يحفظ السياق قبل أن يُنسى',
    'why6p':        'من أين وصلك، ومتى، وماذا قال، واسم الحساب كما ظهر لك. هذه التفاصيل تتبخّر خلال أيام، والدليل بلا سياق أضعف بكثير أمام أي جهة.',

    'why.h3':       'وماذا يعني تقريرك عند الادعاء العام أو الجهة المختصة',
    'why.r1':       '<strong>سلامة الدليل، قابلة للتحقق دون الوثوق بنا.</strong> التقرير يذكر أوامر يستطيع خبير الأدلة تشغيلها على جهازه ليعيد حساب البصمة بنفسه. إن تطابقت، فالملف لم يُمسّ. لا يحتاج أن يصدّق أثر في شيء.',
    'why.r2':       '<strong>سلسلة حيازة موثّقة بالتوقيت.</strong> أول ما يُسأل عنه أي دليل رقمي: من حازه، ومتى، وهل تغيّر بعد جمعه. سجل الحيازة داخل الحزمة يُجيب عن ذلك بالثانية.',
    'why.r3':       '<strong>حدود معلنة بصراحة.</strong> التقرير يقول بوضوح ما لا يثبته: هوية المُرسل، وتاريخ الإنشاء الأصلي، وصدق المحتوى. الوثيقة التي تعترف بحدودها أصدق أمام أي جهة من وثيقة تدّعي ما لا تملك.',
    'why.r4':       '<strong>جاهز للملف الورقي.</strong> ثنائي اللغة وقابل للطباعة بضغطة واحدة، فيدخل ملف القضية مباشرة بلا إعادة كتابة ولا ترجمة.',
    'why.pull':     'أثر ليست بديلًا عن البلاغ. هي ما يجعل بلاغك مُجديًا حين تتصلين.',

    /* ===== Verify-page explainer, as a click-to-open list ===== */
    'vfx.eyebrow':  'قبل أن تسألي',
    'vfx.h2':       'ما فائدة التحقق من البصمة؟',
    'vfx.lead':     'اضغطي على أي سؤال ليفتح جوابه.',

    'vfx.q1':       'ما الذي يحدث هنا أصلًا؟',
    'vfx.a1':       'حين وثّقتِ ملفك سابقًا، حُسب له سطر من 64 خانة اسمه البصمة، وهو مشتق من محتواه هو. في هذه الصفحة نُعيد حساب البصمة للملف الذي تُسقطينه الآن، ثم نقارن السطرين. إن تطابقا، فالملف لم يتغيّر فيه بايت واحد. وإن اختلفا، فمحتواه ليس هو نفسه.',

    'vfx.q2':       'ومن يستفيد منها؟ ولماذا قد أحتاجها؟',
    'vfx.a2':       'ثلاثة أطراف، وكل واحد لسبب مختلف:',
    'vfx.who1h':    'أنتِ أولًا',
    'vfx.who1p':    'مرّ شهر على التوثيق، ونقلتِ الملف بين الهاتف والحاسوب وذاكرة خارجية. تسقطينه هنا فتعرفين في ثانية أن نسختك ما زالت سليمة ولم يصبها تلف ولا تعديل. هذا يريحك قبل أن تسلّمي أي شيء.',
    'vfx.who2h':    'الجهة المختصة أو المحقق',
    'vfx.who2p':    'يستلم الملف منك مع تقريرك، فيتحقق بنفسه أن ما بين يديه هو نفسه ما وثّقتِه في ذلك اليوم بالذات، لا نسخة أُعيد حفظها أو عُدّلت في الطريق.',
    'vfx.who3h':    'أي طرف ثالث: محامٍ، أو خبير، أو محكمة',
    'vfx.who3p':    'يتحقق دون أن يثق بأثر ولا بك. الحساب رياضي بحت، ويعطي النتيجة نفسها على أي جهاز في العالم. وهذه أقوى نقطة في المنصة كلها: لا أحد مضطر لتصديقنا.',

    'vfx.q3':       'أليس يُفترض أن أُدخل ملفين لتتم المقارنة؟ لماذا ملف واحد؟',
    'vfx.a3':       'لأنك لا تقارنين ملفًا بملف، بل تقارنين ملفًا بـ<strong>بصمة</strong>. والبصمة نائبة عن الملف: 64 خانة تختصر ملفًا حجمه ميجابايتات، ولا يمكن أن تنطبق على محتوى آخر.',
    'vfx.a3b':      'وهذه ليست نقصًا، بل هي الفائدة كلها. لو احتجنا الملف الأصلي في كل مرة، لوجب عليك الاحتفاظ بنسختين، وإرسال إحداهما لمن يتحقق. أما البصمة فتكتبينها في ورقة، أو تضعينها في تقريرك، أو تسجّلينها عند جهة رسمية، <strong>دون أن يرى أحد الصورة إطلاقًا</strong>. ثم يُثبت الملف لاحقًا بمطابقتها.',
    'vfx.a3c':      '<strong>وإن أردتِ فعلًا مقارنة ملفين ببعضهما:</strong> أسقطي الأول والحقل فارغ، فتظهر بصمته. انسخيها بزر النسخ، ثم الصقيها في الحقل أعلاه، ثم أسقطي الملف الثاني. النتيجة تخبرك إن كانا نسخة واحدة أم لا.',

    'vfx.q4':       'ظهرت لي «مطابق». ماذا يعني ذلك بالضبط؟',
    'vfx.a4':       'يعني أن محتوى هذا الملف مطابق تمامًا للمحتوى الذي حُسبت منه تلك البصمة. لا بايت واحد تغيّر. لو غُيّر بكسل واحد في الصورة أو حرف واحد في مستند، لما ظهرت لك هذه النتيجة.',
    'vfx.a4b':      'انتبهي: «مطابق» تقول إن الملف لم يتغيّر. لا تقول من صنعه، ولا متى صُنع، ولا إن كان ما فيه صحيحًا. هذه أمور خارج قدرة أي بصمة.',

    'vfx.q5':       'ظهرت لي «غير مطابق». هل تلاعب أحد بالملف؟',
    'vfx.a5':       'ليس بالضرورة، ولا تقلقي قبل أن تتأكدي. الأسباب مرتّبة من الأكثر شيوعًا إلى الأقل:',
    'vfx.r1':       'نسختِ البصمة ناقصة أو معها مسافة زائدة. هذا السبب الأول بفارق كبير.',
    'vfx.r2':       'الملف الذي أسقطتِه نسخة أُعيد إرسالها عبر واتساب أو أي تطبيق مراسلة. التطبيقات تُعيد ضغط الصور، فينتج ملف مختلف ببصمة مختلفة.',
    'vfx.r3':       'فتحتِ الملف ببرنامج وحفظتِه من جديد: اقتصاص، أو تدوير، أو حتى فتح وحفظ بلا تعديل ظاهر.',
    'vfx.r4':       'أسقطتِ ملفًا آخر بالخطأ، أو نسخة أقدم منه.',
    'vfx.r5':       'وأخيرًا، وهو الأندر: الملف تغيّر فعلًا.',
    'vfx.doh':      'ماذا تفعلين الآن',
    'vfx.dop':      'تأكدي أولًا أنك نسختِ البصمة كاملة، 64 خانة بلا نقص. ثم جرّبي النسخة الأصلية التي وثّقتِها، لا نسخة وصلتك عبر تطبيق. فإن بقيت غير مطابقة وكان لديك بلاغ قائم، أخبري الجهة المختصة بذلك ولا تُخفيه: عدم التطابق نفسه معلومة مفيدة لهم، وقد يدل على أن النسخة التي بيدك ليست الأصل.',

    'vfx.q6':       'هل يُحفظ الملف أو البصمة هنا؟',
    'vfx.a6':       'لا. الملف يُقرأ داخل متصفحك ولا يُرفع إلى أي مكان، والبصمة التي تلصقينها لا تُخزَّن ولا تُرسَل. إعادة تحميل الصفحة تمحو كل شيء. تستطيعين التأكد بنفسك: افتحي أدوات المطور، وراقبي تبويب الشبكة أثناء إسقاط الملف.',

    /* ===== Quick questions: what crosses her mind before she touches the tool ===== */
    'brand.simple': 'هدفها بسيط: أن يبقى ما لديك اليوم قابلًا للتحقق عندما تحتاجينه لاحقًا.',
    'faq.eyebrow':  'قبل أن تبدئي',
    'faq.h2':       'أسئلة سريعة، أجوبتها قصيرة',
    'faq.lead':     'اضغطي على أي سؤال ليفتح جوابه.',

    'faq.q1':       'هل يُرفع ملفي إلى أي مكان؟',
    'faq.a1':       '<strong>لا.</strong> ملفك يُقرأ داخل متصفحك على جهازك، ولا يخرج منه. لا يوجد خادم يستقبله أصلًا. وتستطيعين التأكد بنفسك: افتحي أدوات المطور، واختاري تبويب الشبكة، ثم أسقطي ملفًا وراقبي.',
    'faq.q2':       'هل تُبلّغ أثر الشرطة أو أي جهة عني؟',
    'faq.a2':       '<strong>لا.</strong> أثر لا تُرسل شيئًا إلى أحد، ولا تعرف من أنتِ أصلًا. القرار كله بيدك: أنتِ من تختار متى تبلّغين وإن كنتِ ستبلّغين. ولو لم تفعلي، فلن يعلم أحد أنك فتحتِ هذه الصفحة.',
    'faq.q3':       'هل أحتاج حسابًا أو رقم هاتفي أو بريدي؟',
    'faq.a3':       '<strong>لا.</strong> لا تسجيل، ولا كلمة مرور، ولا بريد تفعيل. تفتحين الصفحة فتعمل الأداة في اللحظة نفسها.',
    'faq.q4':       'هل يبقى شيء على جهازي بعد إغلاق الصفحة؟',
    'faq.a4':       '<strong>لا شيء.</strong> لا كوكيز ولا تخزين. كل ما كتبتِه يختفي بإعادة تحميل الصفحة. الشيء الوحيد الذي يبقى هو الملف الذي تنزّلينه أنتِ بنفسك، وأنتِ من تختار أين تحفظينه.',
    'faq.q5':       'هل تعرف أثر إن كانت الصورة حقيقية أم مفبركة؟',
    'faq.a5':       '<strong>لا، وهذا مقصود.</strong> أدوات الحكم على الصور غير موثوقة، وجواب خاطئ لضحية حقيقية ضرر جسيم. أثر تحفظ الدليل ولا تحكم عليه، وتقدير ذلك من اختصاص الجهات المختصة وحدها.',
    'faq.q6':       'وماذا أحصل عليه في النهاية؟',
    'faq.a6':       'ملف واحد تنزّلينه على جهازك، بداخله: <strong>دليلك الأصلي</strong> كما هو دون تعديل، و<strong>تقرير مطبوع</strong> بالعربية والإنجليزية، و<strong>بصمة</strong> تُثبت أن الملف لم يتغيّر، و<strong>سجل</strong> بما حدث ومتى. تحتفظين به وتقدّمينه عند الحاجة.',

    /* ===== The explanatory diagram: today and a month later ===== */
    'flow.h':       'كيف تعمل البصمة، في صورة واحدة',
    'flow.today':   'اليوم',
    'flow.f1':      'ملفك',
    'flow.f2':      'نحسب بصمته',
    'flow.later':   'بعد شهر',
    'flow.f3':      'الملف نفسه',
    'flow.f4':      'نحسب بصمته من جديد',
    'flow.match':   'البصمتان متطابقتان، إذًا الملف لم يتغيّر',
    'flow.note':    'ولو تغيّر في الملف أصغر شيء، لاختلفت البصمتان وانكشف الأمر فورًا.',

    /* ===== Plain-language explanation of the fingerprint, on the About page ===== */
    'hash.eyebrow': 'بلغة بسيطة',
    'hash.h2':      'ما هي «البصمة الرقمية»؟',
    'hash.p1':      'تخيّلي أن ملفك مرّ في آلة تقرأ محتواه كله، بايتًا بايتًا، ثم تُخرج سطرًا من 64 خانة. هذا السطر هو بصمة الملف. لا يشبه أي ملف آخر في العالم، تمامًا كبصمة الإصبع.',
    'hash.p2':      'المهم في الأمر: لو تغيّر في الملف أصغر شيء، بكسل واحد في الصورة، أو حرف واحد في مستند، فإن السطر كله يتغيّر ولا يبقى منه شيء. لا توجد طريقة لتعديل الملف والاحتفاظ ببصمته نفسها.',
    'hash.p3':      'ولأنها تُحسب من المحتوى في اتجاه واحد فقط، لا يستطيع أحد أن يعرف صورتك من بصمتها. البصمة سطر أرقام وحروف، لا أكثر.',
    'hash.q1':      'وكيف يساعدني هذا؟',
    'hash.a1':      'حين تسجّلين البصمة اليوم، ثم تبلّغين بعد شهر، تستطيع الجهة المختصة أن تحسب بصمة الملف مرة أخرى وتقارنها. إن تطابقت، فالملف الذي بيدها هو نفسه ملفك، ولم يُمسّ منذ تلك اللحظة. وهذا ما يُسمى في الأدلة الجنائية «سلامة الدليل».',
    'hash.q2':      'وهل أُسلّم صورتي لأحد؟',
    'hash.a2':      'لا. تستطيعين تسليم البصمة وحدها، وهي 64 خانة لا تكشف شيئًا عن الصورة. وتبقى الصورة عندك في جهازك، حتى تُطلب رسميًا.',
    'hash.q3':      'وهل هذا تشفير؟',
    'hash.a3':      'لا، وهذا فرق مهم. التشفير يُخفي الملف ثم يُعيده كما كان بالمفتاح الصحيح. أما البصمة فطريق واحد لا رجعة فيه: تُحسب من الملف، ولا يُستخرج الملف منها أبدًا. اسمها التقني «دالة تجزئة»، ونوعها هنا SHA-256.',
    'hash.warn':    '<strong>وما لا تفعله البصمة:</strong> لا تخبر أحدًا من صنع الملف، ولا متى صُنع أصلًا، ولا إن كان ما فيه صحيحًا. هي تثبت أن الملف لم يتغيّر منذ وثّقتِه، لا أكثر ولا أقل.',

    /* ===== Reporting card on the About page ===== */
    'rep.h2':       'إن قررتِ التبليغ',
    'rep.p':        'الأرقام الرسمية وطريقة التبليغ وما تأخذينه معك، كلها في صفحة الساعة الأولى.',
    'rep.btn':      'أرقام التبليغ الرسمية',
    'rep.quick':    'بلاغات الابتزاز والجرائم الإلكترونية · شرطة عُمان السلطانية',

    /* ===== Footer ===== */
    'foot.rights':  'أثر · مشروع من سلطنة عُمان',
    'foot.desc':    'منصة لحفظ الأدلة الرقمية في جرائم الابتزاز والتشهير',
    'foot.contact': 'للتواصل مع فريق أثر',
    'foot.wa':      'واتساب',
    'fh.legalSrc':  'المصادر الرسمية'
  },

  /* ======================= English ======================= */
  en: {
    /* --- Identity and navigation --- */
    'brand.name':      'Athar',
    'brand.tagline':   'Preserve the trace before it fades',
    'nav.tool':        'Document a file',
    'nav.about':       'About',
    'nav.firstHour':   'First hour',
    'nav.verify':      'Verify a fingerprint',
    'lang.toggle':     'عربي',
    'lang.aria':       'التبديل إلى العربية',
    'skip':            'Skip to content',
    'urgent.bar':      'What not to do right now →',
    'foot.note':       'Athar · A preservation and preliminary triage tool. Not an investigative body, and not a source of legal advice.',
    'foot.local':      'Everything on this page happens inside your browser alone.',

    /* --- Tab titles, deliberately neutral --- */
    'title.home':      'Athar · Document a file',
    'title.about':     'Athar · About',
    'title.firstHour': 'Athar · First hour',
    'title.verify':    'Athar · Verify a fingerprint',
    'meta.home':       'A tool that preserves digital evidence inside your browser. Your file never leaves your device.',
    'meta.about':      'How Athar works, why there is no account and no server, and what the platform does not do.',
    'meta.firstHour':  'What not to do in the first hour, and a checklist of missing evidence.',
    'meta.verify':     'Check whether a file still matches its digital fingerprint.',

    /* --- Home --- */
    'home.title':      'Drop your file here',
    'home.sub':        'It never leaves your device. No account, no sign-up.',
    'drop.main':       'Drag your file here',
    'drop.sub':        'or click to choose it from your device',
    'drop.hint':       'A photo, a screenshot, a voice recording, a video, or a saved conversation',
    'drop.aria':       'Choose a file to document',
    'drop.busy':       'Computing the fingerprint inside your browser…',
    'drop.busyBig':    'This file is large and may take a few seconds. Please do not close the page.',

    /* --- Errors --- */
    'error.title':     'Documentation could not be completed',
    'error.noCrypto':  'Your browser does not allow fingerprint computation in this mode. Open the site over an https link instead of opening the file directly from your device, or try a current browser.',
    'error.read':      'The file could not be read to the end. Make sure it was not moved or deleted while being read, then drop it again.',
    'error.empty':     'This file is empty and contains no bytes. Choose a different file.',
    'error.zipLib':    'The packaging library could not be loaded because the connection dropped. Reload the page while online, then drop the file again.',
    'error.zipMake':   'The package could not be created. The file may exceed the browser’s available memory. Try a browser on a computer rather than a phone.',

    /* --- Fingerprint --- */
    'hash.label':      'Your file’s fingerprint',
    'hash.caption':    'Keep this line. It is what later proves your file has not changed: if it is computed again a month from now and matches, the file is the same and untouched.',
    'hash.tech':       'Technically: the SHA-256 algorithm reads the contents of the file and produces these 64 characters. Changing the smallest thing in the file overturns all of them.',
    'btn.copy':        'Copy fingerprint',
    'btn.copied':      'Copied',
    'btn.copyFail':    'Copy it manually from the line above',

    /* --- File and timeline --- */
    'file.label':      'Your file, and when you documented it',
    'file.intro':      'This is your file’s record card: what it is, and exactly when it was documented. That moment of documentation is the reference everything is compared against later.',
    'f.ref':           'Case reference',
    'f.name':          'File name',
    'f.size':          'Size',
    'f.type':          'Type',
    'f.deviceDate':    'File date on your device',
    'f.documentedAt':  'Documented at, in Athar',
    'f.gap':           'Time between the two dates',
    'f.typeUnknown':   'Not specified',
    'note.deviceDate': '<strong>About the file date:</strong> it is taken from the operating system on your device, it can be modified, and it is shown for guidance, not as proof. The documentation timestamp, by contrast, is recorded now.',
    'note.imagesOnly': '<strong>Note:</strong> the file has been fully preserved and documented. In-depth technical inspection is currently available for images only.',

    /* --- Descriptive technical indicators --- */
    'tech.label':      'What we found written inside the image',
    'tech.intro':      'Every image carries information written by the device or program that produced it. We read it and show it as it is, because it may be useful to an investigator.',
    'tech.dims':       'Image dimensions',
    'tech.px':         'pixels',
    'tech.signature':  'Internal file signature',
    'tech.sigMatch':   'Matches the declared type',
    'tech.sigDiff':    'Does not match the declared extension',
    'tech.exif':       'EXIF metadata',
    'tech.exifYes':    'Present',
    'tech.exifNo':     'Absent',
    'tech.exifDate':   'Capture date recorded inside the image',
    'tech.camera':     'Recorded capture device',
    'tech.gps':        'Embedded location coordinates',
    'tech.gpsYes':     'Present inside the file',
    'tech.gpsNo':      'Absent',
    'tech.none':       'No additional descriptive indicators were found inside this file.',
    'tech.disclaimer': 'This is a descriptive reading of what is written inside the file itself. Absent EXIF metadata is extremely common, because messaging applications strip it on sending, and it says nothing about whether an image is genuine. Athar makes no judgement about the authenticity of content.',

    /* --- Incident context --- */
    'ctx.label':       'Incident record',
    'ctx.intro':       'All fields are optional. What you write stays on this page only, and is included in your report.',
    'ctx.type':        'Type of evidence',
    'ctx.type.image':  'Photo',
    'ctx.type.screen': 'Screenshot',
    'ctx.type.audio':  'Voice recording',
    'ctx.type.video':  'Video',
    'ctx.type.chat':   'Saved conversation',
    'ctx.type.doc':    'Document',
    'ctx.platform':    'Where it reached you',
    'ctx.pf.whatsapp': 'WhatsApp',
    'ctx.pf.instagram':'Instagram',
    'ctx.pf.snapchat': 'Snapchat',
    'ctx.pf.telegram': 'Telegram',
    'ctx.pf.x':        'X',
    'ctx.pf.sms':      'Text message',
    'ctx.pf.email':    'Email',
    'ctx.pf.other':    'Other',
    'ctx.choose':      'Choose…',
    'ctx.when':        'When it reached you',
    'ctx.sender':      'Account name or number',
    'ctx.senderPh':    'Exactly as it appeared to you',
    'ctx.note':        'What happened, in your own words',
    'ctx.notePh':      'Write what you remember now. Details fade quickly.',
    'ctx.privacy':     'This information stays in the browser’s temporary memory. It is never sent and never stored. Closing the page erases it.',

    /* --- Buttons and notices --- */
    'btn.report':      'Generate the report',
    'btn.reportBusy':  'Preparing the package…',
    'btn.reportDone':  'Package downloaded',
    'btn.clear':       'Erase everything',
    'clear.confirm':   'Everything on this page will be erased and cannot be recovered. Have you downloaded your report?',
    'warn.download':   'Download your report before closing the page. Nothing is stored here.',
    'pkg.done':        '<strong>The package has been downloaded.</strong> Open it and start with <strong>START-HERE.html</strong>, which explains the rest in plain language. For a printed PDF report, open <strong>report.html</strong> and press the print button at the top. Keep a copy somewhere safe, outside your phone.',

    /* --- Limits of the report, binding text --- */
    'limits.proves':        'What this report establishes',
    'limits.provesText':    'That this file existed in this exact state at the recorded timestamp, and that any subsequent modification will change its digital fingerprint.',
    'limits.notProves':     'What it does not establish',
    'limits.notProvesText': "The identity of the file's creator, its original creation date, the truth of its contents, or the authenticity of what it depicts. Assessing these matters rests solely with the competent authorities.",
    'limits.disclaimer':    'Athar is a preservation and preliminary triage tool. It is not an investigative body and does not provide legal advice.',

    /* --- Units and time --- */
    'u.bytes':    'bytes',
    'u.kb':       'KB',
    'u.mb':       'MB',
    'u.gb':       'GB',
    'u.lessMin':  'less than a minute',
    'u.minute':   'min',
    'u.hour':     'h',
    'u.day':      'd',
    'u.and':      'and',
    'u.future':   'the device file date is later than the documentation moment',

    /* --- About page --- */
    'about.h1':    'About the platform',
    'about.sub':   'Athar preserves evidence. It does not judge it, and it does not look for who sent it.',
    'about.s1':    'Why this platform exists',
    'about.s1p1':  'When a blackmail message arrives, the most damaging things happen in the first hour. The person in shock deletes the conversation to stop having to see it, blocks the blackmailer, and sometimes factory-resets the phone. These are entirely natural reactions from someone living through a moment of terror.',
    'about.s1p2':  'But they mean that when the decision to report finally comes, that person reaches the authorities with nothing in hand. The case dies before it starts, not because the law is weak, but because the evidence no longer exists.',
    'about.pull1': 'A folder on your phone keeps a file. Athar keeps evidence.',
    'about.s2':    'How it works',
    'about.st1h':  'You drop the file',
    'about.st1p':  'It is read inside your browser directly. It is not uploaded to any server, and it is not sent to anyone.',
    'about.st2h':  'Its digital fingerprint is computed',
    'about.st2p':  'A string of 64 characters derived from the contents of the file itself, using a hash function called SHA-256. If a single byte of the file changes, the whole string changes. It is not encryption: the file can never be reconstructed from it.',
    'about.st3h':  'The timeline is documented',
    'about.st3p':  'The file date on your device, the moment it was documented here, and the interval between them. In digital forensics this is known as the chain of custody.',
    'about.st4h':  'You record the incident in your own words',
    'about.st4p':  'The type of evidence, where it reached you, when, and the account name as it appeared. Details fade fast, and evidence without context is far weaker.',
    'about.st5h':  'You receive your evidence package',
    'about.st5p':  'A single archive containing the original file byte for byte, a printable bilingual report, a plain-text manifest of fingerprints, and a timestamped chain-of-custody log.',
    'about.s3':    'Why there is no account and no server',
    'about.s3p0':  'This is the most important decision in the design of the platform. It is entirely deliberate, and it has three reasons.',
    'about.s3p1':  '<strong>Because the file must not leave your device.</strong> A person in shock will not upload a sensitive file to a website they do not know, and should never be asked to.',
    'about.s3p2':  '<strong>Because what is never collected can never be breached.</strong> A database holding the names of blackmail victims is one of the most valuable targets an attacker could hope for. Athar never creates that target.',
    'about.s3p3':  '<strong>Because sign-up is a barrier at the worst possible moment.</strong> Nobody creates an account and waits for a confirmation email while terrified in the middle of the night.',
    'about.s3p4':  'The fingerprint itself also protects your privacy, because it is one-way. You can hand it over or register it with a competent authority <strong>without anyone seeing the image</strong>, and the file can be tied to it later by comparison.',
    'about.s4':    'What Athar does not do',
    'about.s4p1':  'The platform is not an AI-generated image detector, and it issues no judgement on the authenticity of any file. That is a scientific decision, not a technical shortcoming: current detectors are unreliable with high error rates in both directions, and giving a real victim a false answer causes serious harm.',
    'about.s4p2':  'It also does not identify or trace the sender. That is the sole province of law enforcement.',
    'about.yes':   'What your report establishes',
    'about.yes1':  'That the file existed in this state at the moment of documentation',
    'about.yes2':  'That any later modification will change its fingerprint and be detectable',
    'about.yes3':  'What you yourself recorded about how it reached you',
    'about.no':    'What it does not establish',
    'about.no1':   'The identity of whoever created or sent the file',
    'about.no2':   'Its original creation date',
    'about.no3':   'The truth of its contents or the authenticity of what it depicts',
    'about.pull2': 'A tool that says "I cannot be certain" precisely is more useful to you than a tool that lies to you with confidence.',
    'about.s5':    'About the project',
    'about.s5p1':  'Athar is a project from the Sultanate of Oman, in the field of cybersecurity and digital forensics.',
    'about.s5p2':  'The platform is made of static files, with no server, no database and no subscriptions, so its running cost is close to zero and it can stay online without funding. The legal pathway is kept in a separate data file, which means adding any other Arab country is a matter of editing a text file, without changing a single line of code.',
    'about.s5p3':  'You can verify all of this yourself: open your browser’s developer tools and watch the Network tab while you drop a file. You will not see a single request carrying your file anywhere.',

    /* --- First hour page --- */
    'fh.h1':       'The first hour',
    'fh.sub':      'The evidence that matters most is lost in the first sixty minutes. Read this page before you do anything else.',
    'fh.s1':       'What not to do right now',
    'fh.d1h':      'Do not delete the conversation',
    'fh.d1p':      'Deleting relieves you for a minute and costs you the entire case. The conversation is the evidence, not just a painful memory.',
    'fh.d2h':      'Do not block the account before everything is documented',
    'fh.d2p':      'In some apps, blocking hides the conversation and the profile from you as well. Document first, then block.',
    'fh.d3h':      'Do not reset the phone',
    'fh.d3p':      'A factory reset erases messages, files and their timestamps irreversibly.',
    'fh.d4h':      'Do not re-send the file through any app',
    'fh.d4p':      'Messaging apps re-compress images and strip their embedded metadata. The file your friend receives is not the original file, and its fingerprint is different.',
    'fh.d5h':      'Do not crop the screenshot',
    'fh.d5p':      'Cropping changes the file and removes what may matter most: the time, the account name and the status bar.',
    'fh.d6h':      'Do not pay',
    'fh.d6p':      'Paying does not end blackmail. It proves to the blackmailer that the method works, so they ask for more.',
    'fh.s2':       'Checklist of missing evidence',
    'fh.s2p':      'Go through this list before you close the app the threat arrived in. Tick off what you have. The list is a visual aid only, is stored nowhere, and disappears when the page is reloaded.',
    'fh.c1':       'The full conversation from its beginning, not just the last message',
    'fh.c2':       'The profile picture of the account',
    'fh.c3':       'The account link or username exactly as written',
    'fh.c4':       'A capture showing the date and time on screen',
    'fh.c5':       'Any voice messages, saved as files rather than screenshots',
    'fh.s3':       'The legal pathway',
    'fh.legalTag': 'pending verification from official sources',
    'fh.legalP1':  'This section is reserved for the authority that receives reports, how to submit one, and the relevant legal provisions.',
    'fh.legalP2':  'It has deliberately not been written yet. Legal content is not written from guesswork, and this material is being verified against official Omani sources. Putting the wrong authority or an inaccurate provision in front of someone in crisis does harm no smaller than leaving the information out.',
    'fh.legalP3':  'The content is read from a separate data file named <code>legal-om.json</code>. Once the sources are confirmed, that file alone is edited and the information appears here. Adding any other country later means adding a similar file, with no code changes at all.',
    'fh.legalErr': 'The legal content file could not be read. If you are opening the site from a local file, the browser blocks reading neighbouring files for security reasons. Open it over an https link.',
    'fh.legalUpd': 'Last reviewed',

    /* --- Verify page --- */
    'vf.h1':       'Verify a fingerprint',
    'vf.sub':      'Drop a file to see its fingerprint now, or paste a known fingerprint to check a file against it.',
    'vf.step1':    'Known fingerprint, optional',
    'vf.step1p':   'Paste the fingerprint you obtained earlier, from an Athar report or from any other source. Leave it empty if you only want the fingerprint computed.',
    'vf.ph':       'Paste 64 characters here',
    'vf.step2':    'The file',
    'vf.drop':     'Drag the file here, or click to choose it',
    'vf.dropSub':  'It is read inside your browser and uploaded nowhere',
    'vf.matchH':   'Match',
    'vf.matchP':   'This file’s fingerprint matches the entered fingerprint exactly. Not one byte of the file has changed since that fingerprint was computed.',
    'vf.noMatchH': 'No match',
    'vf.noMatchP': 'This file’s fingerprint does not match the entered fingerprint. The contents differ, even if only by a single byte. First make sure you copied the fingerprint in full, and that you dropped the original file rather than a copy re-sent through an app.',
    'vf.infoH':    'Fingerprint computed',
    'vf.infoP':    'This is the fingerprint of the file you dropped. To compare it against a known fingerprint, paste that fingerprint in the field above and drop the file again.',
    'vf.badHash':  'What you pasted is not a valid SHA-256 fingerprint. A valid one is 64 characters long, using only the letters a to f and the digits 0 to 9. Check that you copied the whole line.',
    'vf.expected': 'Entered fingerprint',
    'vf.actual':   'File fingerprint',
    'vf.file':     'File examined',
    'vf.note':     'The comparison happens inside your browser. Neither the entered fingerprint nor the file is stored anywhere.',
    'vf.reset':    'Start again',

    /* ===== Strings specific to the colourful edition ===== */
    'hero.badge':   'Runs inside your browser · nothing is uploaded',
    'hero.cta1':    'How does Athar work?',
    'hero.cta2':    'I have a fingerprint to check',

    'stat1':        'characters derived from your file',
    'stat2':        'files uploaded to any server',
    'stat3':        'files inside your evidence package',

    'feat.eyebrow': 'Why Athar',
    'feat.h2':      'One tool, and rules that never bend',
    'feat.sub':     'Every decision in this platform was made for one person: whoever opens it at the worst possible moment.',
    'feat1h':       'The file never leaves your device',
    'feat1p':       'Files are read and fingerprinted inside your browser. No upload, no server, no intermediary.',
    'feat2h':       'No account, no password',
    'feat2p':       'No sign-up and no confirmation email. You open the page and the tool works that same second.',
    'feat3h':       'No trace once you close it',
    'feat3p':       'No cookies and no local storage. Reloading the page erases everything, and that is deliberate.',
    'feat4h':       'Proof that your file has not changed',
    'feat4p':       'We compute a fingerprint unique to your file at the moment of documentation. If anything in it changes later, the fingerprint changes and the change is exposed.',
    'feat5h':       'A package ready to hand over',
    'feat5p':       'The original file, a printable bilingual report, a fingerprint manifest, and a chain-of-custody log.',
    'feat6h':       'Its limits are stated openly',
    'feat6p':       'Athar preserves evidence and passes no judgement on it. What it cannot establish, it says plainly.',

    'steps.eyebrow':'Five steps',
    'steps.h2':     'How it works, from drop to hand-over',

    'cta.h2':       'The evidence you preserve now is what will speak for you later',
    'cta.p':        'No account and no sign-up. Drop the file and get your package in under a minute.',
    'cta.btn':      'Start documenting now',

    'about.eyebrow':'About',
    'fh.eyebrow':   'Before anything else',
    'vf.eyebrow':   'Comparison',
    'foot.tagline': 'What is preserved today is proven tomorrow',
    'toast.copied': 'Fingerprint copied',
    'toast.pkg':    'Evidence package downloaded',

    /* ===== START-HERE.html guide, and the print buttons ===== */
    'sh.title':     'Your evidence package',
    'sh.sub':       'Read this page first. It explains what is inside the package and what to do with it.',
    'sh.printBtn':  'Print this page, or save it as PDF',
    'sh.printHow':  'To get a PDF file: press the button, then choose “Save as PDF” or “Microsoft Print to PDF” instead of a printer name, and save. The same method works for report.html.',
    'sh.printHint': 'Print this report or save it as a PDF from your browser. Choose “Save as PDF” instead of a printer name.',
    'sh.contents':  'What is in this package',
    'sh.colFile':   'File',
    'sh.colWhy':    'What it is for',
    'sh.f1':        'This page. Your plain-language guide, not an official document.',
    'sh.f2':        'Your original file exactly as it was, byte for byte, with no modification and no re-compression.',
    'sh.f3':        'The official report, in Arabic and English together. This is the one meant for hand-over and for printing.',
    'sh.f4':        'Fingerprints, sizes and timestamps in plain text, so any party can verify independently with their own tools.',
    'sh.f5':        'A timestamped log of everything that happened during documentation, from choosing the file to generating the package.',
    'sh.now':       'What to do now',
    'sh.n1':        'Keep a copy of this package somewhere safe outside your phone: a computer, an external drive, or your own email.',
    'sh.n2':        'Do not re-send the original file through any messaging app. Those apps re-compress files, which changes the fingerprint and destroys the value of the documentation.',
    'sh.n3':        'Do not delete the conversation and do not block the account until everything that can be documented has been documented.',
    'sh.n4':        'When you report, hand over the whole package exactly as it is, and do not open the original file in any program that might modify or re-save it.',
    'sh.n5':        'If you are asked for paper, open report.html and print it to PDF from your browser.',
    'sh.hand':      'If you are asked: what are you handing over?',
    'sh.handText':  'Here is a ready description you can read out or copy as it is. It describes the contents of the package only; it is not legal wording.',
    'sh.handBody':  'I am submitting a digital evidence package produced by the Athar tool inside the browser on my own device. The package contains the original file without modification, its SHA-256 digital fingerprint {HASH}, and its documentation timestamp {TIME}, under case reference {REF}. The file was not uploaded to any server, and the fingerprint can be verified with any standard tool.',
    'sh.summary':   'Quick summary',
    'sh.reminder':  'The legal pathway, meaning which authority receives reports and how to submit one, is still being verified against official sources and has not been published yet. Do not rely on this page for it.',
    'sh.langNote':  'This page is written in the interface language used when the package was created. report.html, by contrast, always carries both languages, because that is the document meant for hand-over.',

    /* ===== The save-as-PDF button on the site ===== */
    'btn.pdf':      'Save the report as PDF',
    'btn.pdfBusy':  'Opening the print window…',
    'btn.pdfHint':  'A single sheet to print or save as PDF. Choose “Save as PDF” instead of a printer name.',
    'btn.reportHint': 'Everything in one file: your evidence as it is, a printable report, your fingerprint, and a log of what happened and when. This is what you hand over.',

    /* ===== Why document at all, when a reporting number exists ===== */
    'why.eyebrow':  'A question that deserves an answer',
    'why.h2':       'Is it not enough to just call the police?',
    'why.intro':    'Calling the police is the decisive step and nothing replaces it. But hours or days pass between the moment a threat arrives and the moment you reach the authorities, and evidence is lost in that gap. Athar works in that gap alone.',
    'why1h':        'A report starts a process; documentation preserves evidence',
    'why1p':        'When you call, a case is opened and an investigation begins. But an investigation needs something to work on. If the conversation has been deleted and the account has vanished, the report is words with nothing behind them.',
    'why2h':        'Documenting commits you to nothing',
    'why2p':        'Calling is a big decision, and many people hesitate for days out of fear of exposure or of not being believed. Documenting takes a minute, notifies nobody, and never lets your file leave your device. If you decide a month later, the evidence is intact. If you never decide, you have lost nothing.',
    'why3h':        'It proves the file has not changed since that day',
    'why3p':        'If you take a screenshot today and report a month later, nothing shows the image was not altered in between. The fingerprint recorded at the moment of documentation closes that door: any later change reveals itself.',
    'why4h':        'It protects your privacy in the first stage',
    'why4p':        'You can register or hand over the fingerprint without a single pair of eyes seeing the image. When the original is formally requested, you produce it and prove it matches the fingerprint recorded earlier.',
    'why5h':        'It turns chaos into an ordered file',
    'why5p':        'Instead of forty screenshots scattered through a photo gallery, one organised archive with the evidence and a printable bilingual report. It saves the investigator time, and saves you a long interview at your worst moment.',
    'why6h':        'It captures the context before it fades',
    'why6p':        'Where it reached you, when, what was said, and the account name as it appeared. These details evaporate within days, and evidence without context is far weaker before any authority.',

    'why.h3':       'And what your report means to a prosecutor or competent authority',
    'why.r1':       '<strong>Integrity that can be verified without trusting us.</strong> The report prints commands a forensic examiner can run on their own machine to recompute the fingerprint themselves. If it matches, the file is untouched. They never have to take Athar’s word for anything.',
    'why.r2':       '<strong>A timestamped chain of custody.</strong> The first question asked of any digital evidence is who held it, when, and whether it changed after collection. The custody log inside the package answers that to the second.',
    'why.r3':       '<strong>Limits stated openly.</strong> The report says plainly what it does not establish: the sender’s identity, the original creation date, the truth of the contents. A document that admits its limits is more credible before any authority than one that claims what it cannot deliver.',
    'why.r4':       '<strong>Ready for the paper file.</strong> Bilingual and printable in one click, so it goes straight into the case file with no retyping and no translation.',
    'why.pull':     'Athar is not a substitute for reporting. It is what makes your report worth something when you call.',

    /* ===== Verify-page explainer, as a click-to-open list ===== */
    'vfx.eyebrow':  'Before you ask',
    'vfx.h2':       'What is fingerprint verification for?',
    'vfx.lead':     'Tap any question to open its answer.',

    'vfx.q1':       'What actually happens here?',
    'vfx.a1':       'When you documented your file earlier, a 64-character line called the fingerprint was computed from its contents. On this page we recompute the fingerprint of the file you drop now and compare the two lines. If they match, not one byte of the file has changed. If they differ, the contents are not the same.',

    'vfx.q2':       'Who benefits from this, and why would I need it?',
    'vfx.a2':       'Three parties, each for a different reason:',
    'vfx.who1h':    'You, first of all',
    'vfx.who1p':    'A month has passed since you documented the file, and you have moved it between a phone, a computer and an external drive. Drop it here and you know within a second that your copy is still intact, with no corruption and no modification. That reassures you before you hand anything over.',
    'vfx.who2h':    'The authority or the investigator',
    'vfx.who2p':    'They receive the file from you along with your report, and verify for themselves that what they hold is the very thing you documented on that particular day — not a copy that was re-saved or altered along the way.',
    'vfx.who3h':    'Any third party: a lawyer, an expert, a court',
    'vfx.who3p':    'They verify without trusting Athar and without trusting you. The computation is pure mathematics and yields the same result on any machine on earth. This is the strongest point in the whole platform: nobody has to take our word for anything.',

    'vfx.q3':       'Shouldn’t I have to enter two files for a comparison? Why only one?',
    'vfx.a3':       'Because you are not comparing a file with a file — you are comparing a file with a <strong>fingerprint</strong>. The fingerprint stands in for the file: 64 characters that condense a file of many megabytes, and that cannot match any other content.',
    'vfx.a3b':      'That is not a shortcoming; it is the entire benefit. If the original file were needed every time, you would have to keep two copies and send one to whoever verifies. A fingerprint, by contrast, can be written on a sheet of paper, placed in your report, or registered with an authority <strong>without anyone ever seeing the image</strong>. The file is then tied to it later by comparison.',
    'vfx.a3c':      '<strong>And if you really do want to compare two files with each other:</strong> drop the first one with the field empty, and its fingerprint appears. Copy it with the copy button, paste it into the field above, then drop the second file. The result tells you whether they are one and the same.',

    'vfx.q4':       'It says “Match”. What exactly does that mean?',
    'vfx.a4':       'It means the contents of this file are identical to the contents the fingerprint was computed from. Not a single byte has changed. Had one pixel in an image or one letter in a document been altered, you would not be seeing this result.',
    'vfx.a4b':      'Note carefully: “Match” says the file has not changed. It does not say who created it, when it was created, or whether what it shows is true. Those are beyond the reach of any fingerprint.',

    'vfx.q5':       'It says “No match”. Has someone tampered with the file?',
    'vfx.a5':       'Not necessarily, and do not worry before you check. Here are the causes, ordered from most to least common:',
    'vfx.r1':       'You copied the fingerprint incompletely, or with a stray space. This is the leading cause by a wide margin.',
    'vfx.r2':       'The file you dropped is a copy re-sent through WhatsApp or another messaging app. Those apps re-compress images, producing a different file with a different fingerprint.',
    'vfx.r3':       'You opened the file in some program and saved it again: cropping, rotating, or even opening and saving with no visible change.',
    'vfx.r4':       'You dropped a different file by mistake, or an older version of it.',
    'vfx.r5':       'And finally, the rarest: the file really has changed.',
    'vfx.doh':      'What to do now',
    'vfx.dop':      'First make sure you copied the fingerprint in full, all 64 characters. Then try the original copy you documented, not one that reached you through an app. If it still does not match and you have an open report, tell the authority about it rather than hiding it: a mismatch is itself useful information for them, and may indicate that the copy in your hands is not the original.',

    'vfx.q6':       'Is the file or the fingerprint stored here?',
    'vfx.a6':       'No. The file is read inside your browser and uploaded nowhere, and the fingerprint you paste is neither stored nor sent. Reloading the page erases everything. You can confirm this yourself: open the developer tools and watch the Network tab while you drop a file.',

    /* ===== Quick questions: what crosses her mind before she touches the tool ===== */
    'brand.simple': 'Its aim is simple: that what you have today stays verifiable when you need it later.',
    'faq.eyebrow':  'Before you start',
    'faq.h2':       'Quick questions, short answers',
    'faq.lead':     'Tap any question to open its answer.',

    'faq.q1':       'Is my file uploaded anywhere?',
    'faq.a1':       '<strong>No.</strong> Your file is read inside your browser, on your device, and never leaves it. There is no server to receive it in the first place. You can confirm this yourself: open the developer tools, choose the Network tab, then drop a file and watch.',
    'faq.q2':       'Does Athar report me to the police or anyone else?',
    'faq.a2':       '<strong>No.</strong> Athar sends nothing to anyone, and does not know who you are in the first place. The decision is entirely yours: you choose when to report, and whether to report at all. If you do not, nobody will know you opened this page.',
    'faq.q3':       'Do I need an account, my phone number, or my email?',
    'faq.a3':       '<strong>No.</strong> No sign-up, no password, no confirmation email. You open the page and the tool works that same second.',
    'faq.q4':       'Does anything stay on my device after I close the page?',
    'faq.a4':       '<strong>Nothing.</strong> No cookies and no storage. Everything you typed disappears when the page is reloaded. The only thing that remains is the file you download yourself, and you choose where to keep it.',
    'faq.q5':       'Can Athar tell whether an image is genuine or fabricated?',
    'faq.a5':       '<strong>No, and that is deliberate.</strong> Tools that judge images are unreliable, and a wrong answer given to a real victim causes serious harm. Athar preserves evidence and passes no judgement on it; assessing that rests solely with the competent authorities.',
    'faq.q6':       'And what do I get in the end?',
    'faq.a6':       'One file you download to your device, containing: <strong>your original evidence</strong> exactly as it is, a <strong>printable report</strong> in Arabic and English, a <strong>fingerprint</strong> proving the file has not changed, and a <strong>log</strong> of what happened and when. You keep it and produce it when needed.',

    /* ===== The explanatory diagram: today and a month later ===== */
    'flow.h':       'How the fingerprint works, in one picture',
    'flow.today':   'Today',
    'flow.f1':      'Your file',
    'flow.f2':      'We compute its fingerprint',
    'flow.later':   'A month later',
    'flow.f3':      'The same file',
    'flow.f4':      'We compute its fingerprint again',
    'flow.match':   'The two fingerprints match, so the file has not changed',
    'flow.note':    'Had the smallest thing in the file changed, the two fingerprints would differ and the change would be exposed at once.',

    /* ===== Plain-language explanation, on the About page ===== */
    'hash.eyebrow': 'In plain words',
    'hash.h2':      'What is a “digital fingerprint”?',
    'hash.p1':      'Imagine your file passing through a machine that reads all of its contents, byte by byte, and prints out a line of 64 characters. That line is the file’s fingerprint. It matches no other file in the world, exactly like a fingerprint on a hand.',
    'hash.p2':      'Here is what matters: if the smallest thing in the file changes — a single pixel in an image, a single letter in a document — the entire line changes and nothing of it survives. There is no way to alter the file and keep the same fingerprint.',
    'hash.p3':      'And because it is computed from the contents in one direction only, nobody can work out your photo from its fingerprint. The fingerprint is a line of letters and digits, nothing more.',
    'hash.q1':      'How does that help me?',
    'hash.a1':      'If you record the fingerprint today and report a month later, the authority can recompute the file’s fingerprint and compare. If they match, the file in their hands is the same file as yours, untouched since that moment. In forensics this is called the integrity of the evidence.',
    'hash.q2':      'Do I have to hand my photo to anyone?',
    'hash.a2':      'No. You can hand over the fingerprint alone — 64 characters that reveal nothing about the image. The image stays with you, on your device, until it is formally requested.',
    'hash.q3':      'Is this encryption?',
    'hash.a3':      'No, and the difference matters. Encryption hides a file and then restores it with the right key. A fingerprint is a one-way street with no return: it is computed from the file, and the file can never be recovered from it. Its technical name is a hash function, and the one used here is SHA-256.',
    'hash.warn':    '<strong>And what a fingerprint does not do:</strong> it tells nobody who made the file, nor when it was originally made, nor whether what it shows is true. It establishes that the file has not changed since you documented it — no more and no less.',

    /* ===== Reporting card on the About page ===== */
    'rep.h2':       'If you decide to report',
    'rep.p':        'The official numbers, how to report, and what to take with you are all on the First Hour page.',
    'rep.btn':      'Official reporting numbers',
    'rep.quick':    'Blackmail and cybercrime reports · Royal Oman Police',

    /* ===== Footer ===== */
    'foot.rights':  'Athar · a project from the Sultanate of Oman',
    'foot.desc':    'A platform for preserving digital evidence in blackmail and defamation cases',
    'foot.contact': 'To reach the Athar team',
    'foot.wa':      'WhatsApp',
    'fh.legalSrc':  'Official sources'
  }
};

/* ---------- Current language ----------
   An in-memory variable only. Reloading the page resets it to 'ar'. */
let CURRENT_LANG = 'ar';

/* ---------- t: look up a string by key ---------- */
function t(key) {
  const table = STRINGS[CURRENT_LANG] || STRINGS.ar;
  // If a key is missing, show the key itself rather than an empty string,
  // so the mistake surfaces immediately during development
  return (key in table) ? table[key] : key;
}

/* ---------- setLang: switch the interface language ---------- */
function setLang(lang) {
  CURRENT_LANG = (lang === 'en') ? 'en' : 'ar';

  // Page direction and language. The logical CSS properties flip the whole
  // layout by themselves once these two lines run.
  document.documentElement.lang = CURRENT_LANG;
  document.documentElement.dir  = CURRENT_LANG === 'ar' ? 'rtl' : 'ltr';

  // 1. Plain text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // 2. Strings that contain formatting tags such as <strong>.
  //    Every one of these is authored in this file and none of it ever
  //    comes from user input, which is what makes innerHTML safe here.
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  // 3. Attributes: placeholder, aria-label and meta content
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    el.setAttribute('content', t(el.dataset.i18nContent));
  });

  // 4. The switch button itself
  const btn = document.getElementById('langBtn');
  if (btn) {
    btn.textContent = t('lang.toggle');
    btn.setAttribute('aria-label', t('lang.aria'));
  }

  // 5. Tell the rest of the page to re-render whatever it generates in
  //    JavaScript, such as dates and sizes that are formatted per language
  document.dispatchEvent(new CustomEvent('athar:langchange', { detail: { lang: CURRENT_LANG } }));
}

/* ---------- Initialisation on page load ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('langBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      setLang(CURRENT_LANG === 'ar' ? 'en' : 'ar');
    });
  }
  // Arabic is always the starting point; navigator.language is never read
  setLang('ar');
});
