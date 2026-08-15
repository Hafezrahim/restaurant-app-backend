import React, { createContext, useContext, ReactNode } from "react";
import { useRestaurantSettings } from "@/hooks/useSettingsData";
import defaultLogo from "@/assets/logo.png";

type AppInfoContextType = {
  appName: string;
  appLogo: string;
};

const AppInfoContext = createContext<AppInfoContextType | undefined>(undefined);

export const AppInfoProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings } = useRestaurantSettings();
  
  const appName = settings?.general?.name || "مطعم مزاج";
  const appLogo = settings?.general?.logoUrl || defaultLogo;

  return (
    <AppInfoContext.Provider value={{ appName, appLogo }}>
      {children}
    </AppInfoContext.Provider>
  );
};

export const useAppInfo = () => {
  const context = useContext(AppInfoContext);
  if (context === undefined) {
    return { appName: "مطعم مزاج", appLogo: defaultLogo };
  }
  return context;
};
