import { ConfigContext, ExpoConfig } from "expo/config";

const EAS_PROJECT_ID = "ee5a2b55-7cce-4e87-9910-8cbd0b66ed8d"; 
const OWNER = "rekmo3";
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_SLUG = "rn-todo-list";

type AppEnv = "development" | "preview" | "production";

const APP_NAME = "Todo App";
const BUNDLE_IDENTIFIER = `com.${OWNER.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.rntodolist`;
const PACKAGE_NAME = BUNDLE_IDENTIFIER;
const SCHEME = "rntodolist";

const ICON = "./assets/images/icon.png";
const IOS_ICON_PROD = "./assets/expo.icon"; // як було в оригінальному app.json
const ADAPTIVE_ICON_FOREGROUND = "./assets/images/android-icon-foreground.png";
const ADAPTIVE_ICON_BACKGROUND = "./assets/images/android-icon-background.png";
const ADAPTIVE_ICON_MONOCHROME = "./assets/images/android-icon-monochrome.png";

export const getDynamicAppConfig = (environment: AppEnv) => {
  if (environment === "development") {
    return {
      name: `${APP_NAME} Dev`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
      packageName: `${PACKAGE_NAME}.dev`,
      icon: "./assets/images/icons/icon-dev.png",
      iosIcon: "./assets/images/icons/icon-dev.png",
      adaptiveIconForeground:
        "./assets/images/icons/android-icon-foreground-dev.png",
      adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
      adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
      scheme: `${SCHEME}-dev`,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: "./assets/images/icons/icon-preview.png",
      iosIcon: "./assets/images/icons/icon-preview.png",
      adaptiveIconForeground:
        "./assets/images/icons/android-icon-foreground-preview.png",
      adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
      adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
      scheme: `${SCHEME}-preview`,
    };
  }

  // Production (за замовчуванням)
  return {
    name: APP_NAME,
    bundleIdentifier: BUNDLE_IDENTIFIER,
    packageName: PACKAGE_NAME,
    icon: ICON,
    iosIcon: IOS_ICON_PROD,
    adaptiveIconForeground: ADAPTIVE_ICON_FOREGROUND,
    adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
    adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
    scheme: SCHEME,
  };
};

type RuntimeProcess = {
  env?: Record<string, string | undefined>;
};

const getRuntimeProcess = (): RuntimeProcess | undefined =>
  (globalThis as typeof globalThis & { process?: RuntimeProcess }).process;

const resolveEnv = (): AppEnv => {
  const raw = getRuntimeProcess()?.env?.APP_ENV;
  return raw === "preview" || raw === "production" ? raw : "development";
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = resolveEnv();
  const dynamic = getDynamicAppConfig(environment);

  console.log("⚙️  Building rn-todo-list for environment:", environment);
  console.log("📦 Convex URL:", getRuntimeProcess()?.env?.EXPO_PUBLIC_CONVEX_URL);

  return {
    ...config,
    name: dynamic.name,
    slug: PROJECT_SLUG,
    version: "5.0.0",
    orientation: "portrait",
    icon: dynamic.icon,
    scheme: dynamic.scheme,
    userInterfaceStyle: "automatic",

    ios: {
      supportsTablet: true,
      bundleIdentifier: dynamic.bundleIdentifier,
      buildNumber: "1",
      icon: dynamic.iosIcon,
    },

    android: {
      package: dynamic.packageName,
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: dynamic.adaptiveIconForeground,
        backgroundImage: dynamic.adaptiveIconBackground,
        monochromeImage: dynamic.adaptiveIconMonochrome,
      },
      predictiveBackGestureEnabled: false,
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      ],
      "expo-secure-store",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    // OTA (EAS Update)
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      ...config.extra,
      appEnv: environment,
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },

    owner: OWNER,
  };
};
