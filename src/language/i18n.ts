
import { createI18n, type I18nOptions } from "vue-i18n";
import zh from "./zh-CN";
import en from "./en-US";
 
const options: I18nOptions = {
  legacy: false, // 启用组合式API
  locale: localStorage.getItem("locale") || "zh-CN",
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zh,
    "en-US": en,
  },
};
 
const i18n = createI18n(options);
 
export default i18n;