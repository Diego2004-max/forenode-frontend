import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchingService } from '../../services/matching.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height: 100vh; background-color: var(--bg-primary); color: var(--text-main); display: flex; flex-direction: column;">
      <!-- Header Ejecutivo -->
      <header style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="background-color: #4f46e5; color: white; font-weight: bold; padding: 0.5rem 0.75rem; border-radius: 0.75rem; font-size: 1rem;">F</div>
          <div>
            <h1 style="font-size: 1.1rem; font-weight: 800; margin: 0; letter-spacing: -0.025em;">FORENODE AI</h1>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">ENTERPRISE CORE V4.0</p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-muted);">Analista: <strong style="color: var(--text-main);">{{ userName }}</strong></span>
          
          <button (click)="toggleDarkMode()" style="padding: 0.5rem 0.875rem; border-radius: 0.6rem; background-color: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
            <span>{{ isDarkMode ? '🌞 Modo Light' : '🌙 Modo Dark' }}</span>
          </button>

          <button (click)="logout()" style="padding: 0.5rem 0.875rem; border-radius: 0.6rem; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <!-- Layout Principal -->
      <div style="display: flex; flex: 1; flex-direction: row; flex-wrap: wrap;">
        <!-- Sidebar de Control -->
        <aside style="width: 320px; background-color: var(--bg-card); border-right: 1px solid var(--border-color); padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">Zona Cosechera / Nodo</label>
              <select [(ngModel)]="selectedRegion" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-main); font-size: 0.875rem; outline: none;">
                <option *ngFor="let reg of regions" [ngValue]="reg">{{ reg.name }} (Nariño)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">Cadena Agrícola / Producto</label>
              <select [(ngModel)]="selectedProduct" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-main); font-size: 0.875rem; outline: none;">
                <option *ngFor="let prod of products" [ngValue]="prod">{{ prod.name }}</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 2rem;">
            <button (click)="executeEngine()" [disabled]="isLoading" style="width: 100%; padding: 0.875rem; background-color: var(--primary-color); color: white; font-weight: 600; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.25); display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: opacity 0.2s;">
              <span *ngIf="isLoading" style="width: 1rem; height: 1rem; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
              <span>{{ isLoading ? 'Analizando con IA...' : 'Ejecutar Motor de Demanda' }}</span>
            </button>
          </div>
        </aside>

        <!-- Área de Resultados y Análisis -->
        <main style="flex: 1; padding: 2.5rem; box-sizing: border-box; overflow-y: auto;">
          <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            <!-- Banner Superior -->
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; padding: 1.75rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.02em;">Panel de Inteligencia Logística</h2>
                <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">Sincronización en vivo con modelos de Scikit-Learn y Open-Meteo</p>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.35rem 0.85rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; color: #10b981;">
                <span style="width: 8px; height: 8px; background-color: #10b981; border-radius: 50%;"></span>
                <span>Modelo Activo</span>
              </div>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 1rem; color: #ef4444; font-size: 0.875rem; font-weight: 500;">
              {{ errorMessage }}
            </div>

            <!-- Grid de Resultados -->
            <div *ngIf="result" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
              <!-- Clima Real -->
              <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Clima en Vivo (Open-Meteo)</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 1.25rem;">
                  <div>
                    <span style="font-size: 2.25rem; font-weight: 800;">{{ result.forecast_temperature_c }}°C</span>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Temperatura</p>
                  </div>
                  <div>
                    <span style="font-size: 2.25rem; font-weight: 800;">{{ result.forecast_rainfall_mm }}mm</span>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Precipitación</p>
                  </div>
                </div>
              </div>

              <!-- Demanda vs Oferta -->
              <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Proyección Logística (Scikit-Learn)</span>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span style="color: var(--text-muted);">Demanda Proyectada:</span>
                    <span style="font-weight: 700;">{{ result.predicted_demand_kg }} kg</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span style="color: var(--text-muted);">Oferta Disponible:</span>
                    <span style="font-weight: 700;">{{ result.available_supply_kg }} kg</span>
                  </div>
                </div>
              </div>

              <!-- Estado del Mercado -->
              <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Estado del Mercado</span>
                <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
                  <span style="display: inline-block; padding: 0.4rem 0.75rem; border-radius: 0.6rem; font-size: 0.75rem; font-weight: 700; width: fit-content;"
                    [style.background-color]="result.deficit_or_surplus_kg > 150 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'"
                    [style.color]="result.deficit_or_surplus_kg > 150 ? '#d97706' : '#059669'">
                    {{ result.market_status }}
                  </span>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Nivel de Confianza: <strong style="color: var(--text-main);">{{ (result.confidence_score * 100).toFixed(0) }}%</strong></p>
                </div>
              </div>
            </div>

            <!-- Estado Vacío Inicial -->
            <div *ngIf="!result && !isLoading" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; padding: 4rem 2rem; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">📊</div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 0.5rem 0;">Seleccione Nodo y Producto</h3>
              <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">Haga clic en el botón lateral para ejecutar el motor analítico predictivo en tiempo real.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `
})
export class DashboardComponent implements OnInit {
  userName = '';
  isDarkMode = false;
  isLoading = false;
  errorMessage = '';
  result: any = null;

  regions = [
    { name: 'Pasto', lat: 1.2136, lon: -77.2811 },
    { name: 'Ipiales', lat: 0.8248, lon: -77.5843 },
    { name: 'Túquerres', lat: 1.0833, lon: -77.6167 }
  ];

  products = [
    { id: 1, name: 'Café de Altura Arábigo' },
    { id: 2, name: 'Papa Pastusa' },
    { id: 3, name: 'Lulo Andino' },
    { id: 4, name: 'Quinoa Real' }
  ];

  selectedRegion = this.regions[0];
  selectedProduct = this.products[1];

  constructor(private matchingService: MatchingService, private authService: AuthService) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    // Modo Light por defecto absoluto
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  executeEngine() {
    this.isLoading = true;
    this.errorMessage = '';
    const payload = {
      product_id: this.selectedProduct.id,
      product_name: this.selectedProduct.name,
      region_name: this.selectedRegion.name,
      latitude: this.selectedRegion.lat,
      longitude: this.selectedRegion.lon,
      target_date: new Date().toISOString()
    };

    this.matchingService.runEngine(payload).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Error conectando con el motor global.';
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}