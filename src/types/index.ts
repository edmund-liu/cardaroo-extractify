
export interface ContactInfo {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export enum AppState {
  LANDING = "landing",
  CAMERA = "camera",
  PROCESSING = "processing",
  RESULTS = "results"
}
