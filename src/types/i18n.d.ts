import { DefineLocaleMessage } from "vue-i18n";
 
declare module "vue-i18n" {
  export interface DefineLocaleMessage {
    message: {
      hello: string;
      welcome: string;
    };
    navbar: {
      action: {
        locale: string;
      };
    };
    language: {
      "zh-CN": string;
      "en-US": string;
    };
  }
}