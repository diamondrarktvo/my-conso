import 'i18next';
import { DEFAULT_NS } from '../../i18n/constant';
import { Locales } from '../../i18n/locales';

declare module 'i18next' {
   interface CustomTypeOptions {
      defaultNS: typeof DEFAULT_NS;
      resources: typeof Locales.fr;
   }
}
