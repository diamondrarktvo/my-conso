const { version } = require("./package.json");

const EAS_PROJECT_ID = "";
const PROJECT_SLUG = "my-conso";
const OWNER = "diamondrarktvo";

const APP_NAME = "My Conso";
const BUNDLE_IDENTIFIER = "com.myconso";
const PACKAGE_NAME = "com.myconso";
const ICON = "./assets/icon.png";
const ADAPTIVE_ICON = "./assets/adaptive-icon.png";
const SPLASH_IMAGE = "./assets/splash-icon.png";

const environment = process.env.EXPO_PUBLIC_APP_ENV || "development";

export const getDynamicAppConfig = (env: string) => {
  if (env === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
    };
  }
  if (env === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
    };
  }
  return {
    name: `${APP_NAME} Dev`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.development`,
    packageName: `${PACKAGE_NAME}.development`,
    icon: ICON,
    adaptiveIcon: ADAPTIVE_ICON,
  };
};

export default ({ config }: { config: any }) => {
  const { name, bundleIdentifier, packageName, icon, adaptiveIcon } =
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
      splash: { image: SPLASH_IMAGE, resizeMode: "contain", backgroundColor: "#ffffff" },
      assetBundlePatterns: ["**/*"],
      ...(EAS_PROJECT_ID ? { extra: { eas: { projectId: EAS_PROJECT_ID } } } : {}),
      ...(OWNER ? { owner: OWNER } : {}),
      ios: {
        supportsTablet: true,
        bundleIdentifier,
        icon: {
          dark: "./assets/icon-dark.png",
          tinted: "./assets/icon-tinted.png",
        },
      },
      android: {
        adaptiveIcon: { foregroundImage: adaptiveIcon, backgroundColor: "#ffffff" },
        predictiveBackGestureEnabled: false,
        package: packageName,
      },
      web: {
        favicon: "./assets/favicon.ico",
      },
      plugins: ["expo-font"],
    },
  };
};
