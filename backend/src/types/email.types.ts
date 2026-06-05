export interface XONResponse {
  BreachMetrics?: object;
  ExposedBreaches?: object;
  bhash?: string;
}

export interface EmailRepResponse {
  email: string;
  reputation: string;
  suspicious: boolean;
  references: number;
  details: {
    blacklisted: boolean;
    malicious_activity: boolean;
    spam: boolean;
    free_provider: boolean;
    disposable: boolean;
    deliverable: boolean;
  };
}

export interface GravatarResponse {
  entry?: Array<{
    displayName?: string;
    thumbnailUrl?: string;
    aboutMe?: string;
    urls?: Array<{ value: string; title: string }>;
  }>;
}

export interface CheckResult {
  email: string;
  breaches: XONResponse | null;
  reputation: EmailRepResponse | null;
  gravatar: GravatarResponse | null;
  checkedAt: string;
}
export interface PhoneMetadata {
  valid: boolean;
  country: string | undefined;
  countryCallingCode: string;
  nationalNumber: string;
  numberType: string | undefined;
  formatted: string;
}

export interface PhoneCheckResult {
  phone: string;
  metadata: PhoneMetadata;
  breaches: any | null;
  checkedAt: string;
}