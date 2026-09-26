import type { Translations } from './en';

export const fr = {
  common: {
    actions: {
      cancel: 'Annuler',
      save: 'Enregistrer',
      reset: 'Réinitialiser',
      retry: 'Réessayer',
    },
  },
  tabs: {
    lighthouses: 'Lighthouses',
    settings: 'Réglages',
    faq: 'FAQ',
  },
  lighthouses: {
    list: {
      title: 'Lighthouses',
      scan: 'Scanner',
      stopScan: 'Arrêter',
      scanning: 'Recherche…',
      emptyTitle: 'Aucune lighthouse pour l’instant',
      emptyBody: 'Branchez vos stations de base SteamVR 2.0, restez à proximité, puis lancez un scan.',
      mockBanner: 'Mode debug : lighthouses simulées',
    },
    state: {
      on: 'Allumée',
      standby: 'Veille',
      sleep: 'Sommeil',
      booting: 'Démarrage',
      unknown: 'Inconnu',
    },
    card: {
      a11yLabel: '{{name}}, {{state}}',
      togglePower: 'Basculer l’alimentation de {{name}}',
    },
    detail: {
      power: 'Alimentation',
      actions: 'Actions',
      identify: 'Identifier',
      identifyHint: 'Fait clignoter la LED de cette station',
      rename: 'Renommer',
      info: 'Informations',
      identifier: 'Identifiant',
      signal: 'Signal',
      signalValue: '{{rssi}} dBm',
      notFound: 'Cette lighthouse n’est plus dans la liste. Relancez un scan.',
    },
    rename: {
      title: 'Renommer',
      placeholder: 'Salon – gauche',
      hint: 'Enregistré uniquement sur ce téléphone.',
      tooShort: 'Au moins 2 caractères.',
    },
  },
  settings: {
    title: 'Réglages',
    appearance: {
      title: 'Apparence',
      system: 'Système',
      light: 'Clair',
      dark: 'Sombre',
    },
    debug: {
      title: 'Développeur',
      mockMode: 'Lighthouses simulées',
      mockModeHint: 'Remplace le Bluetooth par de fausses stations. Pratique sans matériel.',
    },
    data: {
      title: 'Données',
      clearNames: 'Oublier les noms personnalisés',
      clearNamesConfirmTitle: 'Oublier tous les noms personnalisés ?',
      clearNamesConfirmBody: 'Les lighthouses reprendront leur nom d’usine.',
    },
    about: {
      title: 'À propos',
      version: 'Version',
    },
  },
  faq: {
    title: 'FAQ',
    items: {
      standbyVsSleep: {
        question: 'Quelle différence entre Veille et Sommeil ?',
        answer:
          'Le mode Sommeil coupe le rotor et les lasers. La Veille ne coupe que les lasers et laisse tourner le rotor : le réveil est plus rapide, au prix d’un léger bruit de fond.',
      },
      notDetected: {
        question: 'Ma lighthouse n’est pas détectée, que faire ?',
        answer:
          'Redémarrez la station : débranchez-la, attendez qu’elle soit complètement éteinte, rebranchez-la, puis relancez un scan une fois qu’elle a redémarré.',
      },
      oneConnection: {
        question: 'Pourquoi une commande échoue-t-elle parfois ?',
        answer:
          'Une station n’accepte qu’une seule connexion Bluetooth. Fermez la gestion d’alimentation de SteamVR ou les autres apps qui lui parlent, puis réessayez.',
      },
    },
  },
  ble: {
    errors: {
      poweredOff: 'Le Bluetooth est désactivé. Activez-le pour joindre vos lighthouses.',
      unauthorized: 'L’accès au Bluetooth n’est pas autorisé. Activez-le dans les réglages du système.',
      unsupported: 'Cet appareil ne prend pas en charge le Bluetooth Low Energy.',
      permissionDenied: 'Les autorisations Bluetooth sont nécessaires pour rechercher les lighthouses.',
      timeout: 'La lighthouse n’a pas répondu à temps. Rapprochez-vous et réessayez.',
      connectionFailed: 'Connexion à la lighthouse impossible.',
      operationFailed: 'La lighthouse a refusé la commande.',
      deviceNotFound: 'Lighthouse introuvable. Relancez un scan.',
      aborted: 'Opération annulée.',
      unknown: 'Erreur Bluetooth inattendue.',
    },
  },
} as const satisfies Translations;
