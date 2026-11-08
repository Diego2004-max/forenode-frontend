export interface SessionResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  full_name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
}

export interface Region {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Product {
  code: string;
  name: string;
}

export interface CatalogResponse {
  regions: Region[];
  products: Product[];
}

export interface MatchingRequest {
  product_code: string;
  region_code: string;
  target_date: string;
}

export interface MatchingResponse {
  run_id: number;
  product_code: string;
  product_name: string;
  region_code: string;
  region_name: string;
  target_date: string;
  weather: {
    temperature_c: number;
    precipitation_mm: number;
    observed_or_forecast: 'observed' | 'forecast';
    source: string;
  };
  predicted_demand_kg: number;
  demand_lower_kg: number;
  demand_upper_kg: number;
  available_supply_kg: number;
  inventory_recorded_at: string;
  inventory_source: string;
  gap_kg: number;
  market_status: 'critical_deficit' | 'high_surplus' | 'balanced';
  confidence_score: number;
  model_version: string;
  model_mae_kg: number;
  explanation: string;
}

export interface InventoryRequest {
  product_code: string;
  region_code: string;
  quantity_kg: number;
  recorded_at: string;
  source_reference: string;
}

export interface DemandObservationRequest {
  product_code: string;
  region_code: string;
  observed_on: string;
  demand_kg: number;
  source_reference: string;
}

export interface TrainingRequest {
  product_code: string;
  region_code: string;
}

export interface TrainingResponse {
  version: string;
  product_code: string;
  region_code: string;
  training_rows: number;
  mae_kg: number;
  r2_score: number;
  residual_p90_kg: number;
}

export interface AdminUser { id: number; email: string; full_name: string; role: 'viewer' | 'analyst' | 'admin'; }
export interface AdminUserCreate { email: string; password: string; full_name: string; role: 'viewer' | 'analyst' | 'admin'; }

