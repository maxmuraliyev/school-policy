import { cookies } from 'next/headers';
import { translations, Language } from './translations';

export async function getServerLang(): Promise<Language> {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get('app_lang')?.value as Language;
    if (lang === 'uz' || lang === 'en') {
      return lang;
    }
  } catch {
    // If called outside request context
  }
  return 'uz';
}

export async function getServerI18n() {
  const lang = await getServerLang();
  const dict = translations[lang] || translations.uz;
  
  const t = (key: string): string => {
    return dict[key] || translations.en[key] || key;
  };

  return { lang, t };
}
