const { version } = require("./package.json");

const EAS_PROJECT_ID = "";
const PROJECT_SLUG = "my-conso";
const OWNER = "diamondrarktvo";

const APP_NAME = "My Conso";
const BUNDLE_IDENTIFIER = "com.myconso";
const PACKAGE_NAME = "com.myconso";
const ICON = "./assets/images/icon.png";
const IMAGES = "./assets/images";

const environment = process.env.EXPO_PUBLIC_APP_ENV || "development";

export const getDynamicAppConfig = (env: string) => {
  if (env === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
    };
  }
  if (env === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: ICON,
    };
  }
  return {
    name: `${APP_NAME} Dev`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.development`,
    packageName: `${PACKAGE_NAME}.development`,
    icon: ICON,
  };
};

export default ({ config }: { config: any }) => {
  const { name, bundleIdentifier, packageName, icon } =
    getDynamicAppConfig(environment);

  return {
    ...config,
    expo: {
      name,
      slug: PROJECT_SLUG,
      version,
      orientation: "portrait",
      icon,
      userInterfaceStyle: "light",
      assetBundlePatterns: ["**/*"],
      ...(EAS_PROJECT_ID ? { extra: { eas: { projectId: EAS_PROJECT_ID } } } : {}),
      ...(OWNER ? { owner: OWNER } : {}),
      ios: {
        supportsTablet: true,
        bundleIdentifier,
        icon: {
          light: icon,
          dark: `${IMAGES}/ios-dark.png`,
          tinted: `${IMAGES}/ios-tinted.png`,
        },
      },
      android: {
        icon,
        adaptiveIcon: {
          foregroundImage: `${IMAGES}/android-icon-foreground.png`,
          backgroundImage: `${IMAGES}/android-icon-background.png`,
          monochromeImage: `${IMAGES}/android-icon-monochrome.png`,
          backgroundColor: "#F97316",
        },
        predictiveBackGestureEnabled: false,
        package: packageName,
      },
      web: {
        favicon: `${IMAGES}/favicon.png`,
      },
      plugins: [
        "expo-font",
        [
          "expo-splash-screen",
          {
            image: `${IMAGES}/splash-icon.png`,
            imageWidth: 220,
            backgroundColor: "#F97316",
            dark: { image: `${IMAGES}/splash-icon-dark.png`, backgroundColor: "#0F172A" },
          },
        ],
      ],
    },
  };
};
