export type AlertSeverity    = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DatacenterStatus = 'ONLINE' | 'COOLING_STABLE' | 'AI_OPTIMIZED' | 'LOW_CARBON';
export type ThermalState     = 'OPTIMAL' | 'STABLE' | 'CRITICAL';
export type DataLinkStatus   = 'ACTIVE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
export type UserRole         = 'ADMIN' | 'OPERATOR' | 'VIEWER';
type HalLink = { href: string; templated?: boolean };
export type HateoasCollection<T> = {
  _embedded: Record<string, T[]>;
  _links:    Record<string, HalLink>;
};
export type ApiResponse<T> = {
  success:   boolean;
  message:   string;
  data:      T;
  timestamp: string; 
};
export type LoginRequest = {
  email:    string;
  password: string;
};
export type RegisterRequest = {
  companyName: string;
  taxId:       string;
  adminName:   string;
  email:       string;
  password:    string;
};
export type ForgotPasswordRequest = {
  email: string;
};
export type UserProfile = {
  id:          number;
  name:        string;
  email:       string;
  role:        UserRole;
  companyName: string;
  companyTaxId: string;
  companyPlan: string;
  createdAt:   string;
  lastLogin:   string | null;
};
export type AuthResponse = {
  accessToken:   string;
  tokenType:     string;
  expiresIn:     number;
  sessionStatus: string;
  user:          UserProfile;
};
export type AiInsight = {
  overheatProbability: number;
  recommendation:      string;
  optimizationMode:    string;
};
export type KpiResponse = {
  energyConsumptionKwh:    number; 
  currentTemperatureCelsius: number;
  carbonEmissionTons:      number;
  powerUsageEffectiveness: number;
  overallStatus:           DatacenterStatus;
  aiInsight:               AiInsight;
  capturedAt:              string;
  _links?:                 Record<string, HalLink>;
};
export type AlertResponse = {
  id:              number;
  title:           string;
  message:         string;
  severity:        AlertSeverity;
  sourceComponent: string;
  datacenterId:    number;
  resolved:        boolean;
  createdAt:       string;
  _links?:         Record<string, HalLink>;
};
export type LocationDto = {
  latitude:  number;
  longitude: number;
};
export type DatacenterResponse = {
  id:                      number;
  name:                    string;
  city:                    string;
  country:                 string;
  location:                LocationDto;
  thermalState:            ThermalState;
  currentTemperatureCelsius: number;
  regionalConsumptionKwh:  number;
  capacityServers:         number;
  _links?:                 Record<string, HalLink>;
};
export type SatelliteResponse = {
  id:                    number;
  name:                  string;
  orbitType:             string;
  altitudeKm:            number;
  currentPosition:       LocationDto;
  speedKmh:              number;
  dataLinkStatus:        DataLinkStatus;
  signalStrengthPercent: number;
  positionCapturedAt:    string;
  _links?:               Record<string, HalLink>;
};
export type PeriodComparison = {
  averagePue:              number;
  averageEnergyKwh:        number;
  carbonEmissionTons:      number;
  coolingEfficiencyPercent: number;
};
export type SustainabilityScoreResponse = {
  esgScore:                  number;
  esgGrade:                  string;
  energySavedKwhAccumulated: number;
  carbonOffsetTons:          number;
  renewableEnergyPercent:    number;
  beforeOrbitX:              PeriodComparison;
  afterOrbitX:               PeriodComparison;
  calculatedAt:              string;
  _links?:                   Record<string, HalLink>;
};
export type ChatMessage = {
  role:    string;  
  content: string;
};
export type ChatRequest = {
  message: string;
  history?: ChatMessage[];
};
export type ChatResponse = {
  response:        string;
  model:           string;
  tokensUsed:      number;
  updatedHistory:  ChatMessage[];
  respondedAt:     string;
  _links?:         Record<string, HalLink>;
};
