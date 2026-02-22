export interface WidgetConfig {
  apiBaseUrl: string;
  privacyPolicyUrl: string;
}

const defaultConfig: WidgetConfig = {
  apiBaseUrl: 'http://localhost:8787',
  privacyPolicyUrl: '#',
};

let config: WidgetConfig = { ...defaultConfig };

export function getConfig(): WidgetConfig {
  return config;
}

export function setConfig(newConfig: Partial<WidgetConfig>): void {
  config = { ...config, ...newConfig };
}
