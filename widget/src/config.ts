export interface WidgetConfig {
  apiBaseUrl: string;
  privacyPolicyUrl: string;
  apiKey: string | null;
}

const defaultConfig: WidgetConfig = {
  apiBaseUrl: 'http://localhost:8787',
  privacyPolicyUrl: '#',
  apiKey: null
};

let config: WidgetConfig = { ...defaultConfig };

export function getConfig(): WidgetConfig {
  return config;
}

export function setConfig(newConfig: Partial<WidgetConfig>): void {
  config = { ...config, ...newConfig };
}

export function getApiKey(): string | null {
  return config.apiKey;
}
