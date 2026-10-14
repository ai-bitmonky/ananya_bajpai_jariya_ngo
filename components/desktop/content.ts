/* Desktop-only bilingual content (ported from the prototype's `X` object) and the
   optional-intro artwork. UI strings live in lib/strings*.ts; this is content. */
import type { Bi } from '@/lib/data';

export interface DMsg { who: Bi; hue: string; i: string; when: Bi; t: Bi; instr?: boolean }

export const X = {
  discussion: [
    { who: { en: 'Hemlata', hi: 'हेमलता' }, hue: '#C4616F', i: 'H', when: { en: '2 h', hi: '2 घं' }, t: { en: 'The armhole curve finally came out right. Measure twice, cut once!', hi: 'आख़िरकार बाँह का घेरा सही बना। दो बार नापो, एक बार काटो!' } },
    { who: { en: 'Rekha', hi: 'रेखा' }, hue: '#4E7D5B', i: 'R', when: { en: '4 h', hi: '4 घं' }, t: { en: 'The twins slept early, so I finished two lessons tonight.', hi: 'आज जुड़वाँ बच्चे जल्दी सो गए, तो मैंने रात में दो पाठ पूरे किए।' } },
    { who: { en: 'Naina Shah', hi: 'नैना शाह' }, hue: '#7B1E2E', i: 'N', instr: true, when: { en: '1 d', hi: '1 दि' }, t: { en: 'Lovely work, didi. In Lesson 7 keep the dart 1.5 cm from the bust point, and press every seam before you join.', hi: 'बहुत बढ़िया, दीदी। पाठ 7 में डार्ट को 1.5 सेमी दूर रखें, और जोड़ने से पहले हर सिलाई प्रेस करें।' } },
  ] as DMsg[],
  todo: [
    { en: 'Watch the lesson once without stopping', hi: 'पाठ एक बार बिना रोके देखें' },
    { en: 'Practise along on a spare piece of cloth', hi: 'बचे कपड़े पर साथ-साथ अभ्यास करें' },
    { en: 'Share a photo of your work in Discussion', hi: 'अपने काम की फ़ोटो चर्चा में डालें' },
  ] as Bi[],
  workDo: {
    ku: [{ en: 'Stitch school uniforms from pre-cut pieces', hi: 'पहले से कटे कपड़े से स्कूल यूनिफ़ॉर्म सिलना' }, { en: 'Check seams, finish buttons and hems', hi: 'सिलाई जाँचना, बटन और तुरपाई पूरी करना' }, { en: 'Bonus for every 10 pieces above target', hi: 'लक्ष्य से ऊपर हर 10 पीस पर बोनस' }],
    jain: [{ en: 'Teach Hindi and Maths to classes 1–5', hi: 'कक्षा 1–5 को हिंदी और गणित पढ़ाना' }, { en: 'Check homework and keep attendance', hi: 'गृहकार्य जाँचना और हाज़िरी रखना' }, { en: 'Meet parents once a month', hi: 'महीने में एक बार अभिभावकों से मिलना' }],
    pottery: [{ en: 'Paint diyas and kulhads at home', hi: 'घर पर दीये और कुल्हड़ रंगना' }, { en: 'Collect raw pieces every Monday', hi: 'हर सोमवार कच्चा माल लेना' }, { en: 'Paid per day, weekly in your bank', hi: 'रोज़ के हिसाब से, हर हफ़्ते बैंक में भुगतान' }],
    lunch: [{ en: 'Cook dal, sabzi and roti for 40 tiffins', hi: '40 टिफ़िन के लिए दाल, सब्ज़ी और रोटी बनाना' }, { en: 'Pack and label tiffins by 11 am', hi: '11 बजे तक टिफ़िन पैक और लेबल करना' }, { en: 'Keep the kitchen clean (FSSAI basics)', hi: 'रसोई साफ़ रखना (FSSAI नियम)' }],
    anganwadi: [{ en: 'Help serve hot meals to children', hi: 'बच्चों को गर्म खाना परोसने में मदद' }, { en: 'Keep the centre clean and safe', hi: 'केंद्र को साफ़ और सुरक्षित रखना' }, { en: 'Support the worker on health days', hi: 'स्वास्थ्य दिवस पर कार्यकर्ता की मदद' }],
    mehendi: [{ en: 'Bridal and guest mehendi at weddings', hi: 'शादियों में दुल्हन और मेहमानों की मेहंदी' }, { en: 'Bring your own cones; studio pays travel', hi: 'अपने कोन लाएँ; आने-जाने का ख़र्च स्टूडियो देगा' }, { en: 'Show 5 designs at a short trial', hi: 'छोटे ट्रायल में 5 डिज़ाइन दिखाएँ' }],
  } as Record<string, Bi[]>,
  caption: { en: 'Now fold the fabric in half along the grain line.', hi: 'अब कपड़े को सीधी धारी पर आधा मोड़ें।' } as Bi,
};

/** States offered in the optional intro (value stored = English name, as in the store). */
export const STATES: Bi[] = [
  { en: 'Haryana', hi: 'हरियाणा' }, { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' }, { en: 'Rajasthan', hi: 'राजस्थान' },
  { en: 'Punjab', hi: 'पंजाब' }, { en: 'Bihar', hi: 'बिहार' }, { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' }, { en: 'Delhi', hi: 'दिल्ली' },
];

/** Intro slide art (same drawings as the approved mobile onboarding). [a0, a1, svg inner markup] */
export const OBART: [string, string, string][] = [
  ['#8C2F3F', '#C4616F', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="150" width="172" height="16" rx="8" fill="color-mix(in srgb,var(--cream) 18%,transparent)"/><path d="M184 150V74a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v36h22V88h76v62" fill="color-mix(in srgb,var(--cream) 14%,transparent)"/><circle cx="186" cy="92" r="17"/><circle cx="186" cy="92" r="5"/><path d="M75 110v24M64 134h22"/><rect x="112" y="34" width="14" height="24" rx="3"/><path d="M119 34c0-14-36-10-44 24"/><path d="M38 141c18-7 34-7 52 0s34 7 52 0" stroke-dasharray="1 9"/></g>`],
  ['#4E7D5B', '#8DB89A', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M62 30h76l26 26v110H62z" fill="color-mix(in srgb,var(--cream) 16%,transparent)"/><path d="M138 30v26h26M82 72h48M82 92h62M82 112h36"/><circle cx="58" cy="152" r="20" fill="color-mix(in srgb,var(--cream) 20%,transparent)"/><path d="M50 143h16M50 150h16M50 143h5a6 6 0 0 1 0 12h-5l10 9"/><circle cx="168" cy="146" r="30" fill="#4E7D5B"/><path d="M154 146l10 10 18-20" stroke-width="6"/></g>`],
  ['#3F6E8C', '#7FA9C4', `<g fill="none" stroke="var(--cream)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 166h192"/><path d="M50 166v-52l38-30 38 30v52" fill="color-mix(in srgb,var(--cream) 16%,transparent)"/><path d="M78 166v-28h20v28M40 122l48-38 48 38"/><path d="M92 182c30 10 66 0 82-34" stroke-dasharray="2 10"/><path d="M176 132c-16-18-24-30-24-42a24 24 0 0 1 48 0c0 12-8 24-24 42z" fill="#7B1E2E"/><circle cx="176" cy="90" r="8" fill="var(--cream)"/><path d="M196 166v-22M196 144c-8 0-12-6-12-12 6 0 12 4 12 12zM196 144c8 0 12-6 12-12-6 0-12 4-12 12z"/></g>`],
];
