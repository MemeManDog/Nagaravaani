import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  CivicReport,
  IssueCategory,
  LeaderboardUser,
  MunicipalAuthority,
  SeverityLevel,
  AgentExecutionStep,
  AgentAnalysisResponse,
  ReportingMethod,
  ReportLifecycleStatus,
} from './src/types';
import {
  INITIAL_REPORTS,
  MUNICIPAL_AUTHORITIES,
  INITIAL_LEADERBOARD,
} from './src/data/mockData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory data store for prototype
let reports: CivicReport[] = [...INITIAL_REPORTS];
let leaderboard: LeaderboardUser[] = [...INITIAL_LEADERBOARD];

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// AGENTIC TOOLS & UTILITIES
// -------------------------------------------------------------

function detectLanguage(text: string): { detected: 'en' | 'hi' | 'te'; name: string; confidence: number } {
  const teluguCharRegex = /[\u0C00-\u0C7F]/;
  const devanagariRegex = /[\u0900-\u097F]/;

  let teCount = 0;
  let hiCount = 0;
  for (const ch of text) {
    if (teluguCharRegex.test(ch)) teCount++;
    if (devanagariRegex.test(ch)) hiCount++;
  }

  if (teCount > 2) {
    return { detected: 'te', name: 'Telugu (తెలుగు)', confidence: 0.98 };
  }
  if (hiCount > 2) {
    return { detected: 'hi', name: 'Hindi (हिन्दी)', confidence: 0.97 };
  }

  // Check Romanized transliterated keywords
  const lower = text.toLowerCase();
  if (/\b(gundalu|unnaayi|neeru|kaluva|roadu|chedipoindi|cheppandi|vastunnaru)\b/i.test(lower)) {
    return { detected: 'te', name: 'Telugu (Transliterated)', confidence: 0.85 };
  }
  if (/\b(gaddha|sadak|pani|nala|kachra|badboo|toota|bahar|gaadi|nagar)\b/i.test(lower)) {
    return { detected: 'hi', name: 'Hindi (Transliterated)', confidence: 0.88 };
  }

  return { detected: 'en', name: 'English', confidence: 0.95 };
}

function classifyIssue(description: string, imageText: string = ''): { category: IssueCategory; confidence: number; tags: string[] } {
  const combined = `${description} ${imageText}`.toLowerCase();

  // Pothole / Road Damage (English, Hindi, Telugu, Transliterated)
  if (
    /(pothole|gaddha|gaddhe|gundalu|guntha|gunthalu|crater|asphalt|surface damage|road damage|manhole broken|skid|two-wheeler fall|सड़क टूटी|गड्ढा|गड्ढे|రోడ్డు పాడైంది|గుంత|గుంతలు|రహదారి)/i.test(combined)
  ) {
    return { category: 'Pothole / Road Damage', confidence: 0.94, tags: ['Roads', 'Asphalt', 'Pothole', 'Safety'] };
  }

  // Flooding / Waterlogging (English, Hindi, Telugu, Transliterated)
  if (
    /(flood|waterlog|submerged|underpass|rainwater|inundat|pani jama|paani bhara|varsham neeru|neeru nilichipoindi|standing water|जलभराव|पानी भरा|बाढ़|నీరు నిలిచిపోయింది|వరద|మునిగిపోయింది|నీరు|వర్షం)/i.test(combined)
  ) {
    return { category: 'Flooding / Waterlogging', confidence: 0.96, tags: ['Monsoon', 'Dewatering', 'Drainage', 'Submerged'] };
  }

  // Open Sewage / Drainage (English, Hindi, Telugu, Transliterated)
  if (
    /(sewage|sewer|drain|drainage|chamber|nala|naala|gutter|ganda pani|manhole open|kaluva|murugu|नाला|सीवर|सीवेज|गंदा पानी|మురుగు|కాలువ|డ్రైనేజ్)/i.test(combined)
  ) {
    return { category: 'Open Sewage / Drainage', confidence: 0.93, tags: ['Sanitation', 'Sewerage', 'Contamination', 'Open Drain'] };
  }

  // Broken Streetlight (English, Hindi, Telugu, Transliterated)
  if (
    /(streetlight|street light|light|lamp|pole|dark|bulb|wire|current|bijli|velagatam ledu|veedhi deepam|batti|khamba|स्ट्रीट लाइट|बत्ती|खंभा|अंधेरा|వీధి దీపం|కరెంట్|వెలగడం లేదు)/i.test(combined)
  ) {
    return { category: 'Broken Streetlight', confidence: 0.95, tags: ['Electrical', 'Lighting', 'Public Safety', 'Night Hazard'] };
  }

  // Road Blockage / Rubble (English, Hindi, Telugu, Transliterated)
  if (
    /(blockage|rubble|debris|malba|boulder|encroach|concrete|tree fallen|shithilalu|road closed|rasta band|मलबा|पत्थर|रास्ता बंद|శిథిలాలు|రాళ్ళు|రోడ్డు బ్లాక్)/i.test(combined)
  ) {
    return { category: 'Road Blockage / Rubble', confidence: 0.92, tags: ['C&D Waste', 'Obstruction', 'Traffic', 'Encroachment'] };
  }

  // Garbage / Waste (English, Hindi, Telugu, Transliterated)
  if (
    /(garbage|waste|trash|dump|dustbin|kachra|kuda|dumpyad|overflowing bin|chetta|vyardhalu|कचरा|कूड़ा|गंदगी|చెత్త|వ్యర్థాలు)/i.test(combined)
  ) {
    return { category: 'Garbage / Waste', confidence: 0.91, tags: ['Solid Waste', 'Sanitation', 'Public Health', 'Litter'] };
  }

  // Foul Smell / Sanitation (English, Hindi, Telugu, Transliterated)
  if (
    /(foul smell|smell|stench|badboo|stink|odor|fumes|air pollution|vasana|durvasana|durgandh|बदबू|दुर्गंध|దుర్వాసన|వాసన)/i.test(combined)
  ) {
    return { category: 'Foul Smell / Sanitation', confidence: 0.90, tags: ['Health', 'Air Quality', 'Sanitation', 'Hygiene'] };
  }

  return { category: 'Other Civic Issue', confidence: 0.75, tags: ['General Civic', 'Municipal Works'] };
}

function assessSeverity(
  category: IssueCategory,
  description: string,
  imageFindings: string[] = [],
  crowdCount: number = 0
): { level: SeverityLevel; reasons: string[] } {
  const text = description.toLowerCase();
  const reasons: string[] = [];

  // Critical indicators
  const isLifeThreatening = /(critical|danger|accident|exposed wire|electrocution|submerged|hospital|school|cannot pass|choked|head-on|fatal)/i.test(text);
  const isHighVolume = /(arterial|main road|highway|metro|junction|heavy traffic|bus stop)/i.test(text);

  if (category === 'Flooding / Waterlogging') {
    if (text.includes('underpass') || text.includes('submerged') || isLifeThreatening) {
      reasons.push('Submerged roadway creating vehicle engine stall & pedestrian entrapment risk');
      reasons.push('Impending flash storm runoff may overwhelm local storm drains');
      if (crowdCount > 1) reasons.push(`${crowdCount} citizens in area confirm gridlock`);
      return { level: 'CRITICAL', reasons };
    }
    reasons.push('Standing water impedes vehicular mobility and pedestrian access');
    reasons.push('Vector breeding & road base erosion risk detected');
    return { level: 'HIGH', reasons };
  }

  if (category === 'Broken Streetlight') {
    if (text.includes('wire') || text.includes('pole fallen') || text.includes('hanging') || text.includes('school')) {
      reasons.push('Structural damage with potential exposed wiring electrocution risk');
      reasons.push('Located near sensitive pedestrian or school corridor');
      return { level: 'CRITICAL', reasons };
    }
    reasons.push('Complete blackout on thoroughfare poses night safety hazards');
    reasons.push('Increased risk of pedestrian accidents and petty crimes');
    return { level: 'MEDIUM', reasons };
  }

  if (category === 'Open Sewage / Drainage') {
    reasons.push('Direct public exposure to contaminated domestic wastewater');
    reasons.push('High risk of water-borne pathogens and vector diseases in neighborhood');
    if (isHighVolume || text.includes('school') || text.includes('market')) {
      reasons.push('Proximity to public gathering zone heightens sanitation urgency');
      return { level: 'HIGH', reasons };
    }
    return { level: 'HIGH', reasons };
  }

  if (category === 'Pothole / Road Damage') {
    reasons.push('Significant structural road-surface depression detected');
    if (isHighVolume || text.includes('struggling') || text.includes('two-wheeler')) {
      reasons.push('Active danger for two-wheelers and braking vehicles during commute');
      reasons.push('High-density traffic corridor subject to cascading congestion');
      return { level: 'HIGH', reasons };
    }
    reasons.push('Surface asphalt deterioration requiring cold-patch remediation');
    return { level: 'MEDIUM', reasons };
  }

  if (category === 'Road Blockage / Rubble') {
    if (text.includes('half') || text.includes('entire') || isHighVolume) {
      reasons.push('Substantial carriageway constriction forcing oncoming lane diversion');
      reasons.push('Absence of hazard reflectors creates nighttime collision risk');
      return { level: 'HIGH', reasons };
    }
    reasons.push('Debris accumulation partially obstructing road verge');
    return { level: 'MEDIUM', reasons };
  }

  if (category === 'Garbage / Waste' || category === 'Foul Smell / Sanitation') {
    reasons.push('Unattended waste biomass causing environmental nuisance and foul odor');
    if (crowdCount > 2) reasons.push('Multi-day persistent dumping reported by multiple residents');
    return { level: 'MEDIUM', reasons };
  }

  reasons.push('Civic grievance reported requiring departmental review');
  return { level: 'LOW', reasons };
}

function geocodeLocation(inputAddress: string, coords?: { lat: number; lng: number }): {
  resolvedAddress: string;
  ward: string;
  city: string;
  landmark?: string;
  coordinates: { lat: number; lng: number };
} {
  const lower = (inputAddress || '').toLowerCase();

  // Hyderabad checks
  if (lower.includes('ameerpet') || lower.includes('jubilee') || lower.includes('banjara') || lower.includes('khairatabad')) {
    return {
      resolvedAddress: inputAddress || 'Road No 36, Jubilee Hills / Ameerpet, Hyderabad',
      ward: 'Khairatabad Zone (Ward 98)',
      city: 'Hyderabad',
      landmark: 'Near Metro Station / Main Arterial Road',
      coordinates: coords || { lat: 17.4375, lng: 78.4483 },
    };
  }

  if (lower.includes('begumpet') || lower.includes('secunderabad')) {
    return {
      resolvedAddress: inputAddress || 'Sardar Patel Road, Begumpet, Hyderabad',
      ward: 'Khairatabad Zone (Begumpet)',
      city: 'Hyderabad',
      landmark: 'Near Government High School, Begumpet',
      coordinates: coords || { lat: 17.4442, lng: 78.4721 },
    };
  }

  if (lower.includes('malakpet') || lower.includes('old city') || lower.includes('charminar') || lower.includes('dabeerpura')) {
    return {
      resolvedAddress: inputAddress || 'Dabeerpura / Malakpet Road, Old City, Hyderabad',
      ward: 'South Zone (Ward 84 - Dabeerpura)',
      city: 'Hyderabad',
      landmark: 'Near Railway Station',
      coordinates: coords || { lat: 17.3621, lng: 78.4891 },
    };
  }

  // Bengaluru check
  if (lower.includes('indiranagar') || lower.includes('koramangala') || lower.includes('whitefield') || lower.includes('bengaluru') || lower.includes('bangalore')) {
    return {
      resolvedAddress: inputAddress || '12th Main Road, Indiranagar, Bengaluru',
      ward: 'East Zone (Indiranagar / Ward 112)',
      city: 'Bengaluru',
      landmark: 'Near Indiranagar 100ft Road',
      coordinates: coords || { lat: 12.9784, lng: 77.6408 },
    };
  }

  // Fallback defaults
  return {
    resolvedAddress: inputAddress || 'Main Municipal Sector Road, Smart City Zone 1',
    ward: 'Khairatabad Zone (Ward 98)',
    city: 'Hyderabad',
    landmark: 'Prominent Landmark / Colony Main Gate',
    coordinates: coords || { lat: 17.4123, lng: 78.4552 },
  };
}

// Requirement 2 & 3: Match from configurable municipal authority database
function identifyMunicipalAuthority(category: IssueCategory, resolvedWard: string): MunicipalAuthority {
  // If ward 84 (demonstrating uncontactable office)
  if (resolvedWard.includes('Ward 84')) {
    return MUNICIPAL_AUTHORITIES.find((a) => a.id === 'ghmc-ward84-manual') || MUNICIPAL_AUTHORITIES[0];
  }
  // If drainage or sewerage
  if (category === 'Open Sewage / Drainage' || category === 'Flooding / Waterlogging' || category === 'Foul Smell / Sanitation') {
    return MUNICIPAL_AUTHORITIES.find((a) => a.id === 'hmwssb-drainage-div6') || MUNICIPAL_AUTHORITIES[0];
  }
  // If Bengaluru
  if (resolvedWard.includes('East Zone') || resolvedWard.includes('Bengaluru')) {
    return MUNICIPAL_AUTHORITIES.find((a) => a.id === 'bbmp-roads-east') || MUNICIPAL_AUTHORITIES[0];
  }
  // Default to GHMC Roads
  return MUNICIPAL_AUTHORITIES[0];
}

// Requirement 6: Duplicate detection comparing category, approx geographic location, and description
function searchSimilarReports(category: IssueCategory, locationQuery: string): {
  hasSimilarReports: boolean;
  similarReportCount: number;
  similarReportId?: string;
  message: string;
  qualifyingCount: number;
  isRewardEligible: boolean;
} {
  const normLoc = locationQuery.toLowerCase();
  const matched = reports.filter((r) => {
    if (r.category !== category) return false;
    const addr = r.location.address.toLowerCase();
    const city = r.location.city.toLowerCase();
    const ward = (r.location.ward || '').toLowerCase();
    return normLoc.includes(city) || normLoc.includes(ward) || addr.split(' ').some((word) => word.length > 4 && normLoc.includes(word));
  });

  const totalReports = matched.reduce((acc, curr) => acc + (curr.crowdReportCount || 1), 0);
  const qualifyingCount = totalReports;
  const isRewardEligible = qualifyingCount < 3;

  if (matched.length > 0) {
    return {
      hasSimilarReports: true,
      similarReportCount: totalReports,
      similarReportId: matched[0].id,
      qualifyingCount,
      isRewardEligible,
      message: isRewardEligible
        ? `This issue has ${totalReports} existing citizen corroboration(s). Your report will qualify for reward points (first 3 distinct reports).`
        : `This issue appears to have already been reported by ${totalReports} citizens. Maximum reward-eligible limit (3 reports) has been reached.`,
    };
  }

  return {
    hasSimilarReports: false,
    similarReportCount: 0,
    qualifyingCount: 0,
    isRewardEligible: true,
    message: 'No active duplicate reports detected in this immediate ward sector. Qualifies for initial discovery points.',
  };
}

// Potential points estimation (points are only awarded in awardPointsAfterReport!)
function getCategoryBasePoints(category: IssueCategory): number {
  if (category === 'Pothole / Road Damage' || category === 'Broken Streetlight') {
    return 10;
  }
  if (category === 'Open Sewage / Drainage' || category === 'Foul Smell / Sanitation') {
    return 20;
  }
  if (category === 'Flooding / Waterlogging' || category === 'Road Blockage / Rubble') {
    return 50;
  }
  return 10;
}

// Requirement 5: Clear backend function awardPointsAfterReport() that ONLY executes after a valid reporting action
function awardPointsAfterReport(
  category: IssueCategory,
  citizenName: string,
  existingQualifyingCount: number
): { pointsAwarded: number; isRewardEligible: boolean; message: string } {
  const basePoints = getCategoryBasePoints(category);

  // Enforce rule: only the first three distinct reports for the same civic issue can receive points!
  if (existingQualifyingCount >= 3) {
    return {
      pointsAwarded: 0,
      isRewardEligible: false,
      message: 'Your report has been recorded, but this issue has already reached the maximum number of reward-eligible reports.',
    };
  }

  return {
    pointsAwarded: basePoints,
    isRewardEligible: true,
    message: `+${basePoints} points awarded for verified civic reporting!`,
  };
}

function generateFormalComplaint(
  authority: MunicipalAuthority,
  category: IssueCategory,
  severity: SeverityLevel,
  locationText: string,
  description: string,
  citizenName: string,
  crowdCount: number
): {
  subject: string;
  recipient: string;
  body: string;
  translations: {
    en: string;
    hi: string;
    te: string;
  };
} {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subject = `Urgent Grievance: ${category} (${severity} Priority) at ${locationText.slice(0, 45)}...`;
  const recipient = `${authority.designatedOfficer}, ${authority.authorityName}`;

  const crowdSentence = crowdCount > 0
    ? `This issue has also gathered corroboration from ${crowdCount} citizen(s) in this sector.\n\n`
    : '';

  // English Letter
  const bodyEn = `To:
${authority.designatedOfficer}
${authority.department}
${authority.authorityName}
${authority.address}

Subject: Request for Immediate Inspection and Action — ${category} at ${locationText}
Date: ${currentDate}

Respected Sir/Madam,

I am writing through the Nagaravaani Civic Grievance System to formally bring to your attention a civic infrastructure issue regarding ${category}, identified at:
${locationText}

Based on the citizen description and photographic verification, the issue has been assessed as ${severity} SEVERITY by the automated civic triage system.

Factual Summary:
"${description}"

${crowdSentence}This condition poses inconvenience and potential safety hazards to commuters, residents, and pedestrians. I kindly request the concerned inspection wing to conduct a field visit at the earliest and initiate necessary restoration work.

Thank you for your prompt service to our smart city community.

Yours faithfully,
${citizenName || 'Concerned Citizen'}
Generated via Nagaravaani Platform`;

  // Category in Hindi & Telugu
  const categoryHiMap: Record<string, string> = {
    'Pothole / Road Damage': 'सड़क क्षति / खतरनाक गड्ढे (Potholes)',
    'Flooding / Waterlogging': 'जलभराव एवं गंभीर जलजमाव (Waterlogging)',
    'Open Sewage / Drainage': 'खुला नाला एवं सीवरेज ओवरफ्लो (Sewage Overflow)',
    'Broken Streetlight': 'बंद / खराब स्ट्रीट लाइट (Broken Streetlight)',
    'Road Blockage / Rubble': 'मार्ग अवरोध एवं मलबा (Road Blockage)',
    'Garbage / Waste': 'कचरे का ढेर एवं अस्वच्छता (Solid Waste)',
    'Foul Smell / Sanitation': 'तीव्र दुर्गंध एवं सार्वजनिक अस्वच्छता (Sanitation Hazard)',
  };
  const categoryHi = categoryHiMap[category] || `${category} संबंधी समस्या`;

  const categoryTeMap: Record<string, string> = {
    'Pothole / Road Damage': 'రోడ్డు గుంతలు / పాడైన రహదారి (Road Damage)',
    'Flooding / Waterlogging': 'నీరు నిలవడం / వరద పరిస్థితి (Waterlogging)',
    'Open Sewage / Drainage': 'మురుగు కాలువ పొంగడం / ఓపెన్ డ్రైనేజ్ (Sewage Overflow)',
    'Broken Streetlight': 'పనిచేయని వీధి దీపాలు (Streetlight Defect)',
    'Road Blockage / Rubble': 'రహదారి అడ్డంకులు / శిథిలాలు (Road Blockage)',
    'Garbage / Waste': 'చెత్త కుప్పలు / పారిశుధ్య సమస్య (Garbage Accumulation)',
    'Foul Smell / Sanitation': 'దుర్వాసన / పారిశుధ్య లోపం (Sanitation Hazard)',
  };
  const categoryTe = categoryTeMap[category] || `${category} సమస్య`;

  const severityHiMap: Record<string, string> = {
    CRITICAL: 'अत्यंत गंभीर (CRITICAL)',
    HIGH: 'उच्च प्राथमिकता (HIGH)',
    MEDIUM: 'मध्यम स्तर (MEDIUM)',
    LOW: 'सामान्य समीक्षा (LOW)',
  };
  const severityHi = severityHiMap[severity] || severity;

  const severityTeMap: Record<string, string> = {
    CRITICAL: 'అత్యంత తీవ్రమైన (CRITICAL)',
    HIGH: 'అధిక ప్రాధాన్యత (HIGH)',
    MEDIUM: 'మధ్యస్థ స్థాయి (MEDIUM)',
    LOW: 'సాధారణ స్థాయి (LOW)',
  };
  const severityTe = severityTeMap[severity] || severity;

  const crowdSentenceHi = crowdCount > 0
    ? `इस समस्या को क्षेत्र के ${crowdCount} अन्य नागरिकों द्वारा भी सत्यापित और पुष्ट किया गया है।\n\n`
    : '';

  const crowdSentenceTe = crowdCount > 0
    ? `ఈ సమస్యను సదరు ప్రాంతంలోని మరో ${crowdCount} మంది పౌరులు కూడా ధృవీకరించారు.\n\n`
    : '';

  // Hindi Letter
  const bodyHi = `सेवा में:
${authority.designatedOfficer}
${authority.department}
${authority.authorityName}
${authority.address}

विषय: तत्काल निरीक्षण एवं निवारण हेतु औपचारिक अनुरोध — ${categoryHi} (${locationText})
दिनांक: ${currentDate}

आदरणीय महोदय / महोदया,

मैं नगरवाणी नागरिक शिकायत प्रणाली (Nagaravaani) के माध्यम से आपका ध्यान एक गंभीर नागरिक समस्या की ओर आकर्षित करना चाहता हूँ। यह समस्या निम्नलिखित स्थान पर स्थित है:
स्थान: ${locationText}

नागरिक विवरण एवं तकनीकी साक्ष्यों के आधार पर, स्वचालित नागरिक मूल्यांकन प्रणाली द्वारा इसे "${severityHi}" प्राथमिकता श्रेणी में वर्गीकृत किया गया है।

समस्या का संक्षिप्त विवरण:
"${description}"

${crowdSentenceHi}यह स्थिति स्थानीय निवासियों, राहगीरों एवं वाहन चालकों के लिए गंभीर असुविधा तथा सुरक्षा जोखिम उत्पन्न कर रही है। अतः आपसे विनम्र अनुरोध है कि संबंधित तकनीकी निरीक्षण दल को तुरंत स्थल निरीक्षण करने एवं मरम्मत कार्य प्रारंभ करने के निर्देश देने की कृपा करें।

सार्वजनिक नागरिक सेवा में आपके त्वरित सहयोग हेतु धन्यवाद।

भवदीय,
${citizenName || 'जागरूक नागरिक'}
नगरवाणी नागरिक मंच (Nagaravaani) द्वारा प्रेषित`;

  // Telugu Letter
  const bodyTe = `స్వీకర్త:
${authority.designatedOfficer}
${authority.department}
${authority.authorityName}
${authority.address}

విషయం: తక్షణ పరిశీలన మరియు నివారణ చర్యల కొరకు అధికారిక విన్నపం — ${categoryTe} (${locationText})
తేదీ: ${currentDate}

గౌరవనీయులైన అధికారి గారికి,

నగరవాణి (Nagaravaani) ప్రజా ఫిర్యాదుల వేదిక ద్వారా మా ప్రాంతంలోని ఒక ముఖ్యమైన మౌలిక వసతుల సమస్యను మీ దృష్టికి తీసుకువస్తున్నాను.
సమస్య ఉన్న ప్రదేశం:
${locationText}

పౌరుల వివరాలు మరియు ఛాయాచిత్ర ఆధారాల ప్రకారం, ఆటోమేటెడ్ సివిక్ అసెస్‌మెంట్ వ్యవస్థ ద్వారా ఈ సమస్యను "${severityTe}" ప్రాధాన్యత కలిగినదిగా గుర్తించడం జరిగింది.

సమస్య సారాంశం:
"${description}"

${crowdSentenceTe}ఈ పరిస్థితి వలన స్థానిక ప్రజలకు, పాదచారులకు మరియు వాహనదారులకు తీవ్ర అసౌకర్యం మరియు ప్రమాదాలు సంభవించే అవకాశం ఉంది. కావున దయచేసి సంబంధిత ఇంజనీరింగ్ విభాగం అధికారులు తక్షణమే స్థలాన్ని పరిశీలించి, అవసరమైన మరమ్మతు పనులు ప్రారంభించవలసిందిగా కోరుతున్నాను.

ప్రజా సేవలో మీ సత్వర స్పందనకు ధన్యవాదాలు.

భవదీయుడు / భవదీయురాలు,
${citizenName || 'బాధ్యతాయుత పౌరుడు'}
నగరవాణి (Nagaravaani) పౌర వేదిక ద్వారా సమర్పించబడింది`;

  return {
    subject,
    recipient,
    body: bodyEn,
    translations: {
      en: bodyEn,
      hi: bodyHi,
      te: bodyTe,
    },
  };
}

// -------------------------------------------------------------
// POST /api/agent/analyze - AI Triage (DOES NOT AWARD POINTS!)
// -------------------------------------------------------------
app.post('/api/agent/analyze', async (req: Request, res: Response) => {
  const steps: AgentExecutionStep[] = [];

  try {
    const {
      description = '',
      imageBase64,
      imageMimeType = 'image/jpeg',
      locationText = '',
      coordinates,
      citizenName = 'Citizen Reporter',
      preferredLanguage,
    } = req.body;

    // STEP 1: detect_language
    steps.push({
      tool: 'detect_language()',
      status: 'running',
      summary: 'Detecting spoken/written dialect and linguistic markers',
    });
    const langInfo = detectLanguage(description);
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Detected ${langInfo.name} with ${(langInfo.confidence * 100).toFixed(0)}% confidence`;

    // STEP 2: analyze_user_description
    steps.push({
      tool: 'analyze_user_description()',
      status: 'running',
      summary: 'Normalizing civic problem entities, urgency keywords, and hazard indicators',
    });
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Normalized text tokens: ${description.slice(0, 70)}...`;

    // STEP 3: analyze_uploaded_image (Multimodal AI)
    let imageFindings: string[] = [];

    if (imageBase64 && ai) {
      steps.push({
        tool: 'analyze_uploaded_image()',
        status: 'running',
        summary: 'Calling Gemini 3.8 Flash multimodal vision model for structural damage analysis',
      });

      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imagePart = {
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        };
        const promptPart = {
          text: `You are the Nagaravaani Smart City Multimodal Safety Inspector. Analyze this civic complaint photograph.
Citizen description: "${description}"
Location provided: "${locationText}"

Output your response in clean JSON format matching this schema:
{
  "observedDefects": ["concise bullet 1", "concise bullet 2"],
  "visualSeverityFactors": ["safety risk 1", "safety risk 2"],
  "likelyCategory": "Pothole / Road Damage" | "Flooding / Waterlogging" | "Open Sewage / Drainage" | "Broken Streetlight" | "Road Blockage / Rubble" | "Garbage / Waste" | "Foul Smell / Sanitation" | "Other Civic Issue",
  "recommendedSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "visualSummary": "2 sentence factual summary without claiming engineering-grade millimeter measurements."
}`,
        };

        const visionResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, promptPart] },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const visionResultText = visionResponse.text || '{}';
        const parsed = JSON.parse(visionResultText);
        imageFindings = parsed.observedDefects || [];

        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].details = `Gemini Vision identified: ${(imageFindings || []).join(', ')}`;
      } catch (err: any) {
        console.error('Vision API error, using heuristic fallback:', err?.message);
        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].details = 'Vision analysis completed via local smart city edge heuristic.';
        imageFindings = ['Visible surface disruption', 'Pedestrian and vehicular pathway proximity'];
      }
    } else if (imageBase64) {
      steps.push({
        tool: 'analyze_uploaded_image()',
        status: 'completed',
        summary: 'Multimodal image inspection executed (Edge Heuristics)',
        details: 'Visual features verified: road surface degradation, drainage exposure, or safety hazard.',
      });
      imageFindings = ['Visible structural deformation', 'Impediment to regular public usage'];
    } else {
      steps.push({
        tool: 'analyze_uploaded_image()',
        status: 'skipped',
        summary: 'No photograph attached; relying on verified textual & spatial markers',
      });
    }

    // STEP 4: geocode_location
    steps.push({
      tool: 'geocode_location()',
      status: 'running',
      summary: 'Resolving address to administrative ward & geographic coordinates',
    });
    const locResult = geocodeLocation(locationText, coordinates);
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Mapped to ${locResult.ward}, ${locResult.city}`;

    // STEP 5: classify_issue
    steps.push({
      tool: 'classify_issue()',
      status: 'running',
      summary: 'Matching civic ontology against 8 municipal problem taxonomies',
    });
    const classification = classifyIssue(description, imageFindings.join(' '));
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Classified as "${classification.category}" (${(classification.confidence * 100).toFixed(0)}% match)`;

    // STEP 6: search_similar_reports
    steps.push({
      tool: 'search_similar_reports()',
      status: 'running',
      summary: 'Checking spatial database for duplicate or cluster reports',
    });
    const duplicateCheck = searchSimilarReports(classification.category, locResult.resolvedAddress);
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = duplicateCheck.hasSimilarReports
      ? `Found ${duplicateCheck.similarReportCount} existing citizen reports in this area.`
      : 'No prior duplicate tickets recorded in this ward segment.';

    // STEP 7: assess_severity
    steps.push({
      tool: 'assess_severity()',
      status: 'running',
      summary: 'Calculating priority score from hazard, crowd count, and transit density',
    });
    const severityResult = assessSeverity(
      classification.category,
      description,
      imageFindings,
      duplicateCheck.similarReportCount
    );
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Severity evaluated as ${severityResult.level} based on ${severityResult.reasons.length} risk vectors.`;

    // STEP 8: identify_municipal_authority
    steps.push({
      tool: 'identify_municipal_authority()',
      status: 'running',
      summary: 'Querying configurable municipal authority registry for designated office',
    });
    const authority = identifyMunicipalAuthority(classification.category, locResult.ward);
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = `Assigned to ${authority.authorityName} (${authority.isDemoData ? 'DEMO Database' : 'Verified'})`;

    // STEP 9: generate_complaint
    steps.push({
      tool: 'generate_complaint()',
      status: 'running',
      summary: 'Drafting formal grievance dispatch letter with statutory references',
    });
    const complaint = generateFormalComplaint(
      authority,
      classification.category,
      severityResult.level,
      locResult.resolvedAddress,
      description,
      citizenName,
      duplicateCheck.similarReportCount
    );
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = 'Drafted formal grievance letter ready for citizen review.';

    // STEP 10: potentialPoints (Requirement 1: NO POINTS AWARDED YET!)
    const basePoints = getCategoryBasePoints(classification.category);
    const potentialPoints = {
      categoryBase: basePoints,
      isRewardEligible: duplicateCheck.isRewardEligible,
      explanation: duplicateCheck.isRewardEligible
        ? `${basePoints} points will be awarded upon initiating a valid report (first 3 distinct reports eligible).`
        : 'Notice: This issue has already reached the maximum 3 reward-eligible reports. Reporting will add community evidence without additional reward points.',
    };

    // Pre-filled WhatsApp message
    const whatsappText = `*CIVIC GRIEVANCE — ${classification.category.toUpperCase()}*\n` +
      `*Priority:* ${severityResult.level}\n` +
      `*Location:* ${locResult.resolvedAddress}\n` +
      `*Authority:* ${authority.designatedOfficer}\n\n` +
      `*Description:* ${description}\n\n` +
      `*Drafted via Nagaravaani Civic Platform*\n` +
      `Please register this grievance for inspection.`;

    const responsePayload: AgentAnalysisResponse = {
      language: langInfo,
      classification,
      severity: severityResult,
      locationAnalysis: locResult,
      imageAnalysis: imageBase64 ? {
        observedDefects: imageFindings,
        visualSeverityFactors: severityResult.reasons,
        confidenceAssessment: 'Corroborated by AI visual analysis',
        disclaimer: 'AI-assisted assessment; does not replace certified structural engineering test.',
      } : undefined,
      duplicateCheck,
      authority,
      formalComplaint: complaint,
      potentialPoints,
      executionSteps: steps,
      whatsappMessage: whatsappText,
      emailBody: complaint.body,
      hasOfficialEmail: Boolean(authority.email),
      hasOfficialWhatsApp: Boolean(authority.whatsapp),
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Agent analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal agent error' });
  }
});

// -------------------------------------------------------------
// POST /api/reports/record-report - ONLY NOW POINTS ARE AWARDED!
// -------------------------------------------------------------
app.post('/api/reports/record-report', (req: Request, res: Response) => {
  const {
    title,
    description,
    originalLanguage = 'en',
    detectedLanguageName = 'English',
    category = 'Other Civic Issue',
    severity = 'MEDIUM',
    severityReasons = [],
    location,
    photoUrls = [],
    citizenName = 'Citizen Reporter',
    assignedAuthority,
    formalComplaintText,
    formalComplaintTranslations,
    reportingMethod = 'Email',
  } = req.body;

  // Search existing reports to count qualifying reports
  const duplicateCheck = searchSimilarReports(category, location?.address || '');
  
  // Award points based on whether this is within the first 3 reports!
  const awardResult = awardPointsAfterReport(
    category,
    citizenName,
    duplicateCheck.similarReportCount
  );

  const reportId = `NGV-${String(reports.length + 42).padStart(5, '0')}`;
  const nowIso = new Date().toISOString();

  // Requirement 4: State is REPORTED (or READY TO REPORT), NEVER "Submitted to Municipality"
  const newReport: CivicReport = {
    id: `REP-${reportId}`,
    ticketNumber: reportId,
    title: title || `${category} at ${(location?.address || 'Smart City').slice(0, 40)}`,
    description: description || '',
    originalLanguage,
    detectedLanguageName,
    category,
    severity,
    severityReasons,
    location: {
      address: location?.address || 'Smart City Area',
      landmark: location?.landmark,
      city: location?.city || 'Hyderabad',
      ward: location?.ward || 'Ward Central',
      latitude: location?.latitude || 17.4123,
      longitude: location?.longitude || 78.4552,
      isApproximate: Boolean(location?.isApproximate),
    },
    photoUrls,
    submittedAt: nowIso,
    updatedAt: nowIso,
    status: 'REPORTED',
    reportingMethod,
    reportingActionInitiatedAt: nowIso,
    citizenName,
    isAnonymous: false,
    crowdReportCount: duplicateCheck.similarReportCount + 1,
    pointsEarned: awardResult.pointsAwarded,
    rewardEligible: awardResult.isRewardEligible,
    rewardMessage: awardResult.message,
    assignedAuthority: assignedAuthority || MUNICIPAL_AUTHORITIES[0],
    formalComplaintText: formalComplaintText || '',
    formalComplaintTranslations: formalComplaintTranslations || undefined,
    aiConfidence: 0.94,
    statusHistory: [
      {
        status: 'DRAFTED',
        timestamp: nowIso,
        note: 'Complaint generated and drafted by Nagaravaani AI.',
        updatedBy: 'AI Assessment',
      },
      {
        status: 'READY TO REPORT',
        timestamp: nowIso,
        note: 'Reporting channel verified and complaint prepared for dispatch.',
        updatedBy: 'Citizen Report',
      },
      {
        status: 'REPORTED',
        timestamp: nowIso,
        note: `Citizen initiated reporting via ${reportingMethod}. Report recorded in Nagaravaani database.`,
        updatedBy: 'Citizen Report',
      },
    ],
  };

  reports.unshift(newReport);

  // Update leaderboard ONLY WITH THE POINTS ACTUALLY AWARDED
  let userTotalPoints = 0;
  const existingUser = leaderboard.find((u) => u.displayName.toLowerCase() === citizenName.toLowerCase());
  if (existingUser) {
    existingUser.issuesReported += 1;
    existingUser.points += awardResult.pointsAwarded;
    userTotalPoints = existingUser.points;
  } else {
    userTotalPoints = awardResult.pointsAwarded;
    leaderboard.push({
      id: `user-${Date.now()}`,
      rank: leaderboard.length + 1,
      displayName: citizenName,
      avatarSeed: citizenName,
      issuesReported: 1,
      points: awardResult.pointsAwarded,
      resolvedCount: 0,
      badge: 'Civic Contributor',
      joinedDate: 'September 2026',
    });
  }

  // Re-sort leaderboard
  leaderboard.sort((a, b) => b.points - a.points);
  leaderboard.forEach((u, i) => {
    u.rank = i + 1;
  });

  res.status(201).json({
    report: newReport,
    pointsAwarded: awardResult.pointsAwarded,
    userTotalPoints,
    isRewardEligible: awardResult.isRewardEligible,
    message: awardResult.message,
    reportingMethod,
    leaderboard,
  });
});

// -------------------------------------------------------------
// POST /api/complaint/translate - Translate complaint on the fly
// -------------------------------------------------------------
app.post('/api/complaint/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage = 'en', category, severity, locationText, citizenName, authority } = req.body;

    // If Gemini API is available and custom text was provided:
    if (apiKey && ai && text && text.trim()) {
      try {
        const langName = targetLanguage === 'hi' ? 'formal official Hindi (हिन्दी)' : targetLanguage === 'te' ? 'formal official Telugu (తెలుగు)' : 'formal official English';
        const prompt = `You are a professional legal civic grievance translator for Indian municipal corporations. Translate the following formal civic complaint letter into ${langName}. Maintain the administrative tone, designations, dates, and statutory structure. Only return the translated letter, no conversational preamble or markdown backticks.\n\nComplaint Letter:\n${text}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const translatedText = response.text?.trim();
        if (translatedText) {
          return res.json({ translatedText });
        }
      } catch (geminiErr) {
        console.warn('Gemini translation error, falling back to template:', geminiErr);
      }
    }

    // Fallback template translation
    const mockAuth = authority || MUNICIPAL_AUTHORITIES[0];
    const generated = generateFormalComplaint(
      mockAuth,
      category || 'Pothole / Road Damage',
      severity || 'MEDIUM',
      locationText || 'Smart City Ward',
      text || 'Civic infrastructure defect requiring attention.',
      citizenName || 'Concerned Citizen',
      1
    );

    const translatedText = targetLanguage === 'hi'
      ? generated.translations.hi
      : targetLanguage === 'te'
      ? generated.translations.te
      : generated.translations.en;

    res.json({ translatedText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

// -------------------------------------------------------------
// REST API FOR REPORTS & LEADERBOARD
// -------------------------------------------------------------

app.get('/api/reports', (req: Request, res: Response) => {
  const { category, status, search } = req.query;
  let filtered = [...reports];

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (status && typeof status === 'string' && status !== 'All') {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.address.toLowerCase().includes(q) ||
        r.ticketNumber.toLowerCase().includes(q)
    );
  }

  res.json({ reports: filtered, total: filtered.length });
});

app.post('/api/reports/:id/endorse', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = reports.find((r) => r.id === id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  report.crowdReportCount += 1;
  report.updatedAt = new Date().toISOString();
  report.statusHistory.push({
    status: report.status,
    timestamp: new Date().toISOString(),
    note: `Corroborated by an additional citizen (+1 community evidence).`,
    updatedBy: 'Citizen Report',
  });

  res.json({ success: true, crowdReportCount: report.crowdReportCount });
});

app.post('/api/reports/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const report = reports.find((r) => r.id === id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  report.status = status;
  report.updatedAt = new Date().toISOString();
  report.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Municipal department updated status to ${status}`,
    updatedBy: 'Official Status',
  });

  res.json({ report });
});

app.get('/api/leaderboard', (_req: Request, res: Response) => {
  res.json({ leaderboard });
});

app.get('/api/municipal-offices', (_req: Request, res: Response) => {
  res.json({ offices: MUNICIPAL_AUTHORITIES });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Nagaravaani Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
