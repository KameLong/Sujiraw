import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// 言語jsonファイルのimport
import translation_en from "./i18n/en.json";
import translation_ja from "./i18n/ja.json";

const resources = {
    ja: {
        translation: translation_ja
    },
    en: {
        translation: translation_en
    }
};

i18n
    .use(LanguageDetector) // ユーザーの言語設定を検知するため
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        // lng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });
    // .init({
    //     // fallbackLng: 'ja',
    //     ns: ['translations'],
    //     defaultNS: 'translations',
    //     debug: true,
    //     interpolation: {
    //         escapeValue: false,
    //     }
    // });

export default i18n;