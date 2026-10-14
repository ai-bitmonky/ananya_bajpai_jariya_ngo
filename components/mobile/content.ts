/* Content the mobile prototype added on top of lib/data.ts: curricula for courses without one,
   "what you will do" bullets per job, the state list, and the onboarding illustrations.
   (Content, not UI strings — both languages live side by side.) */
import { ZARIYA, type Bi, type Course, type Lesson } from '@/lib/data';

const bi = ([en, hi]: readonly [string, string]): Bi => ({ en, hi });

const CURR: Record<string, [string, string][]> = {
  cooking: [['Kitchen hygiene & FSSAI basics', 'रसोई की सफ़ाई और FSSAI'], ['Mango & lemon pickle', 'आम और नींबू का अचार'], ['Papad & badi', 'पापड़ और बड़ी'], ['A week of tiffin menus', 'हफ़्ते भर का टिफ़िन मेन्यू'], ['Festival sweets', 'त्योहार की मिठाइयाँ'], ['Packing & labels', 'पैकिंग और लेबल'], ['Costing & pricing', 'लागत और दाम'], ['Selling to shops & offices', 'दुकानों और दफ़्तरों में बेचना']],
  craft: [['Clay diyas', 'मिट्टी के दीये'], ['Painting & finishing', 'रंगाई और फ़िनिशिंग'], ['Rakhi making', 'राखी बनाना'], ['Jute bags', 'जूट के बैग'], ['Festive torans', 'त्योहार के तोरण'], ['Setting up a mela stall', 'मेले की दुकान लगाना']],
  comm: [['Introducing yourself', 'अपना परिचय देना'], ['Talking to customers', 'ग्राहकों से बात'], ['At the bank', 'बैंक में बात'], ['Phone manners', 'फ़ोन पर बात का तरीका'], ['Selling on WhatsApp', 'WhatsApp पर बिक्री']],
  goat: [['Choosing healthy animals', 'स्वस्थ पशु चुनना'], ['A low-cost shed', 'कम लागत का बाड़ा'], ['Feed & water', 'चारा और पानी'], ['Vaccination calendar', 'टीकाकरण कैलेंडर'], ['Common diseases', 'आम बीमारियाँ'], ['Keeping records', 'हिसाब रखना'], ['Selling at the right time', 'सही समय पर बेचना']],
  beauty: [['Hygiene & tools', 'सफ़ाई और औज़ार'], ['Making mehendi cones', 'मेहंदी कोन बनाना'], ['Basic patterns', 'बुनियादी डिज़ाइन'], ['Arabic mehendi', 'अरबी मेहंदी'], ['Bridal mehendi', 'दुल्हन की मेहंदी'], ['Threading', 'थ्रेडिंग'], ['Basic facial', 'बेसिक फ़ेशियल'], ['A parlour at home', 'घर पर पार्लर'], ['Pricing & bookings', 'दाम और बुकिंग']],
  phone: [['Know your smartphone', 'अपना स्मार्टफ़ोन जानें'], ['Paying with UPI', 'UPI से पेमेंट'], ['Bank balance by SMS', 'SMS से बैंक बैलेंस'], ['DigiLocker & Aadhaar', 'डिजिलॉकर और आधार'], ['Government apps', 'सरकारी ऐप'], ['Staying safe from fraud', 'धोखाधड़ी से बचाव']],
  farm: [['Choosing seeds', 'बीज चुनना'], ['Preparing the bed', 'क्यारी तैयार करना'], ['Compost at home', 'घर पर खाद'], ['Watering & care', 'पानी और देखभाल'], ['Nursery saplings', 'नर्सरी की पौध'], ['Selling at the mandi', 'मंडी में बेचना']],
};

const cache = new Map<string, Lesson[]>();
/** The full lesson list of a course (sewing has one in data.ts; the rest come from CURR). */
export function curriculum(c: Course): Lesson[] {
  if (c.curriculum) return c.curriculum;
  const hit = cache.get(c.id);
  if (hit) return hit;
  const src = CURR[c.id] || [];
  const per = Math.round(c.mins / Math.max(src.length, 1) / 5) * 5 || 15;
  const list = src.map((p, i) => ({ n: i + 1, t: bi(p), d: per }));
  cache.set(c.id, list);
  return list;
}

export const JOBDO: Record<string, Bi[]> = Object.fromEntries(Object.entries({
  ku: [['Stitch shirts and skirts on factory machines', 'फ़ैक्ट्री मशीन पर कमीज़ और स्कर्ट सिलना'], ['Finish hems, buttons and labels', 'तुरपाई, बटन और लेबल लगाना'], ['Earn extra for every piece above 40 a day', 'रोज़ 40 से ज़्यादा पीस पर अतिरिक्त कमाई']],
  jain: [['Teach Hindi and Maths to classes 1–5', 'कक्षा 1–5 को हिंदी और गणित पढ़ाना'], ['Check homework and keep attendance', 'गृहकार्य जाँचना और हाज़िरी रखना'], ['Meet parents once a month', 'महीने में एक बार अभिभावकों से मिलना']],
  pottery: [['Paint diyas and kulhads at home', 'घर पर दीये और कुल्हड़ रंगना'], ['Collect and return batches every week', 'हर हफ़्ते माल लेना और लौटाना'], ['Get paid every Saturday by UPI', 'हर शनिवार UPI से भुगतान']],
  lunch: [['Cook dal, sabzi and roti for 40 tiffins', '40 टिफ़िन के लिए दाल, सब्ज़ी, रोटी बनाना'], ['Pack tiffins cleanly and on time', 'साफ़-सफ़ाई से समय पर टिफ़िन पैक करना'], ['Plan the weekly menu with Hemlata', 'हेमलता के साथ हफ़्ते का मेन्यू बनाना']],
  anganwadi: [['Help cook hot meals for children', 'बच्चों के लिए गरम खाना बनाने में मदद'], ['Bring children safely to the centre', 'बच्चों को सुरक्षित केंद्र तक लाना'], ['Help on weighing and vaccination days', 'वज़न और टीकाकरण के दिन मदद']],
  mehendi: [['Apply bridal and guest mehendi', 'दुल्हन और मेहमानों को मेहंदी लगाना'], ['Travel with the studio team', 'स्टूडियो टीम के साथ जाना'], ['Build your own photo portfolio', 'अपनी फ़ोटो पोर्टफ़ोलियो बनाना']],
} as Record<string, [string, string][]>).map(([k, v]) => [k, v.map(bi)]));

/** States for the "About you" form. The stored value is the English name (store profile.state). */
export const STATES: { en: string; hi: string }[] = [
  ['Haryana', 'हरियाणा'], ['Uttar Pradesh', 'उत्तर प्रदेश'], ['Rajasthan', 'राजस्थान'], ['Punjab', 'पंजाब'], ['Bihar', 'बिहार'], ['Madhya Pradesh', 'मध्य प्रदेश'], ['Delhi', 'दिल्ली'],
].map(([en, hi]) => ({ en, hi }));

export const CARDS = ['AAY', 'BPL', 'APL', 'None'] as const;

/** Onboarding illustrations: [gradient from, gradient to, svg inner markup (240×200)]. Static, trusted markup. */
export const OBART: [string, string, string][] = [
  ['#8C2F3F', '#C4616F', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="150" width="172" height="16" rx="8" fill="color-mix(in srgb,var(--cream) 18%,transparent)"/><path d="M184 150V74a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v36h22V88h76v62" fill="color-mix(in srgb,var(--cream) 14%,transparent)"/><circle cx="186" cy="92" r="17"/><circle cx="186" cy="92" r="5"/><path d="M75 110v24M64 134h22"/><rect x="112" y="34" width="14" height="24" rx="3"/><path d="M119 34c0-14-36-10-44 24"/><path d="M38 141c18-7 34-7 52 0s34 7 52 0" stroke-dasharray="1 9"/></g>`],
  ['#4E7D5B', '#8DB89A', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M62 30h76l26 26v110H62z" fill="color-mix(in srgb,var(--cream) 16%,transparent)"/><path d="M138 30v26h26M82 72h48M82 92h62M82 112h36"/><circle cx="58" cy="152" r="20" fill="color-mix(in srgb,var(--cream) 20%,transparent)"/><path d="M50 143h16M50 150h16M50 143h5a6 6 0 0 1 0 12h-5l10 9"/><circle cx="168" cy="146" r="30" fill="var(--leaf)"/><path d="M154 146l10 10 18-20" stroke-width="6"/></g>`],
  ['#3F6E8C', '#7FA9C4', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 166h192"/><path d="M50 166v-52l38-30 38 30v52" fill="color-mix(in srgb,var(--cream) 16%,transparent)"/><path d="M78 166v-28h20v28M40 122l48-38 48 38"/><path d="M92 182c30 10 66 0 82-34" stroke-dasharray="2 10"/><path d="M176 132c-16-18-24-30-24-42a24 24 0 0 1 48 0c0 12-8 24-24 42z" fill="var(--maroon)"/><circle cx="176" cy="90" r="8" fill="var(--cream)"/><path d="M196 166v-22M196 144c-8 0-12-6-12-12 6 0 12 4 12 12zM196 144c8 0 12-6 12-12-6 0-12 4-12 12z"/></g>`],
];

/** Wordmark: the Devanagari name is the brand mark in every language. */
export const WM = ZARIYA.i18n.appName.hi;
export const ZU = ZARIYA.user;

/** 20:00 lesson video; while playing, 1 real second = 20 video seconds so a demo finishes in ~1 min. */
export const VLEN = 1200;
export const SPEEDS = [1, 1.25, 1.5] as const;
export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
