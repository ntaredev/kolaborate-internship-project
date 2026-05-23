/**
 * AnchorID – Internationalization System
 * Supports English, Swahili, French, and Arabic (RTL)
 */

export type Language = 'en' | 'sw' | 'fr' | 'ar'

export interface TranslationSet {
  dir: 'ltr' | 'rtl'
  common: {
    back: string
    cancel: string
    confirm: string
    save: string
    close: string
    loading: string
    success: string
    error: string
    logout: string
    unlocked: string
    locked: string
  }
  landing: {
    heroTitle: string
    heroSubtitle: string
    heroDesc: string
    openWallet: string
    issuePortal: string
    verifyPortal: string
    adminPortal: string
    missionTitle: string
    missionText: string
    organizationsTitle: string
    accessibilityTitle: string
    accessibilityText: string
  }
  wallet: {
    unlockTitle: string
    unlockDesc: string
    setupPasskey: string
    setupPIN: string
    enterPIN: string
    pinFallback: string
    firstTimeTitle: string
    firstTimeDesc: string
    generateKeys: string
    generatingKeys: string
    keysSuccess: string
    biometricVerify: string
    walletLocked: string
    myCredentials: string
    noCredentials: string
    noCredentialsDesc: string
    addCredentialBtn: string
    didLabel: string
    copyDID: string
    copied: string
    wipeTitle: string
    wipeDesc: string
    wipeConfirm: string
    presentTitle: string
    presentDesc: string
    discloseFields: string
    generateQR: string
    qrExpires: string
    socialRecovery: string
    recoveryDesc: string
    recoveryContacts: string
    recoveryContactsDesc: string
    setupContacts: string
    restoreIdentity: string
    restoreIdentityDesc: string
  }
  issuer: {
    title: string
    issueBtn: string
    credentialType: string
    holderName: string
    holderDid: string
    dob: string
    nationality: string
    holderId: string
    expiryDate: string
    issueSuccess: string
    copyPayload: string
    credentialRegistry: string
    revocationRegistry: string
    revokeBtn: string
    revokedStatus: string
    activeStatus: string
  }
  verifier: {
    title: string
    scanTitle: string
    scanDesc: string
    verifyBtn: string
    pastePayload: string
    pastePlaceholder: string
    verificationStatus: string
    valid: string
    revoked: string
    expired: string
    details: string
    trustedIssuer: string
    untrustedIssuer: string
  }
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    dir: 'ltr',
    common: {
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      logout: 'Lock Wallet',
      unlocked: 'Unlocked',
      locked: 'Locked',
    },
    landing: {
      heroTitle: 'AnchorID',
      heroSubtitle: 'Dignified & Decentralized Humanitarian Identity',
      heroDesc: 'AnchorID gives refugees and stateless persons absolute control over their vital documents. Secure, offline-first, and cryptographically verified digital credentials that travel with you, not in a server database.',
      openWallet: 'ACCESS MY WALLET',
      issuePortal: 'ISSUER LOGIN',
      verifyPortal: 'VERIFY A CREDENTIAL',
      adminPortal: 'ADMIN CONSOLE',
      missionTitle: 'Our Humanitarian Mission',
      missionText: 'In moments of crisis, physical documents are easily lost or destroyed, and centralized databases put vulnerable populations at severe surveillance risk. AnchorID uses W3C Verifiable Credentials and client-side encryption. Refugees hold their credentials directly in their browser storage, preserving absolute privacy and dignity while enabling instantaneous cryptographic verification offline by aid groups, clinics, and banks.',
      organizationsTitle: 'Supported by Leading Organizations',
      accessibilityTitle: 'Universal Accessibility Compliance',
      accessibilityText: 'Designed for crisis scenarios and low-cost Android mobile devices. Fully compliant with WCAG 2.1 AA accessibility standards, featuring high-contrast themes, screen-reader optimizations, RTL support, and keyboard navigability.',
    },
    wallet: {
      unlockTitle: 'Unlock Your Wallet',
      unlockDesc: 'Use your device passkey, biometrics, or backup PIN code to securely unlock your credentials.',
      setupPasskey: 'Set Up Biometric Passkey',
      setupPIN: 'Create Backup PIN',
      enterPIN: 'Enter 6-Digit Backup PIN',
      pinFallback: 'Use PIN Code Instead',
      firstTimeTitle: 'Create Secure Wallet',
      firstTimeDesc: 'No email or phone required. We will generate your decentralized identity keys directly on your device.',
      generateKeys: 'Generate My Cryptographic ID',
      generatingKeys: 'Deriving secure keys client-side...',
      keysSuccess: 'Identity keys successfully derived!',
      biometricVerify: 'Verify with biometrics',
      walletLocked: 'Wallet is locked. Unlock to view credentials.',
      myCredentials: 'My Credentials',
      noCredentials: 'No Credentials Stored',
      noCredentialsDesc: 'You do not have any verifiable credentials in your offline wallet yet. Request one from UNHCR or an authorized NGO, then click Import.',
      addCredentialBtn: 'Import Credential',
      didLabel: 'My Decentralized ID (DID)',
      copyDID: 'Copy DID Key',
      copied: 'Copied!',
      wipeTitle: 'Emergency Wipe Wallet',
      wipeDesc: 'WARNING: This will permanently delete all local keys and stored credentials from this device. Use this in surveillance or high-risk situations. This action cannot be undone.',
      wipeConfirm: 'Wipe All Wallet Data',
      presentTitle: 'Present Credential',
      presentDesc: 'Configure selective disclosure. Only the checked attributes will be encoded and displayed in your presentation QR code.',
      discloseFields: 'Select Fields to Disclose',
      generateQR: 'Generate Secure Presentation QR',
      qrExpires: 'This secure QR is short-lived and will expire in:',
      socialRecovery: 'Social Identity Recovery',
      recoveryDesc: 'Reconstruct your cryptographic identity if you lose your device using 3-of-5 trusted guardians.',
      recoveryContacts: 'My Recovery Guardians',
      recoveryContactsDesc: 'Nominate trusted contacts. Each will receive a recovery slice key to help you rebuild your identity.',
      setupContacts: 'Set Up Contacts',
      restoreIdentity: 'Restore Wallet',
      restoreIdentityDesc: 'Paste 3 recovery keys provided by your guardians to reconstruct your original DID key and restore access.',
    },
    issuer: {
      title: 'Humanitarian Issuer Portal',
      issueBtn: 'Issue Signed Credential',
      credentialType: 'Credential Schema Type',
      holderName: 'Holder Full Name',
      holderDid: 'Holder DID (Decentralized Identifier)',
      dob: 'Date of Birth',
      nationality: 'Nationality',
      holderId: 'UNHCR / National Register ID',
      expiryDate: 'Expiration Date',
      issueSuccess: 'Verifiable Credential Cryptographically Signed!',
      copyPayload: 'Copy Signed JSON Payload for Holder',
      credentialRegistry: 'Credential Registry',
      revocationRegistry: 'Active Revocation List',
      revokeBtn: 'Revoke',
      revokedStatus: 'REVOKED',
      activeStatus: 'ACTIVE',
    },
    verifier: {
      title: 'Aid & Clinic Verifier Portal',
      scanTitle: 'Cryptographic QR Verification',
      scanDesc: 'Scan or paste a Holder Presentation QR payload. Signature, issuer trust, and real-time revocation will be evaluated offline.',
      verifyBtn: 'Verify Presentation',
      pastePayload: 'Paste Presentation JSON Payload',
      pastePlaceholder: 'Paste the JSON or scan QR code representation here...',
      verificationStatus: 'VERIFICATION STATUS',
      valid: 'CRYPTOGRAPHICALLY VALID',
      revoked: 'CREDENTIAL REVOKED BY ISSUER',
      expired: 'PRESENTATION EXPIRED / REPLAY ATTACK DETECTED',
      details: 'Disclosed Attributes',
      trustedIssuer: 'TRUSTED ISSUER PROFILE',
      untrustedIssuer: 'UNAUTHORIZED ISSUER / WARNING',
    },
  },
  sw: {
    dir: 'ltr',
    common: {
      back: 'Nyuma',
      cancel: 'Ghairi',
      confirm: 'Thibitisha',
      save: 'Hifadhi',
      close: 'Funga',
      loading: 'Inapakia...',
      success: 'Mafanikio',
      error: 'Hitilafu',
      logout: 'Funga Mkoba',
      unlocked: 'Imefunguliwa',
      locked: 'Imefungwa',
    },
    landing: {
      heroTitle: 'AnchorID',
      heroSubtitle: 'Utambulisho wa Kibinadamu wa Heshima na Hati Daftari',
      heroDesc: 'AnchorID inawapa wakimbizi na wasio na utaifa udhibiti kamili wa hati zao muhimu. Hati salama, zinazofanya kazi nje ya mtandao na zilizothibitishwa ambazo husafiri nawe, si kwenye seva.',
      openWallet: 'FUNGUA MKOBA WANGU',
      issuePortal: 'INGIA KAMA MTOA HATI',
      verifyPortal: 'THIBITISHA HATI',
      adminPortal: 'DASHIBODI YA USIMAMIZI',
      missionTitle: 'Ujumbe Wetu wa Kibinadamu',
      missionText: 'Katika nyakati za shida, hati za karatasi hupotea kwa urahisi au kuharibiwa. AnchorID inatumia Hati Zinazothibitishwa za W3C. Wakimbizi huhifadhi hati zao moja kwa moja kwenye kivinjari chao, wakilinda faragha kamili huku wakiruhusu uthibitisho wa papo hapo wa kidijitali nje ya mtandao na vikundi vya misaada, kliniki, na benki.',
      organizationsTitle: 'Inasaidiwa na Mashirika Yanayoongoza',
      accessibilityTitle: 'Ufikiaji kwa Wote',
      accessibilityText: 'Imeundwa kwa ajili ya hali ya dharura na simu za bei nafuu za Android. Inatii kikamilifu viwango vya ufikiaji vya WCAG 2.1 AA.',
    },
    wallet: {
      unlockTitle: 'Fungua Mkoba Wako',
      unlockDesc: 'Tumia alama za vidole, uso au PIN ya chelezo kufungua hati zako salama.',
      setupPasskey: 'Weka Utambuzi wa Kibayometriki',
      setupPIN: 'Unda PIN ya Chelezo',
      enterPIN: 'Weka PIN ya Taratibu 6',
      pinFallback: 'Tumia PIN Badala yake',
      firstTimeTitle: 'Unda Mkoba Salama',
      firstTimeDesc: 'Hakuna barua pepe au nambari ya simu inayohitajika. Tutatengeneza funguo zako za utambulisho moja kwa moja kwenye kifaa chako.',
      generateKeys: 'Tengeneza Utambulisho Wangu wa Siri',
      generatingKeys: 'Inatengeneza funguo salama...',
      keysSuccess: 'Funguo za utambulisho zimekamilika!',
      biometricVerify: 'Thibitisha na kibayometriki',
      walletLocked: 'Mkoba umefungwa. Fungua ili uone hati.',
      myCredentials: 'Hati Zangu',
      noCredentials: 'Hakuna Hati Iliyohifadhiwa',
      noCredentialsDesc: 'Bado huna hati yoyote inayoweza kuthibitishwa kwenye mkoba wako wa nje ya mtandao. Omba moja kutoka kwa UNHCR au NGO iliyoidhinishwa.',
      addCredentialBtn: 'Ingiza Hati',
      didLabel: 'Utambulisho Wangu (DID)',
      copyDID: 'Nakili Funguo ya DID',
      copied: 'Imenakiliwa!',
      wipeTitle: 'Futa Data Yote ya Mkoba',
      wipeDesc: 'ONYO: Hii itafuta kabisa funguo zote na hati zilizohifadhiwa kwenye kifaa hiki. Kitendo hiki hakiwezi kubatilishwa.',
      wipeConfirm: 'Futa Mkoba Wote',
      presentTitle: 'Onyesha Hati',
      presentDesc: 'Chagua sifa unazotaka kuonyesha tu. Sifa zilizochaguliwa tu ndizo zitakazowekwa kwenye msimbo wa QR.',
      discloseFields: 'Chagua Sifa za Kuonyesha',
      generateQR: 'Unda Msimbo wa QR Salama',
      qrExpires: 'Msimbo huu wa QR utaisha muda wake baada ya:',
      socialRecovery: 'Urejeshaji wa Utambulisho wa Kijamii',
      recoveryDesc: 'Rejesha utambulisho wako wa kidijitali ukipoteza kifaa kwa kutumia walezi 3 kati ya 5 unaowaamini.',
      recoveryContacts: 'Walezi Wangu wa Urejeshaji',
      recoveryContactsDesc: 'Teua anwani unazoziamini za urejeshaji wa siri.',
      setupContacts: 'Weka Walezi',
      restoreIdentity: 'Rejesha Mkoba',
      restoreIdentityDesc: 'Weka funguo 3 za urejeshaji zilizotolewa na walezi wako ili kurejesha mkoba wako asili.',
    },
    issuer: {
      title: 'Tovuti ya Mtoa Hati ya Kibinadamu',
      issueBtn: 'Toa Hati Iliyosainiwa',
      credentialType: 'Aina ya Hati',
      holderName: 'Jina Kamili la Mwenye Hati',
      holderDid: 'DID ya Mwenye Hati',
      dob: 'Tarehe ya Kuzaliwa',
      nationality: 'Uraia',
      holderId: 'Kitambulisho cha UNHCR / Kitaifa',
      expiryDate: 'Tarehe ya Mwisho',
      issueSuccess: 'Hati Imesainiwa Kidijitali!',
      copyPayload: 'Nakili Mzigo wa JSON kwa Mwenye Hati',
      credentialRegistry: 'Daftari la Hati',
      revocationRegistry: 'Orodha ya Hati Zilizofutwa',
      revokeBtn: 'Batilisha',
      revokedStatus: 'IMEBATILISHWA',
      activeStatus: 'INAFANYA KAZI',
    },
    verifier: {
      title: 'Tovuti ya Mthibitishaji',
      scanTitle: 'Uthibitishaji wa Msimbo wa QR wa Kidijitali',
      scanDesc: 'Changanua au ubandike mzigo wa QR ili uthibitishe saini na hali ya kufutwa nje ya mtandao.',
      verifyBtn: 'Thibitisha Hati',
      pastePayload: 'Bandika Mzigo wa JSON wa Uwasilishaji',
      pastePlaceholder: 'Bandika JSON hapa...',
      verificationStatus: 'HALI YA UTHIBITISHAJI',
      valid: 'IMETHIBITISHWA KIKAMILIFU',
      revoked: 'HATI IMEBATILISHWA NA MTOAJI',
      expired: 'HATI IMEISHA MUDA / IMETUMIWA TENA',
      details: 'Sifa Zilizofichuliwa',
      trustedIssuer: 'MTOAJI ANAYEAMINIKA',
      untrustedIssuer: 'MTOAJI HAKUBALIKI / ONYO',
    },
  },
  fr: {
    dir: 'ltr',
    common: {
      back: 'Retour',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      close: 'Fermer',
      loading: 'Chargement...',
      success: 'Succès',
      error: 'Erreur',
      logout: 'Verrouiller',
      unlocked: 'Déverrouillé',
      locked: 'Verrouillé',
    },
    landing: {
      heroTitle: 'AnchorID',
      heroSubtitle: 'Identité Humanitaire Digne & Décentralisée',
      heroDesc: 'AnchorID offre aux réfugiés et aux personnes apatrides un contrôle absolu sur leurs documents vitaux. Des justificatifs numériques cryptés, stockés localement hors ligne, qui voyagent avec vous.',
      openWallet: 'ACCÉDER À MON PORTEFEUILLE',
      issuePortal: 'CONNEXION ÉMETTEUR',
      verifyPortal: 'VÉRIFIER UN DOCUMENT',
      adminPortal: 'CONSOLE ADMIN',
      missionTitle: 'Notre Mission Humanitaire',
      missionText: 'En temps de crise, les documents physiques sont facilement perdus et les bases de données centralisées exposent les populations vulnérables. AnchorID utilise des Verifiable Credentials du W3C. Les réfugiés stockent leurs identifiants directement sur leur navigateur, assurant une confidentialité absolue tout en permettant une vérification cryptographique hors ligne instantanée.',
      organizationsTitle: 'Soutenu par des Organisations Majeures',
      accessibilityTitle: 'Accessibilité Universelle',
      accessibilityText: 'Conçu pour les situations d\'urgence et les appareils Android d\'entrée de gamme. Conforme aux normes WCAG 2.1 AA.',
    },
    wallet: {
      unlockTitle: 'Déverrouiller le Portefeuille',
      unlockDesc: 'Utilisez votre clé de sécurité, votre biométrie ou votre code PIN pour déverrouiller vos identifiants.',
      setupPasskey: 'Activer la clé Biométrique',
      setupPIN: 'Créer un code PIN de secours',
      enterPIN: 'Entrer le code PIN à 6 chiffres',
      pinFallback: 'Utiliser le code PIN',
      firstTimeTitle: 'Créer un Portefeuille Sécurisé',
      firstTimeDesc: 'Ni e-mail ni téléphone requis. Nous générons vos clés d\'identité décentralisées directement sur votre appareil.',
      generateKeys: 'Générer mon identité cryptographique',
      generatingKeys: 'Génération des clés sécurisées...',
      keysSuccess: 'Clés d\'identité générées avec succès !',
      biometricVerify: 'Vérifier par biométrie',
      walletLocked: 'Portefeuille verrouillé. Déverrouillez pour voir vos documents.',
      myCredentials: 'Mes Documents',
      noCredentials: 'Aucun Document Stocké',
      noCredentialsDesc: 'Vous n\'avez pas encore d\'identifiants vérifiables hors ligne. Demandez-en un à l\'UNHCR ou à une ONG agréée.',
      addCredentialBtn: 'Importer un Document',
      didLabel: 'Mon Identifiant Décentralisé (DID)',
      copyDID: 'Copier la clé DID',
      copied: 'Copié !',
      wipeTitle: 'Suppression d\'urgence du portefeuille',
      wipeDesc: 'ATTENTION : Cela supprimera définitivement toutes les clés et identifiants stockés sur cet appareil. Cette action est irréversible.',
      wipeConfirm: 'Effacer toutes les données',
      presentTitle: 'Présenter le Document',
      presentDesc: 'Configurez la divulgation sélective. Seuls les attributs cochés seront encodés dans votre code QR de présentation.',
      discloseFields: 'Sélectionner les champs à divulguer',
      generateQR: 'Générer le code QR de présentation',
      qrExpires: 'Ce code QR expire dans :',
      socialRecovery: 'Récupération d\'Identité Sociale',
      recoveryDesc: 'Reconstituez votre identité si vous perdez votre appareil grâce à 3 tuteurs de confiance sur 5.',
      recoveryContacts: 'Mes Tuteurs de Récupération',
      recoveryContactsDesc: 'Nommez des contacts de confiance pour la récupération sociale.',
      setupContacts: 'Configurer les Tuteurs',
      restoreIdentity: 'Restaurer le Portefeuille',
      restoreIdentityDesc: 'Collez 3 clés de récupération fournies par vos tuteurs pour reconstruire votre DID original.',
    },
    issuer: {
      title: 'Portail des Émetteurs Humanitaires',
      issueBtn: 'Émettre un Document Signé',
      credentialType: 'Type de document',
      holderName: 'Nom complet du titulaire',
      holderDid: 'DID du titulaire',
      dob: 'Date de naissance',
      nationality: 'Nationalité',
      holderId: 'Identifiant UNHCR / Registre National',
      expiryDate: 'Date d\'expiration',
      issueSuccess: 'Document signé cryptographiquement avec succès !',
      copyPayload: 'Copier le contenu JSON pour le titulaire',
      credentialRegistry: 'Registre des documents',
      revocationRegistry: 'Liste d\'annulation active',
      revokeBtn: 'Révoquer',
      revokedStatus: 'RÉVOQUÉ',
      activeStatus: 'ACTIF',
    },
    verifier: {
      title: 'Portail de Vérification',
      scanTitle: 'Vérification Cryptographique QR',
      scanDesc: 'Scannez ou collez un contenu de présentation QR pour valider la signature et le statut d\'annulation hors ligne.',
      verifyBtn: 'Vérifier la présentation',
      pastePayload: 'Coller le contenu JSON de présentation',
      pastePlaceholder: 'Collez le JSON ici...',
      verificationStatus: 'STATUT DE VÉRIFICATION',
      valid: 'CRYPTOGRAPHIQUEMENT VALIDE',
      revoked: 'DOCUMENT RÉVOQUÉ PAR L\'ÉMETTEUR',
      expired: 'PRÉSENTATION EXPIRÉE / TENTATIVE DE REJOUE',
      details: 'Attributs Divulgués',
      trustedIssuer: 'PROFIL ÉMETTEUR DE CONFIANCE',
      untrustedIssuer: 'ÉMETTEUR NON AUTORISÉ / DANGER',
    },
  },
  ar: {
    dir: 'rtl',
    common: {
      back: 'رجوع',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      success: 'نجاح',
      error: 'خطأ',
      logout: 'قفل المحفظة',
      unlocked: 'مفتوح',
      locked: 'مغلق',
    },
    landing: {
      heroTitle: 'AnchorID',
      heroSubtitle: 'هوية إنسانية كريمة ولامركزية',
      heroDesc: 'تمنح محفظة AnchorID اللاجئين والأشخاص عديمي الجنسية تحكماً مطلقاً في وثائقهم الحيوية. مؤهلات رقمية آمنة وموقعة وتعمل بدون إنترنت تنتقل معك، وليست في قاعدة بيانات خادم.',
      openWallet: 'الدخول إلى محفظتي',
      issuePortal: 'تسجيل دخول مصدر الهوية',
      verifyPortal: 'التحقق من وثيقة',
      adminPortal: 'لوحة التحكم للمسؤولين',
      missionTitle: 'رسالتنا الإنسانية',
      missionText: 'في أوقات الأزمات، تُفقد الوثائق المادية بسهولة وتتعرض قواعد البيانات المركزية للمخاطر. تستخدم AnchorID وثائق معتمدة من W3C قابلة للتحقق. يحتفظ اللاجئون بوثائقهم مباشرة في متصفحاتهم، مما يضمن الخصوصية المطلقة مع السماح بالتحقق الفوري بدون إنترنت من قبل الجمعيات الخيرية والعيادات والبنوك.',
      organizationsTitle: 'بدعم من منظمات رائدة',
      accessibilityTitle: 'سهولة الوصول الشاملة',
      accessibilityText: 'مصمم لحالات الطوارئ وهواتف أندرويد منخفضة التكلفة. متوافق تماماً مع معايير WCAG 2.1 AA وسهولة القراءة من اليمين إلى اليسار (RTL).',
    },
    wallet: {
      unlockTitle: 'فتح المحفظة',
      unlockDesc: 'استخدم بصمتك أو رمز الحماية أو رمز PIN الاحتياطي لفتح محفظتك بأمان.',
      setupPasskey: 'إعداد بصمة الهوية',
      setupPIN: 'إنشاء رمز PIN احتياطي',
      enterPIN: 'أدخل رمز PIN المكون من 6 أرقام',
      pinFallback: 'استخدام رمز PIN بدلاً من ذلك',
      firstTimeTitle: 'إنشاء محفظة آمنة',
      firstTimeDesc: 'لا يتطلب بريداً إلكترونياً أو رقم هاتف. سنقوم بإنشاء مفاتيح هويتك اللامركزية مباشرة على جهازك.',
      generateKeys: 'إنشاء هويتي المشفرة',
      generatingKeys: 'جاري إنشاء المفاتيح الآمنة...',
      keysSuccess: 'تم إنشاء مفاتيح الهوية بنجاح!',
      biometricVerify: 'التحقق باستخدام البصمة',
      walletLocked: 'المحفظة مغلقة. افتح المحفظة لعرض الوثائق.',
      myCredentials: 'وثائقي المعتمدة',
      noCredentials: 'لا توجد وثائق مخزنة',
      noCredentialsDesc: 'لا تمتلك أي وثائق قابلة للتحقق في محفظتك المحلية بعد. اطلب وثيقة من المفوضية (UNHCR) أو منظمة معتمدة، ثم اضغط استيراد.',
      addCredentialBtn: 'استيراد وثيقة معتمدة',
      didLabel: 'معرف الهوية اللامركزي (DID)',
      copyDID: 'نسخ معرف DID',
      copied: 'تم النسخ!',
      wipeTitle: 'مسح محتويات المحفظة للطوارئ',
      wipeDesc: 'تحذير: سيؤدي هذا إلى حذف جميع المفاتيح والوثائق المخزنة نهائياً من هذا الجهاز. هذا الإجراء لا يمكن التراجع عنه.',
      wipeConfirm: 'مسح جميع بيانات المحفظة',
      presentTitle: 'تقديم الوثيقة',
      presentDesc: 'تكوين الإفصاح الانتقائي. سيتم تشفير وعرض البيانات المحددة فقط في رمز الاستجابة السريعة (QR) الخاص بالعرض.',
      discloseFields: 'حدد الحقول المراد الكشف عنها',
      generateQR: 'إنشاء رمز QR آمن للعرض',
      qrExpires: 'سينتهي رمز QR الآمن هذا خلال:',
      socialRecovery: 'الاسترداد الاجتماعي للهوية',
      recoveryDesc: 'استرجع هويتك الرقمية إذا فقدت جهازك باستخدام 3 من أصل 5 حراس موثوقين.',
      recoveryContacts: 'حراس الاسترداد الموثوقين',
      recoveryContactsDesc: 'رشح جهات اتصال موثوقة لمساعدتك في استرداد الهوية.',
      setupContacts: 'إعداد جهات الاتصال',
      restoreIdentity: 'استعادة المحفظة',
      restoreIdentityDesc: 'أدخل 3 مفاتيح استرداد مقدمة من حراسك لإعادة بناء معرف DID الأصلي الخاص بك واستعادة الوصول.',
    },
    issuer: {
      title: 'بوابة إصدار الهوية الإنسانية',
      issueBtn: 'إصدار وثيقة معتمدة وموقعة',
      credentialType: 'نوع الوثيقة المعتمدة',
      holderName: 'الاسم الكامل لحامل الوثيقة',
      holderDid: 'معرف DID الخاص بالحامل',
      dob: 'تاريخ الميلاد',
      nationality: 'الجنسية',
      holderId: 'رقم المفوضية / الهوية الوطنية',
      expiryDate: 'تاريخ الانتهاء',
      issueSuccess: 'تم توقيع الوثيقة المشفرة بنجاح!',
      copyPayload: 'نسخ بيانات JSON للحامل',
      credentialRegistry: 'سجل الوثائق الصادرة',
      revocationRegistry: 'سجل الإلغاء النشط',
      revokeBtn: 'إلغاء الصلاحية',
      revokedStatus: 'ملغى',
      activeStatus: 'نشط',
    },
    verifier: {
      title: 'بوابة التحقق من الوثائق والعيادات',
      scanTitle: 'التحقق المشفر من رمز QR',
      scanDesc: 'امسح أو الصق بيانات رمز QR الخاص بالعرض للتحقق من التوقيع وحالة الإلغاء بدون إنترنت.',
      verifyBtn: 'التحقق من العرض المقدم',
      pastePayload: 'الصق بيانات JSON للعرض المعتمد',
      pastePlaceholder: 'الصق رمز JSON هنا للتحقق...',
      verificationStatus: 'حالة التحقق المشفر',
      valid: 'الوثيقة صالحة ومشفرة بشكل صحيح',
      revoked: 'الوثيقة ملغاة من قبل الجهة المصدرة',
      expired: 'انتهت صلاحية العرض / كشف محاولة إعادة إرسال',
      details: 'البيانات المفصح عنها',
      trustedIssuer: 'ملف جهة إصدار موثوقة',
      untrustedIssuer: 'جهة إصدار غير مصرح بها / تحذير',
    },
  },
}
