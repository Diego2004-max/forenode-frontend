import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CatalogResponse, DemandObservationRequest, InventoryRequest, MatchingRequest, MatchingResponse, TrainingRequest, TrainingResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(private readonly http: HttpClient) {}

  catalog(): Observable<CatalogResponse> {
    return this.http.get<CatalogResponse>(`${environment.apiBaseUrl}/catalog`);
  }

  run(request: MatchingRequest): Observable<MatchingResponse> {
    return this.http.post<MatchingResponse>(`${environment.apiBaseUrl}/matching/engine`, request);
  }

  registerInventory(request: InventoryRequest): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/inventory`, request);
  }

  registerObservation(request: DemandObservationRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiBaseUrl}/demand-observations`, request);
  }

  train(request: TrainingRequest): Observable<TrainingResponse> {
    return this.http.post<TrainingResponse>(`${environment.apiBaseUrl}/models/train`, request);
  }
}

