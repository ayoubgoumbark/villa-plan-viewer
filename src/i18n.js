const translations = {
  en: {
    homeAria: 'QUÁLITY SIGN home', logoAlt: 'QUÁLITY SIGN logo', languageAria: 'Language', north: 'N',
    brandSubtitle: 'INTERIOR & EXTERIOR DESIGN', edition: 'CONCEPT MODEL / OCT 2026', made: 'INTERIOR & EXTERIOR DESIGN ↗',
    heroEyebrow: '— RESIDENTIAL / 001', heroLead: 'A home,', heroEm: 'opened up.', heroNote1: 'One floor. A little more room', heroNote2: 'to see how it all fits together.',
    cardAria: 'Interactive villa floor plan', viewAxon: 'AXONOMETRIC VIEW', viewPlan: 'PLAN VIEW', viewWalk: 'WALK-THROUGH VIEW',
    fallbackAlt: 'Rendered 3D preview of the open-top villa floor plan', canvasAria: '3D villa floor plan. Drag to orbit; use the zoom buttons to zoom', roomLabelsAria: 'Room labels',
    loading: 'Setting the scene…', defaultError: "Couldn't load the model. Refresh to try again.", navHint: 'DRAG TO ORBIT · USE + / − TO ZOOM', toolbarAria: 'Explore controls', walk: 'Walk inside', labels: 'Labels',
    walkMessageDesktop: 'W A S D TO WALK · CLICK THE VIEW, MOVE MOUSE TO LOOK · ESC TO EXIT AND SCROLL', walkMessageTouch: 'USE ARROWS TO WALK · DRAG TO LOOK · TAP EXIT WALK TO SCROLL', walkExit: 'Exit walk · Scroll page', walkPadAria: 'Touch walking controls',
    walkForward: 'Walk forward', walkBackward: 'Walk backward', walkLeft: 'Walk left', walkRight: 'Walk right',
    viewsAria: 'Views', axonAria: 'Axonometric view', planAria: 'Top-down view', resetAria: 'Reset view', zoomAria: 'Zoom', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    project: 'PROJECT / 001', floor: 'FLOOR 00', infoEyebrow: 'THE EVERYDAY, IN PLAN', infoTitle1: 'Find your way', infoTitle2: 'around.',
    desc: 'Choose a room to bring it into focus. Use Walk inside for an eye-level tour of the building.', chooseRoom: 'CHOOSE A ROOM TO EXPLORE', roomWord: 'ROOM', focusRoom: 'Focus on',
    roomsEyebrow: 'ROOMS / TAP TO FOCUS', loadingRooms: 'Loading rooms…', download: 'DOWNLOAD 3D MODEL', study: 'OPEN-TOP STUDY · 2026',
    captionVilla: 'VILLA 01 / OPEN-TOP STUDY', captionChoose: 'SELECT A ROOM TO EXPLORE',
    specsLead1: 'A QUIET LOOK AT', specsText1: 'HOME, IN PLAN', specsLead2: 'ONE FLOOR', specsText2: 'ROOM TO WANDER', specsLead3: 'MADE TO EXPLORE', specsText3: 'ROTATE · WALK · ZOOM', specsEnd: 'A SMALL WINDOW INTO A BIGGER IDEA ↗',
    footer: 'AN EARLY VISUAL STUDY / DIMENSIONS ARE APPROXIMATE',
    webglError: 'Interactive 3D is unavailable in this browser. Showing a rendered preview instead.', timeoutError: 'The 3D model is taking too long to load. Showing a rendered preview instead.',
    modelError: 'The 3D model could not be loaded. Showing a rendered preview instead.', startupError: 'The interactive viewer could not start. Showing a rendered preview instead.',
    rooms: ['Salon', 'Spa', 'Gym', 'Bedroom 01', 'Cinema room', 'Staircase', 'Hall', 'Bathroom 01', 'Bathroom 02', 'Bedroom 02', 'Dining room', 'Kitchen', 'Garage'],
  },
  fr: {
    homeAria: 'Accueil QUÁLITY SIGN', logoAlt: 'Logo QUÁLITY SIGN', languageAria: 'Langue', north: 'N',
    brandSubtitle: 'AMÉNAGEMENT INTÉRIEUR & EXTÉRIEUR', edition: 'MODÈLE CONCEPT / OCT. 2026', made: 'AMÉNAGEMENT & DÉCOR ↗',
    heroEyebrow: '— RÉSIDENTIEL / 001', heroLead: 'Une maison,', heroEm: 'à découvrir.', heroNote1: 'Un seul niveau. Plus d’espace', heroNote2: 'pour imaginer chaque pièce.',
    cardAria: 'Plan interactif de la villa', viewAxon: 'VUE AXONOMÉTRIQUE', viewPlan: 'VUE EN PLAN', viewWalk: 'VISITE À PIED',
    fallbackAlt: 'Aperçu 3D du plan de la villa sans toiture', canvasAria: 'Plan 3D de la villa. Faites glisser pour tourner ; utilisez les boutons pour zoomer', roomLabelsAria: 'Noms des pièces',
    loading: 'Chargement de la scène…', defaultError: 'Impossible de charger le modèle. Actualisez la page.', navHint: 'GLISSER POUR TOURNER · + / − POUR ZOOMER', toolbarAria: 'Commandes de visite', walk: 'Visite à pied', labels: 'Noms des pièces',
    walkMessageDesktop: 'Z Q S D POUR MARCHER · CLIQUER SUR LA VUE, BOUGER LA SOURIS · ÉCHAP POUR QUITTER', walkMessageTouch: 'FLÈCHES POUR MARCHER · GLISSER POUR REGARDER · QUITTER POUR DÉFILER', walkExit: 'Quitter la visite · Défiler', walkPadAria: 'Commandes tactiles de déplacement',
    walkForward: 'Avancer', walkBackward: 'Reculer', walkLeft: 'Aller à gauche', walkRight: 'Aller à droite',
    viewsAria: 'Vues', axonAria: 'Vue axonométrique', planAria: 'Vue de dessus', resetAria: 'Réinitialiser la vue', zoomAria: 'Zoom', zoomIn: 'Zoomer', zoomOut: 'Dézoomer',
    project: 'PROJET / 001', floor: 'NIVEAU 00', infoEyebrow: 'LE QUOTIDIEN, EN PLAN', infoTitle1: 'Explorez', infoTitle2: 'la villa.',
    desc: 'Choisissez une pièce pour la voir de près. Lancez la visite à pied pour parcourir le bâtiment à hauteur des yeux.', chooseRoom: 'CHOISISSEZ UNE PIÈCE', roomWord: 'PIÈCE', focusRoom: 'Voir',
    roomsEyebrow: 'PIÈCES / TOUCHER POUR VOIR', loadingRooms: 'Chargement des pièces…', download: 'TÉLÉCHARGER LE MODÈLE 3D', study: 'ÉTUDE SANS TOITURE · 2026',
    captionVilla: 'VILLA 01 / ÉTUDE SANS TOITURE', captionChoose: 'CHOISISSEZ UNE PIÈCE',
    specsLead1: 'UN AUTRE REGARD SUR', specsText1: 'LA MAISON EN PLAN', specsLead2: 'UN NIVEAU', specsText2: 'DE L’ESPACE À PARCOURIR', specsLead3: 'À EXPLORER', specsText3: 'TOURNER · MARCHER · ZOOMER', specsEnd: 'UNE FENÊTRE SUR UN GRAND PROJET ↗',
    footer: 'ÉTUDE VISUELLE PRÉLIMINAIRE / DIMENSIONS APPROXIMATIVES',
    webglError: 'La 3D interactive est indisponible dans ce navigateur. Aperçu affiché.', timeoutError: 'Le chargement du modèle prend trop de temps. Aperçu affiché.',
    modelError: 'Le modèle 3D n’a pas pu être chargé. Aperçu affiché.', startupError: 'La visionneuse n’a pas pu démarrer. Aperçu affiché.',
    rooms: ['Salon', 'Spa', 'Salle de sport', 'Chambre 01', 'Salle cinéma', 'Escalier', 'Hall', 'Salle de bain 01', 'Salle de bain 02', 'Chambre 02', 'Salle à manger', 'Cuisine', 'Garage'],
  },
  ar: {
    homeAria: 'الصفحة الرئيسية لـ QUÁLITY SIGN', logoAlt: 'شعار QUÁLITY SIGN', languageAria: 'اللغة', north: 'ش',
    brandSubtitle: 'تصميم داخلي وخارجي', edition: 'نموذج أولي / أكتوبر ٢٠٢٦', made: 'تهيئة وديكور ↗',
    heroEyebrow: '— سكني / ٠٠١', heroLead: 'منزل،', heroEm: 'من زاوية جديدة.', heroNote1: 'طابق واحد، ومساحة أوسع', heroNote2: 'لاستكشاف تفاصيله.',
    cardAria: 'مخطط الفيلا التفاعلي', viewAxon: 'منظور ثلاثي الأبعاد', viewPlan: 'المخطط من الأعلى', viewWalk: 'جولة داخل الفيلا',
    fallbackAlt: 'معاينة ثلاثية الأبعاد لمخطط الفيلا المفتوح', canvasAria: 'مخطط الفيلا ثلاثي الأبعاد. اسحب لتدوير العرض واستخدم أزرار التكبير', roomLabelsAria: 'أسماء الغرف',
    loading: 'جارٍ تجهيز المشهد…', defaultError: 'تعذّر تحميل النموذج. حدّث الصفحة للمحاولة مجددًا.', navHint: 'اسحب لتدوير العرض · استخدم + / − للتكبير', toolbarAria: 'أدوات الاستكشاف', walk: 'تجوّل بالداخل', labels: 'أسماء الغرف',
    walkMessageDesktop: 'استخدم W A S D للمشي · انقر على المشهد وحرّك الفأرة للنظر · اضغط Esc للخروج', walkMessageTouch: 'استخدم الأسهم للمشي · اسحب للنظر · اضغط إنهاء الجولة للتمرير', walkExit: 'إنهاء الجولة · تصفّح الصفحة', walkPadAria: 'أزرار المشي باللمس',
    walkForward: 'المشي للأمام', walkBackward: 'المشي للخلف', walkLeft: 'المشي لليسار', walkRight: 'المشي لليمين',
    viewsAria: 'طرق العرض', axonAria: 'منظور ثلاثي الأبعاد', planAria: 'العرض من الأعلى', resetAria: 'إعادة ضبط العرض', zoomAria: 'التكبير', zoomIn: 'تكبير', zoomOut: 'تصغير',
    project: 'المشروع / ٠٠١', floor: 'الطابق ٠٠', infoEyebrow: 'الحياة اليومية على المخطط', infoTitle1: 'استكشف', infoTitle2: 'الفيلا.',
    desc: 'اختر غرفة للتركيز عليها. استخدم جولة المشي لرؤية المبنى من مستوى العين.', chooseRoom: 'اختر غرفة لاستكشافها', roomWord: 'الغرفة', focusRoom: 'عرض',
    roomsEyebrow: 'الغرف / اضغط للتركيز', loadingRooms: 'جارٍ تحميل الغرف…', download: 'تنزيل النموذج ثلاثي الأبعاد', study: 'دراسة مفتوحة السقف · ٢٠٢٦',
    captionVilla: 'الفيلا ٠١ / دراسة مفتوحة السقف', captionChoose: 'اختر غرفة لاستكشافها',
    specsLead1: 'نظرة هادئة إلى', specsText1: 'المنزل على المخطط', specsLead2: 'طابق واحد', specsText2: 'مساحة للتجوّل', specsLead3: 'صُمّم للاستكشاف', specsText3: 'تدوير · مشي · تكبير', specsEnd: 'نافذة صغيرة على فكرة أكبر ↗',
    footer: 'دراسة تصورية أولية / الأبعاد تقريبية',
    webglError: 'العرض التفاعلي غير متاح في هذا المتصفح. تُعرض معاينة بدلًا منه.', timeoutError: 'استغرق تحميل النموذج وقتًا طويلًا. تُعرض معاينة بدلًا منه.',
    modelError: 'تعذّر تحميل النموذج ثلاثي الأبعاد. تُعرض معاينة بدلًا منه.', startupError: 'تعذّر تشغيل العارض التفاعلي. تُعرض معاينة بدلًا منه.',
    rooms: ['الصالون', 'السبا', 'قاعة الرياضة', 'غرفة النوم ٠١', 'قاعة السينما', 'الدرج', 'المدخل', 'حمّام ٠١', 'حمّام ٠٢', 'غرفة النوم ٠٢', 'غرفة الطعام', 'المطبخ', 'المرآب'],
  },
};

let language = 'en';

export function t(key) { return translations[language][key] ?? translations.en[key] ?? key; }
export function getLanguage() { return language; }

export function setLanguage(next) {
  if (!translations[next]) return;
  language = next;
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  try { localStorage.setItem('villa-language', next); } catch { /* Storage is optional. */ }
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => { element.alt = t(element.dataset.i18nAlt); });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => { element.title = t(element.dataset.i18nTitle); });
  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === next;
    button.classList.toggle('chosen', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.title = next === 'ar' ? 'QUÁLITY SIGN — الفيلا ٠١' : next === 'fr' ? 'QUÁLITY SIGN — Villa 01' : 'QUÁLITY SIGN — Villa 01';
  document.querySelector('meta[name="description"]').content = next === 'ar' ? 'استكشف مخطط الفيلا ثلاثي الأبعاد من QUÁLITY SIGN.' : next === 'fr' ? 'Explorez le plan 3D interactif de la villa par QUÁLITY SIGN.' : 'Explore an interactive open-top 3D villa plan presented by QUÁLITY SIGN.';
  window.dispatchEvent(new Event('villa-language-change'));
}

export function initLanguage() {
  let saved = 'en';
  try { saved = localStorage.getItem('villa-language') || 'en'; } catch { /* Storage is optional. */ }
  setLanguage(translations[saved] ? saved : 'en');
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
}
