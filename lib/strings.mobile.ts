/* Mobile-only UI strings (EN + HI) added in the Next.js port — the optional intro card on Home,
   the no-login Profile rows. Merged into the store's t() (see lib/store.tsx). Keys prefixed m_. */
export const M_EXTRA = {
  m_personalise: { en: 'Personalise Zariya', hi: 'ज़रिया को अपने हिसाब से बनाएँ' },
  m_personaliseSub: { en: 'Pick your language and tell us a little about you. It takes a minute and it is optional.', hi: 'अपनी भाषा चुनें और अपने बारे में थोड़ा बताएँ। एक मिनट लगेगा, यह ज़रूरी नहीं है।' },
  m_notNow: { en: 'Not now', hi: 'अभी नहीं' },
  m_langIntro: { en: 'Language & intro', hi: 'भाषा और परिचय' },
  m_langIntroSub: { en: 'See the intro again and tell us about you', hi: 'परिचय फिर देखें और अपने बारे में बताएँ' },
  m_reset: { en: 'Reset demo data', hi: 'डेमो डेटा रीसेट करें' },
  m_resetSub: { en: 'Start again from Ananya’s sample progress', hi: 'अनन्या की नमूना प्रगति से फिर शुरू करें' },
  m_resetDone: { en: 'Demo data reset', hi: 'डेमो डेटा रीसेट हो गया' },
  m_optional: { en: 'Everything here is optional. You can change it later in Profile.', hi: 'यहाँ सब कुछ वैकल्पिक है। बाद में प्रोफ़ाइल में बदल सकती हैं।' },
} as const;
