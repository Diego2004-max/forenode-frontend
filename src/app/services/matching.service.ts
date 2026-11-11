import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AdminUser, AdminUserCreate, CatalogResponse, DemandObservationRequest, InventoryRequest, InventoryResponse, MatchingReadiness, MatchingRequest, MatchingResponse, ModelSummary, ObservationCoverage, RegionNode, RegionNodeCreate, RegionNodeUpdate, ScenarioAvailability, TrainingRequest, TrainingResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(private readonly http: HttpClient) {}

  catalog(): Observable<CatalogResponse> {
    return this.http.get<CatalogResponse>(`${environment.apiBaseUrl}/catalog`);
  }

  run(request: MatchingRequest): Observable<MatchingResponse> {
    return this.http.post<MatchingResponse>(`${environment.apiBaseUrl}/matching/engine`, request);
  }

  readiness(productCode: string, regionCode: string): Observable<MatchingReadiness> {
    const params = { product_code: productCode, region_code: regionCode };
    return this.http.get<MatchingReadiness>(`${environment.apiBaseUrl}/matching/readiness`, { params });
  }
  availability(): Observable<ScenarioAvailability[]> { return this.http.get<ScenarioAvailability[]>(`${environment.apiBaseUrl}/matching/availability`); }

  registerInventory(request: InventoryRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`${environment.apiBaseUrl}/inventory`, request);
  }

  registerObservation(request: DemandObservationRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiBaseUrl}/demand-observations`, request);
  }

  train(request: TrainingRequest): Observable<TrainingResponse> {
    return this.http.post<TrainingResponse>(`${environment.apiBaseUrl}/models/train`, request);
  }
  models(): Observable<ModelSummary[]> { return this.http.get<ModelSummary[]>(`${environment.apiBaseUrl}/models`); }
  coverage(productCode: string, regionCode: string): Observable<ObservationCoverage> { return this.http.get<ObservationCoverage>(`${environment.apiBaseUrl}/models/coverage`, { params: { product_code: productCode, region_code: regionCode } }); }
  nodes(): Observable<RegionNode[]> { return this.http.get<RegionNode[]>(`${environment.apiBaseUrl}/admin/nodes`); }
  createNode(data: RegionNodeCreate): Observable<RegionNode> { return this.http.post<RegionNode>(`${environment.apiBaseUrl}/admin/nodes`, data); }
  updateNode(id: number, data: RegionNodeUpdate): Observable<RegionNode> { return this.http.patch<RegionNode>(`${environment.apiBaseUrl}/admin/nodes/${id}`, data); }

  users(): Observable<AdminUser[]> { return this.http.get<AdminUser[]>(`${environment.apiBaseUrl}/admin/users`); }
  currentUser(): Observable<AdminUser> { return this.http.get<AdminUser>(`${environment.apiBaseUrl}/auth/me`); }
  createUser(request: AdminUserCreate): Observable<AdminUser> { return this.http.post<AdminUser>(`${environment.apiBaseUrl}/admin/users`, request); }
  updateRole(id: number, role: AdminUser['role']): Observable<AdminUser> { return this.http.patch<AdminUser>(`${environment.apiBaseUrl}/admin/users/${id}/role`, { role }); }
  updateUser(id: number, fullName: string, email: string): Observable<AdminUser> { return this.http.patch<AdminUser>(`${environment.apiBaseUrl}/admin/users/${id}`, { full_name: fullName, email }); }
  setUserStatus(id: number, isActive: boolean): Observable<AdminUser> { return this.http.patch<AdminUser>(`${environment.apiBaseUrl}/admin/users/${id}/status`, { is_active: isActive }); }
  removeUserAccess(id: number): Observable<void> { return this.http.delete<void>(`${environment.apiBaseUrl}/admin/users/${id}`); }
}

