import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminUser, MatchingResponse, Product, Region } from '../../models/api.models';
import { AuthService } from '../../services/auth.service';
import { MatchingService } from '../../services/matching.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly matching = inject(MatchingService);
  private readonly auth = inject(AuthService);
  readonly regions = signal<Region[]>([]);
  readonly products = signal<Product[]>([]);
  readonly result = signal<MatchingResponse | null>(null);
  readonly loading = signal(false);
  readonly inventorySaving = signal(false);
  readonly error = signal('');
  readonly darkMode = signal(localStorage.getItem('forenode.theme') === 'dark');
  readonly inventoryOpen = signal(false);
  readonly userName = this.auth.userName();
  readonly userRole = this.auth.role();
  readonly users = signal<AdminUser[]>([]);
  readonly adminLoading = signal(false);
  readonly adminMessage = signal('');
  newUser = { full_name: '', email: '', password: '', role: 'viewer' as AdminUser['role'] };
  activeSection = 'decisions';
  setSection(section: string): void { this.activeSection = section; }
  roleLabel(): string { return this.userRole === 'admin' ? 'Administrador' : this.userRole === 'viewer' ? 'Cliente / productor' : 'Analista regional'; }
  loadUsers(): void { this.adminLoading.set(true); this.matching.users().subscribe({ next: users => { this.users.set(users); this.adminLoading.set(false); }, error: err => { this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar usuarios.'); this.adminLoading.set(false); } }); }
  createUser(): void { this.adminMessage.set(''); this.matching.createUser(this.newUser).subscribe({ next: user => { this.users.update(items => [...items, user]); this.newUser = { full_name: '', email: '', password: '', role: 'viewer' }; }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible crear el usuario.') }); }
  changeRole(user: AdminUser, role: AdminUser['role']): void { this.matching.updateRole(user.id, role).subscribe({ next: updated => this.users.update(items => items.map(item => item.id === updated.id ? updated : item)), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible actualizar el rol.') }); }
  readonly today = this.dateOffset(0);
  readonly maxDate = this.dateOffset(16);
  readonly statusLabel = computed(() => ({
    critical_deficit: 'Déficit crítico', high_surplus: 'Superávit alto', balanced: 'Balance operativo'
  }[this.result()?.market_status ?? 'balanced']));

  selectedRegion = '';
  selectedProduct = '';
  targetDate = this.today;
  inventoryQuantity: number | null = null;
  inventorySource = '';

  ngOnInit(): void {
    document.documentElement.classList.toggle('dark', this.darkMode());
    this.matching.catalog().subscribe({
      next: (catalog) => {
        this.regions.set(catalog.regions); this.products.set(catalog.products);
        this.selectedRegion = catalog.regions[0]?.code ?? '';
        this.selectedProduct = catalog.products[0]?.code ?? '';
      },
      error: () => this.error.set('No fue posible cargar el catálogo operativo.')
    });
  }

  run(): void {
    if (!this.selectedRegion || !this.selectedProduct) return;
    this.loading.set(true); this.error.set('');
    this.matching.run({ product_code: this.selectedProduct, region_code: this.selectedRegion, target_date: this.targetDate }).subscribe({
      next: (response) => { this.result.set(response); this.loading.set(false); },
      error: (error: HttpErrorResponse) => { this.error.set(error.error?.detail ?? 'El motor no pudo completar el análisis.'); this.loading.set(false); }
    });
  }

  saveInventory(): void {
    if (this.inventoryQuantity === null || this.inventoryQuantity < 0 || this.inventorySource.trim().length < 3) return;
    this.inventorySaving.set(true); this.error.set('');
    this.matching.registerInventory({
      product_code: this.selectedProduct,
      region_code: this.selectedRegion,
      quantity_kg: this.inventoryQuantity,
      recorded_at: new Date().toISOString(),
      source_reference: this.inventorySource.trim()
    }).subscribe({
      next: () => { this.inventorySaving.set(false); this.inventoryOpen.set(false); this.run(); },
      error: (error: HttpErrorResponse) => { this.error.set(error.error?.detail ?? 'No fue posible registrar el inventario.'); this.inventorySaving.set(false); }
    });
  }

  toggleTheme(): void {
    this.darkMode.update((value) => !value);
    document.documentElement.classList.toggle('dark', this.darkMode());
    localStorage.setItem('forenode.theme', this.darkMode() ? 'dark' : 'light');
  }

  logout(): void { this.auth.logout(); }
  absolute(value: number): number { return Math.abs(value); }
  private dateOffset(days: number): string { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
}

