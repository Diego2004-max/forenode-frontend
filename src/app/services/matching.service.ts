import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private readonly API_URL = 'https://forenode-backend.onrender.com/api/v1/matching/engine';

  constructor(private http: HttpClient) {}

  runEngine(payload: any): Observable<any> {
    return this.http.post<any>(this.API_URL, payload);
  }
}