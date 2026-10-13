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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="bg-indigo-600 text-white font-bold p-2 rounded-lg">F</div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">FORENODE AI</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">ENTERPRISE CORE V4.0</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Hola, {{ userName }}</span>
          <button (click)="toggleDarkMode()" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <span *ngIf="isDarkMode">🌞 Modo Light</span>
            <span *ngIf="!isDarkMode">🌙 Modo Dark</span>
          </button>
          <button (click)="logout()" class="px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 transition">Cerrar Sesión</button>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="flex-1 flex flex-col md:flex-row">
        <!-- Sidebar -->
        <aside class="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div class="space-y-6">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Zona Cosechera / Nodo Regional</label>
              <select [(ngModel)]="selectedRegion" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                <option *ngFor="let reg of regions" [ngValue]="reg">{{ reg.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Cadena Agrícola / Producto</label>
              <select [(ngModel)]="selectedProduct" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                <option *ngFor="let prod of products" [ngValue]="prod">{{ prod.name }}</option>
              </select>
            </div>
          </div>

          <div class="mt-8">
            <button (click)="executeEngine()" [disabled]="isLoading" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all flex justify-center items-center space-x-2 disabled:opacity-50">
              <span *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              <span>{{ isLoading ? 'Procesando IA...' : 'Ejecutar Motor de Demanda' }}</span>
            </button>
          </div>
        </aside>

        <!-- Content Area -->
        <main class="flex-1 p-6 md:p-10 overflow-y-auto">
          <div class="max-w-5xl mx-auto space-y-6">
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold tracking-tight">Panel de Inteligencia Logística y Oferta-Demanda</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Análisis predictivo en tiempo real con Scikit-Learn y Open-Meteo</p>
              </div>
              <div class="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Modelo Activo</span>
              </div>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm font-medium">
              {{ errorMessage }}
            </div>

            <!-- Results Grid -->
            <div *ngIf="result" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Clima en Vivo</p>
                <div class="mt-4 flex justify-between items-baseline">
                  <div>
                    <span class="text-3xl font-extrabold">{{ result.forecast_temperature_c }}°C</span>
                    <p class="text-xs text-slate-500 mt-1">Temperatura</p>
                  </div>
                  <div>
                    <span class="text-3xl font-extrabold">{{ result.forecast_rainfall_mm }}mm</span>
                    <p class="text-xs text-slate-500 mt-1">Precipitación</p>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Proyección de Demanda vs Oferta</p>
                <div class="mt-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Demanda IA:</span>
                    <span class="font-bold">{{ result.predicted_demand_kg }} kg</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Oferta Cooperativa:</span>
                    <span class="font-bold">{{ result.available_supply_kg }} kg</span>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estado del Mercado</p>
                <div class="mt-4">
                  <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold" [ngClass]="{
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300': result.deficit_or_surplus_kg > 150,
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': result.deficit_or_surplus_kg <= 150
                  }">{{ result.market_status }}</span>
                  <p class="text-xs text-slate-500 mt-3">Confianza del Modelo: <strong>{{ (result.confidence_score * 100).toFixed(0) }}%</strong></p>
                </div>
              </div>
            </div>

            <!-- Placeholder State -->
            <div *ngIf="!result && !isLoading" class="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="mx-auto h-12 w-12 text-slate-400 mb-4 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">📊</div>
              <h3 class="text-lg font-medium">Seleccione una Zona y Producto</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Haga clic en "Ejecutar Motor de Demanda" para calcular los resultados en tiempo real.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
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
    // Light por defecto
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