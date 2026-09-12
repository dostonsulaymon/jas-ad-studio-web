/**
 * Every visible string in the app (spec §8, D-014). Uzbek Latin is the only locale.
 *
 * Two rules this file exists to keep:
 *
 * 1. `oʻ` and `gʻ` are U+02BB, and `ʼ` is U+02BC. They are letters, not quotation
 *    marks, and the API already writes them this way (W-001). `uzbek-source.test.ts`
 *    fails the build if a quotation mark creeps in here.
 * 2. The app never implies it makes videos. The main action is "Reklama promptini
 *    tayyorlash", and the word "video" appears only next to Google Flow.
 */

export const uzLatn = {
  brand: {
    name: 'JAS Ad Studio',
  },

  nav: {
    studio: 'Studiya',
    examples: 'Misollar',
    how: 'Qanday ishlaydi',
    faq: 'Savollar',
    signIn: 'Kirish',
    signOut: 'Chiqish',
    projects: 'Loyihalarim',
    skipToContent: 'Asosiy qismga oʻtish',
    menu: 'Menyu',
  },

  hero: {
    // Source 01 §4, the owner's own words.
    headlineLine1: 'Mahsulot rasmi bor.',
    headlineLine2: 'Reklama gʻoyasi-chi?',
    // The source's CTA was "3 ta bepul promptdan boshlash". There are no free prompts
    // (D-007), so it is replaced rather than reworded.
    sub: 'Rasmni yuklang. Mahsulotingizga mos ssenariy va tayyor prompt oling. Videoni Google Flowʼda tayyorlaysiz.',
    subKeyword1: 'ssenariy',
    subKeyword2: 'prompt',
    primaryCta: 'Reklama promptini tayyorlash',
    secondaryCta: 'Misollarni koʻrish',
    // The hand-drawn annotation. The never-imply-video rule, drawn.
    annotation: 'videoni Google Flow tayyorlaydi, biz emas',
    trayDropTitle: 'Mahsulot rasmingizni',
    trayDropTitle2: 'shu yerga tashlang',
    trayDropShort: 'Rasmingiz shu yerga',
    trayPhotoLimit: '4 tagacha rasm',
  },

  how: {
    title: 'Qanday ishlaydi',
    step1Title: '1. Rasm va qisqa tavsif',
    step1Body: 'Mahsulotingizni bir necha qatorda tanishtirasiz.',
    step2Title: '2. Reklama yoʻnalishi',
    step2Body: 'Maqsad, format, platforma va oʻlcham.',
    step3Title: '3. Ssenariy va prompt',
    step3Body: 'Oʻzbekcha kadrlar rejasi, soʻng Google Flow uchun tayyor prompt.',
  },

  // Source 01 §41, minus its "3 ta bepul prompt" question: there are no free prompts
  // (D-007), so that answer would be a lie rather than a rewording.
  faq: {
    title: 'Savollar',
    q1: 'JAS Ad Studio videoni oʻzi tayyorlaydimi?',
    a1: 'Yoʻq. Biz reklama gʻoyasi, oʻzbekcha kadrlar rejasi va tayyor promptni beramiz. Videoni siz Google Flowʼda tayyorlaysiz.',
    q2: 'Google Flow bepulmi?',
    a2: 'Bu sizning Google hisobingiz, mamlakatingiz va Googleʼning joriy shartlariga bogʻliq. JAS Ad Studio Google limitlariga tegmaydi.',
    q3: 'Mahsulotim oʻzgarib ketmaydimi?',
    a3: 'Prompt mahsulotni rasmdagidek saqlashni qatʼiy talab qiladi. Shunga qaramay, hech bir video model natijani 100 foiz kafolatlay olmaydi, shuning uchun natijani koʻzdan kechiring.',
    q4: 'Promptni boshqa AI video servisida ishlatsam boʻladimi?',
    a4: 'Prompt Google Flow uchun moslangan. Boshqa servisda ishlatish mumkin, lekin biroz oʻzgartirish kerak boʻlishi ehtimol.',
  },

  footer: {
    madeFor: 'Oʻzbekistondagi onlayn sotuvchilar uchun',
    notVideo: 'JAS Ad Studio reklama promptini tayyorlaydi. Videoni Google Flow tayyorlaydi.',
  },

  studio: {
    stepProduct: 'Mahsulot',
    stepDirection: 'Reklama yoʻnalishi',
    stepReview: 'Tekshirish va saqlash',
    stepOf: '/ 3',
    draftSaved: 'Qoralama avtomatik saqlanadi',
    yourProduct: 'Sizning mahsulotingiz',
    nextSteps: 'Keyingi qadamlar',
    view: 'Koʻrish',
    continue: 'Davom etish',
    back: 'Orqaga',
    nextIsDirection: '2-qadam: reklama yoʻnalishi',
    nextIsReview: '3-qadam: tekshirish va saqlash',
    primaryBadge: 'Asosiy',
    stepAnnounce: (n: number, name: string) => `${n}-qadam: ${name}`,
  },

  product: {
    title: 'Mahsulotingizni tanishtiring',
    sub: 'Rasm va ikki qator matn yetarli. Qolganini biz soʻraymiz.',
    photosLabel: 'Mahsulot rasmi',
    photosHelp: 'Birinchi rasm asosiy. Bosib boshqasini asosiy qilishingiz mumkin. 4 tagacha, har biri 10 MB gacha.',
    photosHelpShort: '4 tagacha rasm, har biri 10 MB gacha. JPG, PNG yoki WebP.',
    addPhoto: 'Rasm qoʻshish',
    makePrimary: 'Asosiy qilish',
    removePhoto: 'Rasmni olib tashlash',
    nameLabel: 'Mahsulot nomi',
    namePlaceholder: '',
    descriptionLabel: 'Qisqa tavsif',
    // The product-lock rule, said to the seller. The cheapest place to prevent an
    // invented claim is before it is typed.
    descriptionHelp: 'Faqat aniq narsani yozing. Oʻylab topilgan daʼvo promptga tushmaydi.',
    guideTitle: 'Yaxshi natija uchun:',
    guide1: 'mahsulot aniq koʻrinsin',
    guide2: 'rasm juda xira boʻlmasin',
    guide3: 'bir xil model va variant yuborilsin',
    guide4: 'yorliq muhim boʻlsa, oʻqiladigan rasm qoʻshilsin',
    annotationPinned: 'uch qadam davomida shu yerda turadi',
  },

  upload: {
    title: 'Rasmlar yuklanmoqda',
    sub: 'Sahifani yopmang. Tayyor boʻlganini pastda belgilab boramiz.',
    queued: 'navbatda',
    uploading: (percent: number) => `${percent}%`,
    done: 'tayyor',
    notAnImage: 'Bu rasm emas',
    refusedFile: (name: string) => `${name} qabul qilinmadi.`,
    remove: 'Olib tashlash',
    retry: 'Qaytadan urinish',
    progressAnnounce: (name: string, percent: number) => `${name}: ${percent} foiz`,
    doneAnnounce: (name: string) => `${name} yuklandi`,
    summary: (ready: number, busy: number) =>
      busy === 0 ? `${ready} ta rasm tayyor` : `${ready} ta rasm tayyor, ${busy} tasi yuklanmoqda`,
    needNameFirst: 'Avval mahsulot nomini yozing, soʻng rasm yuklanadi.',
  },

  direction: {
    title: 'Reklama yoʻnalishini tanlang',
    sub: 'Bu savollarga javob bergach, ssenariy tayyorlanadi.',
    goalLabel: 'Maqsad',
    formatLabel: 'Reklama formati',
    platformLabel: 'Platforma',
    aspectLabel: 'Oʻlcham',
    durationLabel: 'Davomiyligi',
    durationUnit: 'soniya',
    audienceLabel: 'Kimga moʻljallangan',
    audienceHelp: 'Ixtiyoriy. Masalan: 25-40 yoshli, Toshkentda yashovchi xaridorlar.',
    advanced: 'Qoʻshimcha sozlamalar',
    claimsLabel: 'Tasdiqlangan afzalliklar',
    claimsHelp: 'Faqat oʻzingiz bilgan, haqiqiy afzalliklarni yozing. 10 tagacha.',
    claimVerified: 'Tasdiqlangan',
    addClaim: 'Afzallik qoʻshish',
    removeClaim: 'Afzallikni olib tashlash',
    offerLabel: 'Aksiya yoki taklif',
    offerHelp: 'Ixtiyoriy. Yozmasangiz, promptda hech qanday chegirma yoki narx boʻlmaydi.',
    offerDescription: 'Taklif matni',
    offerPrice: 'Narxi (soʻm)',
    offerValidUntil: 'Qachongacha',
    // Aspect ratio is never inferred from photo orientation (source 01 §9).
    aspectHelp: 'Rasm shakliga qarab avtomatik tanlanmaydi. Oʻzingiz tanlang.',
  },

  // Seller-facing labels for the contract's enums. There is no endpoint listing these
  // (W-003), so they live here, keyed by the enum value. The generated client's union
  // types mean a contract change breaks the build rather than drifting silently.
  goal: {
    awareness: { label: 'Tanishtirish', line: 'Mahsulotni birinchi marta koʻrsatish' },
    sales: { label: 'Sotuvni oshirish', line: 'Xaridorni harakatga undash' },
    launch: { label: 'Yangi mahsulot eʼloni', line: 'Yangi kelgan mahsulotni eʼlon qilish' },
    trust: { label: 'Ishonch uygʻotish', line: 'Sifat va kafolatni koʻrsatish' },
  },

  // D-065: format replaces style. The seller answers one question, not two, and there
  // is no style picker anywhere.
  format: {
    'product-film': {
      label: 'Studiya filmi',
      line: 'Toza fon, sekin kamera, mahsulot markazda',
    },
    'high-energy': {
      label: 'Tezkor va energiyali',
      line: 'Qisqa kadrlar, tez ritm, ijtimoiy tarmoq uchun',
    },
    'lifestyle-story': {
      label: 'Hayotiy hikoya',
      line: 'Mahsulot kundalik vaziyatda koʻrsatiladi',
    },
    'ugc-authentic': {
      label: 'Tabiiy UGC',
      line: 'Telefonda olingandek, sodda va ishonarli',
    },
  },

  platform: {
    instagram: { label: 'Instagram / Reels', line: '' },
    telegram: { label: 'Telegram', line: '' },
    tiktok: { label: 'TikTok', line: '' },
    'youtube-shorts': { label: 'YouTube Shorts', line: '' },
  },

  aspect: {
    '9:16': { label: '9:16', line: 'Vertikal' },
    '16:9': { label: '16:9', line: 'Gorizontal' },
    '1:1': { label: '1:1', line: 'Kvadrat' },
  },

  review: {
    title: 'Hammasini tekshiring',
    sub: 'Notoʻgʻri joyini oʻzgartiring, soʻng loyihani saqlang.',
    edit: 'Oʻzgartirish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda',
    saved: 'Loyiha saqlandi',
    notSet: 'Koʻrsatilmagan',
    // P4 shipped, so the step no longer has to apologise for a missing action. The note
    // now says what the button will cost, which is the thing a seller needs to know
    // BEFORE pressing it (Addendum A §A2, §16).
    generationCost: 'Bu amal 1 ta prompt kreditini ishlatadi.',
    generate: 'Prompt tayyorlash',
  },

  /**
   * The generation flow. Uzbek for the seller, and never a raw provider message: a
   * refusal shows the model's own Uzbek explanation, a failure shows mapped copy.
   */
  generate: {
    queuedTitle: 'Navbatda',
    runningTitle: 'Tayyorlanmoqda',
    // ~60s measured (D-082). Saying so beats a spinner with no end in sight.
    runningNote: 'Bu odatda bir daqiqacha davom etadi. Sahifani yopsangiz ham yoʻqolmaydi.',
    stillRunning: 'Hali tayyor emas',
    stillRunningNote:
      'Kutish uzoq davom etdi. Krediting saqlanib qoldi — loyihalar roʻyxatidan keyinroq tekshiring.',

    readyTitle: 'Prompt tayyor',
    readySub: 'Nusxa oling va Google Flow ichida videoni tayyorlang.',

    conceptLabel: 'Gʻoya',
    hookLabel: 'Ilk jumla',
    ctaLabel: 'Chaqiriq',
    shotsLabel: 'Kadrlar rejasi',
    promptLabel: 'Google Flow uchun prompt (inglizcha)',
    cameraLabel: 'Kamera',
    assumptionsLabel: 'Taxminlar',
    reviewNotesLabel: 'Eʼtiborga olinglar',
    fidelityLabel: 'Mahsulot qoidalari',

    copy: 'Promptni nusxalash',
    copied: 'Nusxalandi',
    // The Clipboard API is missing in some in-app browsers, which is where a seller
    // arriving from Telegram actually is. So this is an expected path, not an error.
    copyManual: 'Nusxalash ishlamadi. Matnni belgilab, qoʻlda nusxalang.',
    download: 'TXT sifatida saqlash',
    openFlow: 'Google Flow’ni ochish',
    // Product rule: the app writes prompts, Flow makes the video. Never implied otherwise.
    flowNote:
      'Videoni Google Flow tayyorlaydi. Modelni, oʻlchamni va uzunlikni Flow ichida oʻzingiz tanlaysiz.',

    questionsTitle: 'Bir-ikki savol bor',
    questionsSub: 'Javob bering yoki rasm va tavsifni aniqlashtiring — krediting ishlatilmadi.',
    refusedTitle: 'Bu mahsulot uchun prompt tayyorlanmadi',
    refusedSub: 'Krediting qaytarildi.',
    failedTitle: 'Tayyorlash uzilib qoldi',
    failedSub: 'Krediting qaytarildi. Yana urinib koʻrishingiz mumkin.',
    retry: 'Yana urinish',
    cached: 'Bu savollar avvalgi javobdan olindi — yangi kredit ishlatilmadi.',
  },

  projects: {
    title: 'Loyihalarim',
    close: 'Yopish',
    count: (n: number) => `${n} ta loyiha`,
    empty: 'Hozircha boʻsh',
    emptyGhost: 'Birinchi loyihangiz shu yerda paydo boʻladi',
    emptyBody:
      'Mahsulot rasmini yuklab, qisqa tavsif yozsangiz, loyiha shu roʻyxatda saqlanadi. Keyin uni ochib promptni qayta nusxalashingiz, yoki tavsifni oʻzgartirib yangi versiya tayyorlashingiz mumkin.',
    emptyCta: 'Birinchi loyihani boshlash',
    // The gallery is free and needs no sign-in (D-007). It arrives in P6.
    galleryNote: 'Misollar galereyasi bepul va kirishsiz ishlaydi.',
    galleryLink: 'Misollarni koʻrish',
    open: 'Ochish',
    delete: 'Oʻchirish',
    deleteConfirm: (name: string) => `"${name}" oʻchirilsinmi? Rasmlari ham oʻchadi.`,
    deleteCancel: 'Bekor qilish',
    deleteConfirmAction: 'Oʻchirish',
    photoCount: (n: number) => `${n} ta rasm`,
    annotationEmpty: 'boʻsh, lekin buzuq emas',
  },

  auth: {
    signInTitle: 'Kirish kerak',
    signInBody: 'Loyihani saqlash uchun Google orqali kiring. Yozganlaringiz saqlanib qoladi.',
    signInWithGoogle: 'Google orqali kirish',
    signedInAs: (email: string) => `Hisob: ${email}`,
  },

  /**
   * messageKey -> message + recovery action. The API's convention is
   * `errors.<code lowercased>`, so these keys are mechanical.
   *
   * Source 01 §47 forbids a bare "Something went wrong": every entry has an action.
   */
  errors: {
    session_expired: {
      message: 'Kirish muddati tugadi.',
      action: 'Qaytadan kirish',
      detail: 'Yozganlaringiz saqlanib turibdi.',
    },
    cross_origin_refused: {
      message: 'Soʻrov qabul qilinmadi.',
      action: 'Sahifani yangilash',
      detail: '',
    },
    validation_failed: {
      message: 'Maʼlumotlarda xatolik bor.',
      action: 'Tekshirib chiqing',
      detail: 'Belgilangan maydonni toʻgʻrilang.',
    },
    project_not_found: {
      message: 'Loyiha topilmadi.',
      action: 'Loyihalarimni ochish',
      detail: '',
    },
    project_ownership: {
      // Same message as project_not_found on purpose: never confirm that an id exists.
      message: 'Loyiha topilmadi.',
      action: 'Loyihalarimni ochish',
      detail: '',
    },
    asset_not_found: {
      message: 'Rasm topilmadi.',
      action: 'Qaytadan yuklash',
      detail: '',
    },
    too_many_photos: {
      message: '4 tadan ortiq rasm yuklab boʻlmaydi.',
      action: 'Bittasini olib tashlang',
      detail: '',
    },
    upload_type: {
      message: 'Bu rasm emas.',
      action: 'Boshqa fayl tanlash',
      detail: 'JPG, PNG yoki WebP yuboring.',
    },
    upload_too_large: {
      message: 'Rasm juda katta.',
      action: 'Boshqa rasm tanlash',
      detail: '10 MB gacha rasm yuboring.',
    },
    upload_damaged: {
      message: 'Rasm ochilmadi.',
      action: 'Boshqa rasm tanlash',
      detail: 'Fayl buzilgan boʻlishi mumkin.',
    },
    oauth_state_invalid: {
      message: 'Kirish sahifasi eskirgan.',
      action: 'Qaytadan kirish',
      detail: '',
    },
    auth_provider_failed: {
      message: 'Google javob bermadi.',
      action: 'Qaytadan urinish',
      detail: 'Bir ozdan soʻng urinib koʻring.',
    },
    google_config: {
      message: 'Xizmat hozircha sozlanmagan.',
      action: 'Keyinroq urinish',
      detail: '',
    },
    config_missing: {
      message: 'Xizmat hozircha sozlanmagan.',
      action: 'Keyinroq urinish',
      detail: '',
    },
    not_found: {
      message: 'Topilmadi.',
      action: 'Orqaga qaytish',
      detail: '',
    },
    http_error: {
      message: 'Kutilmagan xatolik.',
      action: 'Qaytadan urinish',
      detail: '',
    },
    internal_error: {
      message: 'Kutilmagan xatolik.',
      action: 'Qaytadan urinish',
      detail: '',
    },
    // P4's five codes. Session B's errors.test.ts reads the api's main branch and fails
    // if any seller-facing code has no copy here, which is how these were found.
    generation_not_found: {
      message: 'Bu natija topilmadi.',
      action: 'Loyihalar roʻyxatiga qaytish',
      detail: '',
    },
    idempotency_key_required: {
      message: 'Soʻrov toʻliq yuborilmadi.',
      action: 'Sahifani yangilab, qaytadan urinish',
      // A client bug, not the seller's: the key is added by the app, never typed.
      detail: 'Limitingiz sarflanmadi.',
    },
    job_in_flight: {
      message: 'Bitta prompt allaqachon tayyorlanmoqda.',
      action: 'Tayyor boʻlishini kutish',
      detail: 'Bir vaqtda bitta prompt tayyorlanadi.',
    },
    needs_input_cap: {
      message: 'Bu loyiha uchun savollar koʻpaydi.',
      action: 'Rasm va tavsifni aniqlashtirish',
      detail: 'Ertaga yana urinib koʻrishingiz mumkin. Limitingiz sarflanmadi.',
    },
    no_assets: {
      message: 'Mahsulot rasmi yuklanmagan.',
      action: 'Kamida bitta rasm yuklash',
      detail: '',
    },
    generation_still_running: {
      message: 'Hali tayyor emas',
      action: 'Loyihalar roʻyxatidan keyinroq tekshiring',
      detail: 'Krediting saqlanib qoldi. Tayyor boʻlgach, natija loyihada turadi.',
    },
    network_offline: {
      message: 'Internet aloqasi uzildi.',
      action: 'Qaytadan urinish',
      detail: 'Yozganlaringiz saqlanib turibdi.',
    },

    // Reachable only once P3 and P4 land. Present so the map is complete and the
    // components are already wired; no screens are built for them yet.
    no_credits: {
      message: 'Prompt limiti tugadi.',
      action: 'Limit toʻldirish',
      detail: '',
    },
    order_pending: {
      message: 'Toʻlovingiz tekshirilmoqda.',
      action: 'Holatni koʻrish',
      detail: '',
    },
    ai_timeout: {
      message: 'Tayyorlash juda uzoq davom etdi.',
      action: 'Qaytadan urinish',
      detail: 'Limitingiz sarflanmadi.',
    },
    ai_refused: {
      message: 'Bu mahsulot uchun ssenariy tayyorlanmadi.',
      action: 'Tavsifni oʻzgartirish',
      detail: '',
    },
    ai_malformed: {
      message: 'Natija toʻliq kelmadi.',
      action: 'Qaytadan urinish',
      detail: 'Limitingiz sarflanmadi.',
    },
    ai_truncated: {
      message: 'Natija yarmida uzilib qoldi.',
      action: 'Qaytadan urinish',
      detail: 'Limitingiz sarflanmadi.',
    },
    reference_conflict: {
      message: 'Rasmlar bir xil mahsulotga oʻxshamadi.',
      action: 'Rasmlarni tekshirish',
      detail: 'Bir xil model va variant yuboring.',
    },
    rate_limited: {
      message: 'Juda tez-tez soʻraldi.',
      action: 'Bir ozdan soʻng urinish',
      detail: '',
    },
    spend_cap_reached: {
      message: 'Bugungi chegara tugadi.',
      action: 'Ertaga urinish',
      detail: '',
    },
    // P3 merged to main on 2026-09-12 while P5 was being built, bringing seven codes
    // with it. Copy is written now so the credit and order screens inherit a complete
    // error map; those screens themselves are not built yet.
    order_not_found: {
      message: 'Buyurtma topilmadi.',
      action: 'Buyurtmalarni koʻrish',
      detail: '',
    },
    order_not_pending: {
      message: 'Bu buyurtma allaqachon koʻrib chiqilgan.',
      action: 'Holatni yangilash',
      detail: '',
    },
    pack_not_available: {
      message: 'Bu paket hozir mavjud emas.',
      action: 'Boshqa paketni tanlash',
      detail: '',
    },
    payment_not_configured: {
      message: 'Toʻlov usullari hali sozlanmagan.',
      action: 'Keyinroq urinish',
      detail: '',
    },
    setting_not_found: {
      message: 'Sozlama topilmadi.',
      action: 'Sahifani yangilash',
      detail: '',
    },
    grant_note_required: {
      // Owner-facing: the admin panel requires a note on every grant (D-037).
      message: 'Izoh yozilishi shart.',
      action: 'Izoh qoʻshing',
      detail: '',
    },
    ledger_invariant: {
      // Internal. If this ever reaches a seller it is a bug, so the copy says nothing
      // about the ledger and offers the one safe action.
      message: 'Kutilmagan xatolik.',
      action: 'Qoʻllab-quvvatlashga murojaat qiling',
      detail: 'Hisobingizdan hech narsa yechilmadi.',
    },
  },

  /**
   * The owner panel (D-037). Owner-only, and the role check in the UI only hides
   * things: every one of these screens calls /api/owner/*, which the API guards with
   * SessionGuard + OwnerGuard. The client is never the gate.
   */
  admin: {
    title: 'Egasi paneli',
    badge: 'Egasi',
    backToStudio: 'Studiyaga qaytish',
    tabOrders: 'Buyurtmalar',
    tabGrants: 'Limit berish',
    tabSettings: 'Sozlamalar',
    tabUsers: 'Foydalanuvchilar',

    deniedTitle: 'Bu sahifa faqat egasi uchun',
    deniedBody: 'Hisobingizda bu sahifani ochish huquqi yoʻq.',
    deniedAction: 'Studiyaga qaytish',

    orders: {
      title: 'Buyurtmalar',
      filterPending: 'Kutilmoqda',
      filterPaid: 'Tasdiqlangan',
      filterRejected: 'Rad etilgan',
      filterCancelled: 'Bekor qilingan',
      empty: 'Bu holatda buyurtma yoʻq.',
      emptyHint: 'Yangi buyurtmalar shu yerda paydo boʻladi.',
      credits: (n: number) => `${n} ta prompt`,
      confirm: 'Tasdiqlash',
      reject: 'Rad etish',
      confirming: 'Tasdiqlanmoqda',
      rejectReason: 'Rad etish sababi',
      rejectReasonHelp: 'Sotuvchi bu matnni koʻradi. Aniq yozing.',
      rejectSubmit: 'Rad etishni tasdiqlash',
      cancel: 'Bekor qilish',
      // Confirming an order moves real credits, so it is never a single stray click.
      confirmWarn: (credits: number, email: string) =>
        `${email} hisobiga ${credits} ta prompt qoʻshiladi. Bu amal qaytarilmaydi.`,
      payer: 'Toʻlovchi',
      noPayer: 'Koʻrsatilmagan',
      method: {
        card_transfer: 'Karta orqali',
        payme: 'Payme',
        click: 'Click',
        other: 'Boshqa',
      },
      status: {
        pending: 'Kutilmoqda',
        paid: 'Tasdiqlangan',
        rejected: 'Rad etilgan',
        cancelled: 'Bekor qilingan',
      },
    },

    grants: {
      title: 'Limit berish',
      sub: 'Sotuvchiga qoʻlda prompt limiti qoʻshish. Har bir amal yozib boriladi.',
      user: 'Foydalanuvchi',
      userHelp: 'Roʻyxatdan tanlang.',
      credits: 'Nechta prompt',
      note: 'Izoh',
      noteHelp: 'Nima uchun berilgani. Majburiy.',
      submit: 'Limitni qoʻshish',
      submitting: 'Qoʻshilmoqda',
      done: (credits: number, email: string) => `${email} hisobiga ${credits} ta prompt qoʻshildi.`,
    },

    settings: {
      title: 'Sozlamalar',
      payment: 'Toʻlov maʼlumotlari',
      paymentSub: 'Sotuvchilar toʻlov sahifasida shuni koʻradi.',
      cardNumber: 'Karta raqami',
      cardHolder: 'Karta egasi',
      paymeUrl: 'Payme havolasi',
      clickUrl: 'Click havolasi',
      instructions: 'Qoʻshimcha koʻrsatma',
      support: 'Aloqa',
      supportSub: 'Muammo boʻlganda sotuvchi shu yerga yozadi.',
      telegramUser: 'Telegram foydalanuvchi',
      telegramBot: 'Telegram bot',
      email: 'Email',
      packs: 'Paketlar va narxlar',
      // No prices are shown to sellers until the owner sets real ones (D-007 rules).
      packsSub: 'Narx qoʻyilmaguncha sotuvchilarga hech qanday narx koʻrsatilmaydi.',
      packCredits: (n: number) => `${n} ta prompt`,
      packPrice: 'Narxi (soʻm)',
      packActive: 'Faol',
      packNoPrice: 'Narx qoʻyilmagan',
      save: 'Saqlash',
      saving: 'Saqlanmoqda',
      saved: 'Saqlandi',
    },

    users: {
      title: 'Foydalanuvchilar',
      sub: 'Faqat oʻqish uchun.',
      email: 'Email',
      role: 'Rol',
      available: 'Mavjud',
      reserved: 'Band',
      joined: 'Qoʻshilgan',
      roleOwner: 'Egasi',
      roleSeller: 'Sotuvchi',
      empty: 'Hozircha foydalanuvchi yoʻq.',
    },
  },

  /**
   * The seller's own credit and order screens (D-007, D-008).
   *
   * No price is ever shown until the owner sets one: GET /api/packs returns packs whose
   * priceUzs is null until then, and a pack without a price cannot be ordered. Inventing
   * a number here would be exactly the fake pricing CLAUDE.md forbids.
   */
  credits: {
    title: 'Prompt limiti',
    balanceLabel: 'Mavjud promptlar',
    reservedNote: (n: number) => `${n} tasi hozir band`,
    empty: 'Prompt limiti tugagan.',
    emptySub: 'Yangi prompt tayyorlash uchun paket tanlang.',
    buy: 'Paket olish',
    close: 'Yopish',
    packsTitle: 'Paketlar',
    // Shown when Jakhongir has not priced anything yet (D-082 is still open).
    noPacks: 'Paketlar hali sozlanmagan.',
    noPacksSub: 'Narxlar tayyor boʻlgach, shu yerda koʻrinadi. Hozircha buyurtma berib boʻlmaydi.',
    packCredits: (n: number) => `${n} ta prompt`,
    perPrompt: (uzs: string) => `1 ta prompt ${uzs}`,
    choosePack: 'Tanlash',
    chosen: 'Tanlandi',
    methodLabel: 'Toʻlov usuli',
    payerLabel: 'Toʻlovchi ismi yoki chek raqami',
    payerHelp: 'Ixtiyoriy, lekin toʻlovni tezroq topishga yordam beradi.',
    submit: 'Buyurtma berish',
    submitting: 'Yuborilmoqda',
    howToPay: 'Qanday toʻlanadi',
    noPaymentInfo: 'Toʻlov maʼlumotlari hali kiritilmagan. Qoʻllab-quvvatlashga yozing.',
    cardNumber: 'Karta raqami',
    cardHolder: 'Karta egasi',
    ordersTitle: 'Buyurtmalarim',
    noOrders: 'Hozircha buyurtma yoʻq.',
    cancel: 'Bekor qilish',
    cancelling: 'Bekor qilinmoqda',
    pendingNote: 'Toʻlov tekshirilgach, promptlar hisobingizga qoʻshiladi.',
    status: {
      pending: 'Kutilmoqda',
      paid: 'Tasdiqlangan',
      rejected: 'Rad etilgan',
      cancelled: 'Bekor qilingan',
    },
    method: {
      card_transfer: 'Karta orqali',
      payme: 'Payme',
      click: 'Click',
      other: 'Boshqa',
    },
    support: 'Aloqa',
  },

  common: {
    required: 'Majburiy',
    optional: 'Ixtiyoriy',
    characters: (used: number, max: number) => `${used} / ${max}`,
    requestId: (id: string) => `Soʻrov raqami: ${id}`,
    loading: 'Yuklanmoqda',
    yes: 'Ha',
    no: 'Yoʻq',
  },
} as const;

export type Catalogue = typeof uzLatn;
export type ErrorKey = keyof Catalogue['errors'];
