# Icônes CONSO pour Expo

## Installation
1. Copie le contenu de `assets/images/` dans le dossier `assets/images/` de ton projet
   (remplace les fichiers existants du starter-kit si les noms sont identiques).
2. Fusionne la configuration ci-dessous dans ton `app.json` (ou `app.config.ts`).
3. Les icônes et l'écran de démarrage ne s'affichent correctement que dans un build
   (EAS Build "preview" ou "production"), pas dans Expo Go.

## Fichiers
| Fichier | Rôle | Format |
|---|---|---|
| icon.png | Icône principale (iOS clair + Android ancien) | 1024×1024, opaque |
| ios-dark.png | Icône iOS mode sombre | 1024×1024, opaque |
| ios-tinted.png | Icône iOS mode teinté | 1024×1024, niveaux de gris |
| android-icon-foreground.png | Android adaptatif : premier plan | 1024×1024, transparent, zone sûre respectée |
| android-icon-background.png | Android adaptatif : fond dégradé | 1024×1024 |
| android-icon-monochrome.png | Android 13+ : icône à thème | 1024×1024, blanc sur transparent |
| splash-icon.png / splash-icon-dark.png | Écran de démarrage clair / sombre | 1024×1024, transparent |
| favicon.png | Version web | 48×48 |

## Configuration app.json
```json
{
  "expo": {
    "name": "Conso",
    "icon": "./assets/images/icon.png",
    "ios": {
      "icon": {
        "light": "./assets/images/icon.png",
        "dark": "./assets/images/ios-dark.png",
        "tinted": "./assets/images/ios-tinted.png"
      }
    },
    "android": {
      "icon": "./assets/images/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png",
        "backgroundColor": "#F97316"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 220,
          "backgroundColor": "#F97316",
          "dark": {
            "image": "./assets/images/splash-icon-dark.png",
            "backgroundColor": "#0F172A"
          }
        }
      ]
    ]
  }
}
```

## Couleurs
- Orange : #FBBF24 → #F97316 (dégradé)
- Bleu nuit : #1E293B / #0F172A
- Orange texte (mode sombre) : #FB923C

## Modifier le logo
Le dessin est vectoriel (dossier `svg/`). Pour changer couleurs ou formes, modifie
`make_icons.py` puis relance : `python3 make_icons.py` (nécessite rsvg-convert et ImageMagick).
