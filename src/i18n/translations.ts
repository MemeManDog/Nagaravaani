import { IssueCategory, Language, SeverityLevel } from '../types';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  startReportBtn: string;
  viewDashboardBtn: string;
  liveMapBtn: string;
  leaderboardBtn: string;
  municipalOfficesBtn: string;
  languageSelectLabel: string;
  
  // Steps
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Subtitle: string;
  step4Title: string;
  step4Subtitle: string;
  
  // Step 1
  describePlaceholder: string;
  speechListening: string;
  speechStart: string;
  speechStop: string;
  speechUnsupported: string;
  samplePromptsLabel: string;
  
  // Step 2
  uploadLabel: string;
  uploadHint: string;
  usePresetPhoto: string;
  photoAnalyzedBadge: string;
  optionalNotice: string;
  
  // Step 3
  locationPrompt: string;
  useMyLocationBtn: string;
  enterManuallyBtn: string;
  locatingText: string;
  locationPlaceholder: string;
  privacyGuarantee: string;
  
  // Step 4 - Analysis
  analyzingHeadline: string;
  analyzingSub: string;
  issueCardTitle: string;
  detectedCategory: string;
  approxSeverity: string;
  severityReasoningTitle: string;
  crowdReportNotice: string;
  duplicateWarningTitle: string;
  duplicateWarningText: string;
  
  // Authority & Complaint Wording (Requirement 9)
  responsibleAuthority: string;
  formalComplaintTitle: string;
  formalComplaintEditableNotice: string;
  complaintReadyNotice: string;
  copyComplaintBtn: string;
  copiedNotification: string;
  sendWhatsAppBtn: string;
  sendEmailBtn: string;
  viewOfficeBtn: string;
  contactUnavailableTitle: string;
  contactUnavailableNotice: string;
  confirmReportingActionBtn: string;
  personalVisitPrompt: string;
  
  // Confirmation (Requirement 7)
  reportRecordedTitle: string;
  reportingActionInitiatedNotice: string;
  nagaravaaniNotice: string;
  pointsEarnedNotice: string;
  
  // Categories & Severities
  categories: Record<IssueCategory, string>;
  severities: Record<SeverityLevel, string>;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Nagaravaani',
    appTagline: 'AI-Powered Civic Grievance Triage Platform',
    heroHeadline: 'Report civic problems. Let AI understand them. Get them to the right authority.',
    heroSubheadline: 'Speak or type in English, Hindi, or Telugu. Upload photos of road hazards, broken lights, sewage, or garbage. Nagaravaani triages the severity, drafts formal grievances, and prepares verified reporting channels.',
    startReportBtn: 'Report a Civic Issue',
    viewDashboardBtn: 'Citizen Dashboard',
    liveMapBtn: 'Civic Map',
    leaderboardBtn: 'Leaderboard',
    municipalOfficesBtn: 'Municipal Directory',
    languageSelectLabel: 'Language',
    
    step1Title: 'Step 1 — Describe the Problem',
    step1Subtitle: 'Describe the civic issue in your own words. English, Hindi, or Telugu supported.',
    step2Title: 'Step 2 — Upload Photograph',
    step2Subtitle: 'Provide visual evidence for multimodal AI structural and safety assessment.',
    step3Title: 'Step 3 — Location Verification',
    step3Subtitle: 'Pinpoint the municipal ward and responsible zonal authority.',
    step4Title: 'Step 4 — AI Analysis & Reporting Channels',
    step4Subtitle: 'Review AI assessment, edit formal grievance, and choose your verified reporting channel.',
    
    describePlaceholder: 'E.g., "There is a huge pothole near my college on Road No 36 and vehicles are struggling to pass..."',
    speechListening: 'Listening to your voice... Speak naturally in English, Hindi, or Telugu.',
    speechStart: 'Speak to Report',
    speechStop: 'Stop Recording',
    speechUnsupported: 'Speech recognition is unavailable in this browser. Please type or choose a preset.',
    samplePromptsLabel: 'Or try quick demonstration scenario:',
    
    uploadLabel: 'Drop or click to upload civic problem photo',
    uploadHint: 'Supports JPG, PNG, WEBP. Multimodal AI will inspect surface damage and risks.',
    usePresetPhoto: 'Use Sample Photo for Demo',
    photoAnalyzedBadge: 'Photo ready for Multimodal AI inspection',
    optionalNotice: 'Clear photos accelerate municipal dispatch and prioritize safety triage.',
    
    locationPrompt: 'Would you like to use your current location to identify the exact location of this issue?',
    useMyLocationBtn: 'Use My Location',
    enterManuallyBtn: 'Enter Location Manually',
    locatingText: 'Detecting GPS coordinates & resolving smart city ward...',
    locationPlaceholder: 'Enter street, landmark, colony, or ward (e.g. Near Metro Pillar 1042, Ameerpet, Hyderabad)',
    privacyGuarantee: 'Privacy First: We never publish exact personal coordinates publicly on leaderboards. Location is used strictly to identify the responsible municipal ward.',
    
    analyzingHeadline: 'Nagaravaani AI Agent Analyzing Report...',
    analyzingSub: 'Evaluating multilingual context, multimodal visual evidence, spatial ward mapping, and existing reports.',
    issueCardTitle: 'AI Civic Triage Card',
    detectedCategory: 'Issue Category',
    approxSeverity: 'Approximate Severity',
    severityReasoningTitle: 'Why this severity rating:',
    crowdReportNotice: 'Crowd Verified: Similar reports detected in this locality',
    duplicateWarningTitle: 'Duplicate / Existing Issue Identified',
    duplicateWarningText: 'This issue appears to have already been reported by citizens in this vicinity. Submitting will reinforce community evidence.',
    
    responsibleAuthority: 'Responsible Municipal Authority',
    formalComplaintTitle: 'Formal Municipal Complaint Letter',
    formalComplaintEditableNotice: 'You can review and edit this complaint before initiating reporting.',
    complaintReadyNotice: 'Your complaint is ready to be reported.',
    copyComplaintBtn: 'Copy Complaint',
    copiedNotification: 'Complaint copied to clipboard!',
    sendWhatsAppBtn: 'Open WhatsApp',
    sendEmailBtn: 'Open Email',
    viewOfficeBtn: 'View Municipal Office',
    contactUnavailableTitle: 'Digital Contact Information Unavailable',
    contactUnavailableNotice: 'No verified official email or WhatsApp number is configured for this office. You can print/copy this complaint or visit the municipal office in person.',
    confirmReportingActionBtn: 'Record Reporting Action & Claim Points',
    personalVisitPrompt: 'Want to report personally?',
    
    reportRecordedTitle: 'REPORT RECORDED ✓',
    reportingActionInitiatedNotice: 'Reporting action initiated.',
    nagaravaaniNotice: 'Report recorded by Nagaravaani. Official municipal updates will appear once confirmed by authority systems.',
    pointsEarnedNotice: 'Points Awarded for Civic Action',
    
    categories: {
      'Pothole / Road Damage': 'Pothole / Road Damage',
      'Flooding / Waterlogging': 'Flooding / Waterlogging',
      'Open Sewage / Drainage': 'Open Sewage / Drainage',
      'Broken Streetlight': 'Broken Streetlight',
      'Road Blockage / Rubble': 'Road Blockage / Rubble',
      'Garbage / Waste': 'Garbage / Waste',
      'Foul Smell / Sanitation': 'Foul Smell / Sanitation',
      'Other Civic Issue': 'Other Civic Issue',
    },
    severities: {
      LOW: 'LOW SEVERITY',
      MEDIUM: 'MEDIUM SEVERITY',
      HIGH: 'HIGH SEVERITY',
      CRITICAL: 'CRITICAL SEVERITY',
    },
  },
  
  hi: {
    appName: 'Nagaravaani (नगरवाणी)',
    appTagline: 'स्मार्ट सिटी नागरिक शिकायत निवारण मंच',
    heroHeadline: 'नागरिक समस्याएं रिपोर्ट करें। एआई समझेगा। सही अधिकारी तक पहुंचाएगा।',
    heroSubheadline: 'हिंदी, तेलुगु या अंग्रेजी में बोलें या लिखें। गड्ढे, सीवर, कचरा या खराब स्ट्रीट लाइट की फोटो अपलोड करें। नगरवाणी समस्या की गंभीरता का आकलन कर औपचारिक शिकायत तैयार करती है।',
    startReportBtn: 'नागरिक समस्या रिपोर्ट करें',
    viewDashboardBtn: 'नागरिक डैशबोर्ड',
    liveMapBtn: 'शहर का लाइव मैप',
    leaderboardBtn: 'लीडरबोर्ड',
    municipalOfficesBtn: 'नगर निगम डायरेक्टरी',
    languageSelectLabel: 'भाषा',
    
    step1Title: 'चरण 1 — समस्या का विवरण दें',
    step1Subtitle: 'अपने शब्दों में समस्या बताएं। आप हिंदी, तेलुगु या अंग्रेजी में बोल या लिख सकते हैं।',
    step2Title: 'चरण 2 — फोटो अपलोड करें',
    step2Subtitle: 'एआई द्वारा नुकसान और खतरे के आकलन के लिए फोटो जोड़ें।',
    step3Title: 'चरण 3 — स्थान की पुष्टि करें',
    step3Subtitle: 'संबंधित नगर निगम वार्ड और क्षेत्र की पहचान करें।',
    step4Title: 'चरण 4 — एआई विश्लेषण और रिपोर्टिंग विकल्प',
    step4Subtitle: 'शिकायत पत्र की समीक्षा करें और उपलब्ध रिपोर्टिंग माध्यम चुनें।',
    
    describePlaceholder: 'उदा. "कॉलोनी की मुख्य सड़क पर बहुत बड़ा गड्ढा है और वाहनों का निकलना मुश्किल हो रहा है..."',
    speechListening: 'आपकी आवाज सुनी जा रही है... स्वाभाविक रूप से हिंदी में बोलें।',
    speechStart: 'बोलकर रिपोर्ट करें',
    speechStop: 'रिकॉर्डिंग रोकें',
    speechUnsupported: 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया टाइप करें।',
    samplePromptsLabel: 'या तुरंत डेमो उदाहरण चुनें:',
    
    uploadLabel: 'नागरिक समस्या की फोटो अपलोड करने के लिए क्लिक करें',
    uploadHint: 'JPG, PNG समर्थित। मल्टीमॉडल एआई सड़क सतह और खतरे का विश्लेषण करेगा।',
    usePresetPhoto: 'डेमो के लिए सैंपल फोटो लें',
    photoAnalyzedBadge: 'फोटो विश्लेषण के लिए तैयार है',
    optionalNotice: 'फोटो से नगर निगम टीम को काम में तेजी लाने में मदद मिलती है।',
    
    locationPrompt: 'क्या आप इस समस्या का सही स्थान पता करने के लिए अपने वर्तमान स्थान का उपयोग करना चाहते हैं?',
    useMyLocationBtn: 'मेरा वर्तमान स्थान उपयोग करें',
    enterManuallyBtn: 'स्थान मैन्युअल रूप से दर्ज करें',
    locatingText: 'जीपीएस और वार्ड का पता लगाया जा रहा है...',
    locationPlaceholder: 'सड़क, लैंडमार्क, मोहल्ला या वार्ड का नाम लिखें (उदा. बेगमपेट स्कूल के पास, हैदराबाद)',
    privacyGuarantee: 'गोपनीयता की गारंटी: आपका सटीक व्यक्तिगत पता सार्वजनिक लीडरबोर्ड पर नहीं दिखाया जाता। यह केवल संबंधित नगर निगम वार्ड तक शिकायत पहुंचाने के लिए है।',
    
    analyzingHeadline: 'नगरवाणी एआई एजेंट विश्लेषण कर रहा है...',
    analyzingSub: 'बहुभाषी विवरण, फोटो प्रमाण, वार्ड मैपिंग और पूर्व शिकायतों का मूल्यांकन जारी है।',
    issueCardTitle: 'एआई नागरिक विश्लेषण कार्ड',
    detectedCategory: 'समस्या की श्रेणी',
    approxSeverity: 'अनुमानित गंभीरता',
    severityReasoningTitle: 'गंभीरता का कारण:',
    crowdReportNotice: 'नागरिक सत्यापन: इस इलाके में अन्य नागरिकों ने भी इसे रिपोर्ट किया है',
    duplicateWarningTitle: 'पहले से दर्ज समस्या मिली',
    duplicateWarningText: 'यह समस्या पहले से ही दर्ज की जा चुकी प्रतीत होती है। रिपोर्ट करने से कम्युनिटी प्रमाण बढ़ेगा।',
    
    responsibleAuthority: 'जिम्मेदार नगर निगम प्राधिकरण',
    formalComplaintTitle: 'औपचारिक नगर निगम शिकायत पत्र',
    formalComplaintEditableNotice: 'आप भेजने से पहले इस पत्र में बदलाव कर सकते हैं।',
    complaintReadyNotice: 'आपकी शिकायत रिपोर्ट किए जाने के लिए तैयार है।',
    copyComplaintBtn: 'शिकायत कॉपी करें',
    copiedNotification: 'शिकायत पत्र कॉपी हो गया!',
    sendWhatsAppBtn: 'व्हाट्सएप खोलें',
    sendEmailBtn: 'ईमेल खोलें',
    viewOfficeBtn: 'नगर निगम कार्यालय देखें',
    contactUnavailableTitle: 'डिजिटल संपर्क जानकारी उपलब्ध नहीं है',
    contactUnavailableNotice: 'इस कार्यालय के लिए कोई सत्यापित आधिकारिक ईमेल या व्हाट्सएप नंबर कॉन्फ़िगर नहीं है। आप व्यक्तिगत रूप से कार्यालय जा सकते हैं।',
    confirmReportingActionBtn: 'रिपोर्टिंग दर्ज करें और पॉइंट्स प्राप्त करें',
    personalVisitPrompt: 'क्या आप व्यक्तिगत रूप से रिपोर्ट करना चाहते हैं?',
    
    reportRecordedTitle: 'रिपोर्ट दर्ज हो गई ✓',
    reportingActionInitiatedNotice: 'रिपोर्टिंग प्रक्रिया शुरू हो गई है।',
    nagaravaaniNotice: 'नगरवाणी द्वारा रिपोर्ट दर्ज की गई। आधिकारिक नगर निगम स्थिति सत्यापन के बाद दिखाई देगी।',
    pointsEarnedNotice: 'नागरिक कर्तव्य के लिए पॉइंट्स मिले',
    
    categories: {
      'Pothole / Road Damage': 'सड़क के गड्ढे / सड़क क्षति',
      'Flooding / Waterlogging': 'जलभराव / पानी का जमाव',
      'Open Sewage / Drainage': 'खुला नाला / सीवेज रिसाव',
      'Broken Streetlight': 'टूटी हुई स्ट्रीट लाइट',
      'Road Blockage / Rubble': 'सड़क पर मलबा / रुकावट',
      'Garbage / Waste': 'कचरा / गंदगी का ढेर',
      'Foul Smell / Sanitation': 'बदबू / स्वच्छता समस्या',
      'Other Civic Issue': 'अन्य नागरिक समस्या',
    },
    severities: {
      LOW: 'निम्न गंभीरता (LOW)',
      MEDIUM: 'मध्यम गंभीरता (MEDIUM)',
      HIGH: 'उच्च गंभीरता (HIGH)',
      CRITICAL: 'अति-गंभीर (CRITICAL)',
    },
  },
  
  te: {
    appName: 'Nagaravaani (నగరవాణి)',
    appTagline: 'స్మార్ట్ సిటీ పౌర సమస్యల పరిష్కార వేదిక',
    heroHeadline: 'పౌర సమస్యలను నివేదించండి. ఏఐ అర్థం చేసుకుంటుంది. సరైన అధికారికి చేరుస్తుంది.',
    heroSubheadline: 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో మాట్లాడండి లేదా టైప్ చేయండి. గుంతలు, డ్రైనేజీ లీకేజీ, చెత్త లేదా వీధి దీపాల ఫోటోలను అప్‌లోడ్ చేయండి. నగరవాణి సమస్య తీవ్రతను అంచనా వేసి అధికారిక ఫిర్యాదును సిద్ధం చేస్తుంది.',
    startReportBtn: 'సమస్యను నివేదించండి',
    viewDashboardBtn: 'సిటిజన్ డ్యాష్‌బోర్డ్',
    liveMapBtn: 'సిటీ లైవ్ మ్యాప్',
    leaderboardBtn: 'లీడర్‌బోర్డ్',
    municipalOfficesBtn: 'మున్సిపల్ డైరెక్టరీ',
    languageSelectLabel: 'భాష',
    
    step1Title: 'దశ 1 — సమస్యను వివరించండి',
    step1Subtitle: 'సమస్యను మీ సొంత మాటల్లో చెప్పండి. తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడవచ్చు.',
    step2Title: 'దశ 2 — ఫోటో అప్‌లోడ్ చేయండి',
    step2Subtitle: 'ఏఐ విశ్లేషణ కోసం ప్రమాద స్థలం ఫోటోను జతచేయండి.',
    step3Title: 'దశ 3 — లొకేషన్ ధృవీకరణ',
    step3Subtitle: 'మున్సిపల్ వార్డు మరియు జోనల్ ఆఫీస్‌ను గుర్తించండి.',
    step4Title: 'దశ 4 — ఏఐ విశ్లేషణ & రిపోర్టింగ్ మార్గాలు',
    step4Subtitle: 'ఫిర్యాదు లేఖను సమీక్షించండి మరియు అధికారిక నివేదిక మార్గాన్ని ఎంచుకోండి.',
    
    describePlaceholder: 'ఉదా. "మా కాలేజ్ దగ్గర రోడ్డుపై పెద్ద గుంత ఏర్పడింది, వాహనాలు వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నాయి..."',
    speechListening: 'మీ మాటలను వింటోంది... సహజంగా తెలుగులో మాట్లాడండి.',
    speechStart: 'మాట్లాడి నివేదించండి',
    speechStop: 'రికార్డింగ్ ఆపండి',
    speechUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.',
    samplePromptsLabel: 'లేదా శీఘ్ర డెమో ఉదాహరణను ఎంచుకోండి:',
    
    uploadLabel: 'సమస్య ఫోటోను అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    uploadHint: 'JPG, PNG ఫార్మాట్. మల్టీమోడల్ ఏఐ రోడ్డు నష్టం మరియు ప్రమాదాన్ని అంచనా వేస్తుంది.',
    usePresetPhoto: 'డెమో కోసం నమూనా ఫోటో వాడండి',
    photoAnalyzedBadge: 'ఫోటో ఏఐ పరిశీలనకు సిద్ధంగా ఉంది',
    optionalNotice: 'ఫోటోల వల్ల మున్సిపల్ అధికారులు త్వరగా చర్యలు తీసుకోగలుగుతారు.',
    
    locationPrompt: 'ఈ సమస్య యొక్క ఖచ్చితమైన స్థానాన్ని గుర్తించడానికి మీ ప్రస్తుత లొకేషన్‌ను ఉపయోగించాలా?',
    useMyLocationBtn: 'నా ప్రస్తుత లొకేషన్ ఉపయోగించండి',
    enterManuallyBtn: 'లొకేషన్‌ను స్వయంగా నమోదు చేయండి',
    locatingText: 'జీపీఎస్ మరియు వార్డు వివరాలు గుర్తించబడుతున్నాయి...',
    locationPlaceholder: 'వీధి, ల్యాండ్‌మార్క్ లేదా వార్డు పేరు (ఉదా. మలక్‌పేట్ రైల్వే స్టేషన్ దగ్గర, హైదరాబాద్)',
    privacyGuarantee: 'గోప్యతా హామీ: మీ వ్యక్తిగత స్థానం లీడర్‌బోర్డ్‌లో కనిపించదు. సంబంధిత మున్సిపల్ వార్డుకు ఫిర్యాదు పంపడానికి మాత్రమే ఉపయోగించబడుతుంది.',
    
    analyzingHeadline: 'నగరవాణి ఏఐ ఏజెంట్ విశ్లేషిస్తోంది...',
    analyzingSub: 'బహుభాషా వివరణ, ఫోటో సాక్ష్యం, వార్డు మ్యాపింగ్ మరియు మునుపటి నివేదికల పరిశీలన.',
    issueCardTitle: 'ఏఐ పౌర విశ్లేషణ కార్డు',
    detectedCategory: 'సమస్య రకం',
    approxSeverity: 'సుమారు తీవ్రత',
    severityReasoningTitle: 'తీవ్రతకు గల కారణాలు:',
    crowdReportNotice: 'పౌరుల ధృవీకరణ: ఈ ప్రాంతంలో ఇతర పౌరులు కూడా నివేదించారు',
    duplicateWarningTitle: 'ఇప్పటికే నమోదైన సమస్య కనిపించింది',
    duplicateWarningText: 'ఈ సమస్యను ఈ ప్రాంతంలోని పౌరులు ఇప్పటికే నివేదించినట్లు తెలుస్తోంది. మీ నివేదిక సమాజ సాక్ష్యాన్ని బలపరుస్తుంది.',
    
    responsibleAuthority: 'బాధ్యతగల మున్సిపల్ విభాగం',
    formalComplaintTitle: 'అధికారిక మున్సిపల్ ఫిర్యాదు లేఖ',
    formalComplaintEditableNotice: 'పంపే ముందు మీరు ఈ ఫిర్యాదు లేఖలో మార్పులు చేసుకోవచ్చు.',
    complaintReadyNotice: 'మీ ఫిర్యాదు నివేదించడానికి సిద్ధంగా ఉంది.',
    copyComplaintBtn: 'ఫిర్యాదు కాపీ చేయండి',
    copiedNotification: 'ఫిర్యాదు కాపీ చేయబడింది!',
    sendWhatsAppBtn: 'వాట్సాప్ తెరవండి',
    sendEmailBtn: 'ఈమెయిల్ తెరవండి',
    viewOfficeBtn: 'మున్సిపల్ ఆఫీస్ చూడండి',
    contactUnavailableTitle: 'డిజిటల్ సంప్రదింపు సమాచారం అందుబాటులో లేదు',
    contactUnavailableNotice: 'ఈ కార్యాలయానికి అధికారిక ఈమెయిల్ లేదా వాట్సాప్ అందుబాటులో లేదు. మీరు స్వయంగా ఆఫీసును సందర్శించి సమర్పించవచ్చు.',
    confirmReportingActionBtn: 'రిపోర్ట్ నమోదు చేసి పాయింట్లను పొందండి',
    personalVisitPrompt: 'స్వయంగా వెళ్లి ఫిర్యాదు చేయాలనుకుంటున్నారా?',
    
    reportRecordedTitle: 'నివేదిక నమోదైంది ✓',
    reportingActionInitiatedNotice: 'రిపోర్టింగ్ ప్రక్రియ ప్రారంభించబడింది.',
    nagaravaaniNotice: 'నగరవాణి ద్వారా నివేదిక నమోదు చేయబడింది. అధికారిక వ్యవస్థల ధృవీకరణ తర్వాత మున్సిపల్ స్థితి కనిపిస్తుంది.',
    pointsEarnedNotice: 'పౌర బాధ్యతకు లభించిన పాయింట్లు',
    
    categories: {
      'Pothole / Road Damage': 'రోడ్డు గుంతలు / రహదారి నష్టం',
      'Flooding / Waterlogging': 'నీరు నిలవడం / వరద పరిస్థితి',
      'Open Sewage / Drainage': 'ఓపెన్ మురుగు కాలువ / డ్రైనేజీ లీకేజ్',
      'Broken Streetlight': 'పగిలిన / వెలగని వీధి దీపం',
      'Road Blockage / Rubble': 'రోడ్డుపై శిథిలాలు / అడ్డంకులు',
      'Garbage / Waste': 'చెత్త కుప్పలు / వ్యర్థాలు',
      'Foul Smell / Sanitation': 'దుర్వాసన / పారిశుధ్య లోపం',
      'Other Civic Issue': 'ఇతర పౌర సమస్య',
    },
    severities: {
      LOW: 'తక్కువ తీవ్రత (LOW)',
      MEDIUM: 'మధ్యస్థ తీవ్రత (MEDIUM)',
      HIGH: 'అధిక తీవ్రత (HIGH)',
      CRITICAL: 'అత్యవసర / ప్రమాదకర (CRITICAL)',
    },
  },
};
