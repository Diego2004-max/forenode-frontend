import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminUser, DemandObservationRequest, MatchingReadiness, MatchingResponse, ModelSummary, Product, Region, RegionNode, TrainingResponse } from '../../models/api.models';
import { AuthService } from '../../services/auth.service';
import { MatchingService } from '../../services/matching.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', './customer-flow.css']
})
export class DashboardComponent implements OnInit {
  private readonly matching = inject(MatchingService);
  private readonly auth = inject(AuthService);
  readonly regions = signal<Region[]>([]);
  readonly products = signal<Product[]>([]);
  readonly result = signal<MatchingResponse | null>(null);
  readonly readiness = signal<MatchingReadiness | null>(null);
  readonly readinessLoading = signal(false);
  readonly models = signal<ModelSummary[]>([]);
  readonly nodes = signal<RegionNode[]>([]);
  readonly training = signal(false);
  readonly observationSaving = signal(false);
  readonly trainingResult = signal<TrainingResponse | null>(null);
  readonly loading = signal(false);
  readonly inventorySaving = signal(false);
  readonly error = signal('');
  readonly darkMode = signal(localStorage.getItem('forenode.theme') === 'dark');
  readonly inventoryOpen = signal(false);
  userName = this.auth.userName();
  userRole = this.auth.role();
  readonly users = signal<AdminUser[]>([]);
  readonly adminLoading = signal(false);
  readonly adminMessage = signal('');
  activeSection = 'decisions';
  setSection(section: string): void { this.activeSection = section; }
  roleLabel(): string { return this.userRole === 'admin' ? 'Administrador' : this.userRole === 'viewer' ? 'Cliente / productor' : 'Analista regional'; }
  productName(code: string): string { return this.products().find(item => item.code === code)?.name ?? code; }
  regionName(code: string): string { return this.regions().find(item => item.code === code)?.name ?? code; }
  activeNodeCount(): number { return this.nodes().filter(node => node.is_active).length; }
  activeNodeNames(): string { return this.nodes().filter(node => node.is_active).map(node => node.name).join(' · '); }
  loadUsers(): void { this.adminLoading.set(true); this.matching.users().subscribe({ next: users => { this.users.set(users); this.adminLoading.set(false); }, error: err => { this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar usuarios.'); this.adminLoading.set(false); } }); }
  loadModels(): void { this.matching.models().subscribe({ next: models => this.models.set(models), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar los modelos activos.') }); }
  loadNodes(): void { this.matching.nodes().subscribe({ next: nodes => this.nodes.set(nodes), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar los nodos.') }); }
  createNode(): void {
    if (this.newNode.latitude === null || this.newNode.longitude === null) return;
    this.matching.createNode({ ...this.newNode, latitude: this.newNode.latitude, longitude: this.newNode.longitude }).subscribe({ next: node => { this.nodes.update(items => [...items, node]); this.newNode = { code: '', name: '', latitude: null, longitude: null }; this.matching.catalog().subscribe(catalog => this.regions.set(catalog.regions)); }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible crear el nodo.') });
  }
  updateNode(node: RegionNode, isActive = node.is_active): void { this.matching.updateNode(node.id, { name: node.name, latitude: node.latitude, longitude: node.longitude, is_active: isActive }).subscribe({ next: updated => { this.nodes.update(items => items.map(item => item.id === updated.id ? updated : item)); this.matching.catalog().subscribe(catalog => this.regions.set(catalog.regions)); }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible guardar el nodo.') }); }
  createUser(): void { this.adminMessage.set('La persona debe registrarse primero desde la página de acceso. Luego aparecerá aquí para que puedas asignarle un rol.'); this.loadUsers(); }
  changeRole(user: AdminUser, role: AdminUser['role']): void { this.matching.updateRole(user.id, role).subscribe({ next: updated => this.users.update(items => items.map(item => item.id === updated.id ? updated : item)), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible actualizar el rol.') }); }
  saveUser(user: AdminUser): void { this.matching.updateUser(user.id, user.full_name, user.email).subscribe({ next: updated => { this.users.update(items => items.map(item => item.id === updated.id ? updated : item)); this.adminMessage.set('Cuenta actualizada.'); }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible actualizar la cuenta.') }); }
  setUserActive(user: AdminUser, isActive: boolean): void { this.matching.setUserStatus(user.id, isActive).subscribe({ next: updated => this.users.update(items => items.map(item => item.id === updated.id ? updated : item)), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible cambiar el estado de la cuenta.') }); }
  async copyRegistrationLink(): Promise<void> { await navigator.clipboard.writeText(`${location.origin}/register`); this.adminMessage.set('Enlace de registro copiado. Cuando la persona cree y confirme su cuenta, aparecerá en esta lista.'); }
  saveObservation(): void {
    if (this.observedDemand === null || this.observedDemand <= 0 || this.observationSource.trim().length < 3) return;
    const payload: DemandObservationRequest = { product_code: this.selectedProduct, region_code: this.selectedRegion, observed_on: this.observationDate, demand_kg: this.observedDemand, source_reference: this.observationSource.trim() };
    this.observationSaving.set(true); this.adminMessage.set('');
    this.matching.registerObservation(payload).subscribe({ next: () => { this.observationSaving.set(false); this.observedDemand = null; this.observationSource = ''; this.trainingResult.set(null); this.adminMessage.set('Observación registrada. Se requieren al menos 12 registros para entrenar esta combinación.'); }, error: err => { this.observationSaving.set(false); this.adminMessage.set(err.error?.detail ?? 'No fue posible registrar la observación.'); } });
  }
  trainModel(): void { this.training.set(true); this.adminMessage.set(''); this.matching.train({ product_code: this.selectedProduct, region_code: this.selectedRegion }).subscribe({ next: response => { this.trainingResult.set(response); this.training.set(false); this.loadModels(); }, error: err => { this.adminMessage.set(err.error?.detail ?? 'No fue posible entrenar el modelo con estos datos.'); this.training.set(false); } }); }
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
  observationDate = this.dateOffset(-30);
  observedDemand: number | null = null;
  observationSource = '';
  newNode = { code: '', name: '', latitude: null as number | null, longitude: null as number | null };

  ngOnInit(): void {
    document.documentElement.classList.toggle('dark', this.darkMode());
    this.matching.currentUser().subscribe({
      next: profile => { this.userRole = profile.role; this.userName = profile.full_name; if (profile.role === 'admin') this.loadUsers(); if (profile.role === 'admin' || profile.role === 'analyst') { this.loadModels(); this.loadNodes(); } },
      error: () => this.error.set('No se pudo validar el perfil. Recarga la página para volver a intentar.')
    });
    if (this.userRole === 'admin' || this.userRole === 'analyst') this.loadModels();
    this.matching.catalog().subscribe({
      next: (catalog) => {
        this.regions.set(catalog.regions); this.products.set(catalog.products);
        this.selectedRegion = catalog.regions[0]?.code ?? '';
        this.selectedProduct = catalog.products[0]?.code ?? '';
        this.checkReadiness();
      },
      error: () => this.error.set('No fue posible cargar el catálogo operativo.')
    });
  }

  run(): void {
    if (!this.selectedRegion || !this.selectedProduct) return;
    this.result.set(null); this.loading.set(true); this.error.set('');
    this.matching.run({ product_code: this.selectedProduct, region_code: this.selectedRegion, target_date: this.targetDate }).subscribe({
      next: (response) => { this.result.set(response); this.loading.set(false); },
      error: (error: HttpErrorResponse) => { this.error.set(error.status === 409 ? error.error?.detail ?? 'Completa los datos de disponibilidad antes de continuar.' : error.error?.detail ?? 'El motor no pudo completar el análisis.'); this.loading.set(false); }
    });
  }

  scenarioChanged(): void { this.result.set(null); this.error.set(''); }
  checkReadiness(): void {
    this.scenarioChanged();
    if (!this.selectedProduct || !this.selectedRegion) return;
    this.readinessLoading.set(true);
    this.matching.readiness(this.selectedProduct, this.selectedRegion).subscribe({
      next: state => { this.readiness.set(state); this.readinessLoading.set(false); },
      error: () => { this.readiness.set(null); this.readinessLoading.set(false); }
    });
  }

  openDataStep(): void { this.result.set(null); this.error.set(''); this.inventoryOpen.set(true); }

  saveInventory(): void {
    if (this.inventoryQuantity === null || this.inventoryQuantity <= 0 || this.inventorySource.trim().length < 3) return;
    this.inventorySaving.set(true); this.error.set('');
    this.matching.registerInventory({
      product_code: this.selectedProduct,
      region_code: this.selectedRegion,
      quantity_kg: this.inventoryQuantity,
      recorded_at: new Date().toISOString(),
      source_reference: this.inventorySource.trim()
    }).subscribe({
      next: () => { this.inventorySaving.set(false); this.inventoryOpen.set(false); this.inventoryQuantity = null; this.inventorySource = ''; this.checkReadiness(); },
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

