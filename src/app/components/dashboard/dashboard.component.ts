import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminUser, DemandObservationRequest, MatchingReadiness, MatchingResponse, ModelSummary, ObservationCoverage, Product, Region, RegionNode, ScenarioAvailability, TrainingResponse } from '../../models/api.models';
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
  readonly availability = signal<ScenarioAvailability[]>([]);
  readonly readinessLoading = signal(false);
  readonly models = signal<ModelSummary[]>([]);
  readonly nodes = signal<RegionNode[]>([]);
  readonly training = signal(false);
  readonly observationSaving = signal(false);
  readonly trainingResult = signal<TrainingResponse | null>(null);
  readonly coverage = signal<ObservationCoverage | null>(null);
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
  readonly userManagementMessage = signal('');
  activeSection = 'decisions';
  setSection(section: string): void { this.activeSection = section; }
  roleLabel(): string { return this.userRole === 'admin' ? 'Administrador' : this.userRole === 'viewer' ? 'Cliente / productor' : 'Analista regional'; }
  productName(code: string): string { return this.products().find(item => item.code === code)?.name ?? code; }
  regionName(code: string): string { return this.regions().find(item => item.code === code)?.name ?? code; }
  activeNodeCount(): number { return this.nodes().filter(node => node.is_active).length; }
  activeNodeNames(): string { return this.nodes().filter(node => node.is_active).map(node => node.name).join(' · '); }
  availableRegions(): Region[] { return this.regions().filter(region => this.availability().some(item => item.region_code === region.code && item.available)); }
  availableProducts(regionCode: string): Product[] { const codes = new Set(this.availability().filter(item => item.region_code === regionCode && item.available).map(item => item.product_code)); return this.products().filter(product => codes.has(product.code)); }
  regionHasAvailableScenario(regionCode: string): boolean { return this.availability().some(item => item.region_code === regionCode && item.available); }
  isScenarioAvailable(regionCode: string, productCode: string): boolean { return this.availability().some(item => item.region_code === regionCode && item.product_code === productCode && item.available); }
  chooseRegion(region: Region): void { this.selectedRegion = region.code; const products = this.availableProducts(region.code); if (products.length && !products.some(product => product.code === this.selectedProduct)) this.selectedProduct = products[0].code; this.checkReadiness(); }
  chooseScenario(region: Region, product: Product): void { this.selectedRegion = region.code; this.selectedProduct = product.code; this.checkReadiness(); this.setSection('decisions'); }
  loadAvailability(): void { this.matching.availability().subscribe({ next: rows => { this.availability.set(rows); const first = rows.find(row => row.available); if (this.userRole === 'viewer' && first) { this.selectedRegion = first.region_code; this.selectedProduct = first.product_code; } this.checkReadiness(); }, error: () => this.availability.set([]) }); }
  loadUsers(): void { this.adminLoading.set(true); this.userManagementMessage.set(''); this.matching.users().subscribe({ next: users => { this.users.set(users); this.adminLoading.set(false); }, error: err => { this.userManagementMessage.set(err.error?.detail ?? 'No fue posible cargar usuarios.'); this.adminLoading.set(false); } }); }
  loadModels(): void { this.matching.models().subscribe({ next: models => this.models.set(models), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar los modelos activos.') }); }
  loadCoverage(): void { this.matching.coverage(this.selectedProduct, this.selectedRegion).subscribe({ next: result => this.coverage.set(result), error: () => this.coverage.set(null) }); }
  loadNodes(): void { this.matching.nodes().subscribe({ next: nodes => this.nodes.set(nodes), error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible cargar los nodos.') }); }
  createNode(): void {
    if (this.newNode.latitude === null || this.newNode.longitude === null) return;
    this.matching.createNode({ ...this.newNode, latitude: this.newNode.latitude, longitude: this.newNode.longitude }).subscribe({ next: node => { this.nodes.update(items => [...items, node]); this.newNode = { code: '', name: '', latitude: null, longitude: null }; this.matching.catalog().subscribe(catalog => this.regions.set(catalog.regions)); }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible crear el nodo.') });
  }
  updateNode(node: RegionNode, isActive = node.is_active): void { this.matching.updateNode(node.id, { name: node.name, latitude: node.latitude, longitude: node.longitude, is_active: isActive }).subscribe({ next: updated => { this.nodes.update(items => items.map(item => item.id === updated.id ? updated : item)); this.matching.catalog().subscribe(catalog => this.regions.set(catalog.regions)); }, error: err => this.adminMessage.set(err.error?.detail ?? 'No fue posible guardar el nodo.') }); }
  createUser(): void { this.userManagementMessage.set('La persona debe registrarse primero desde la página de acceso. Luego aparecerá aquí para que puedas asignarle un rol.'); this.loadUsers(); }
  changeRole(user: AdminUser, role: AdminUser['role']): void { this.matching.updateRole(user.id, role).subscribe({ next: updated => { this.users.update(items => items.map(item => item.id === updated.id ? updated : item)); this.userManagementMessage.set('Rol actualizado.'); }, error: err => this.userManagementMessage.set(err.error?.detail ?? 'No fue posible actualizar el rol.') }); }
  saveUser(user: AdminUser): void { this.matching.updateUser(user.id, user.full_name, user.email).subscribe({ next: updated => { this.users.update(items => items.map(item => item.id === updated.id ? updated : item)); this.userManagementMessage.set('Cuenta actualizada.'); }, error: err => this.userManagementMessage.set(err.error?.detail ?? 'No fue posible actualizar la cuenta.') }); }
  setUserActive(user: AdminUser, isActive: boolean): void { this.matching.setUserStatus(user.id, isActive).subscribe({ next: updated => { this.users.update(items => items.map(item => item.id === updated.id ? updated : item)); this.userManagementMessage.set(isActive ? 'Cuenta reactivada.' : 'Cuenta desactivada.'); }, error: err => this.userManagementMessage.set(err.error?.detail ?? 'No fue posible cambiar el estado de la cuenta.') }); }
  removeUserAccess(user: AdminUser): void {
    if (!confirm(`¿Eliminar el acceso de ${user.full_name}? La información histórica se conserva.`)) return;
    this.matching.removeUserAccess(user.id).subscribe({ next: () => { this.users.update(items => items.map(item => item.id === user.id ? { ...item, is_active: false } : item)); this.userManagementMessage.set('Acceso eliminado. La cuenta quedó desactivada.'); }, error: err => this.userManagementMessage.set(err.error?.detail ?? 'No fue posible eliminar el acceso.') });
  }
  async copyRegistrationLink(): Promise<void> { await navigator.clipboard.writeText(`${location.origin}/register`); this.userManagementMessage.set('Enlace de registro copiado. Cuando la persona cree su cuenta, aparecerá en esta lista.'); }
  saveObservation(): void {
    if (this.observedDemand === null || this.observedDemand <= 0 || this.observationSource.trim().length < 3) return;
    const payload: DemandObservationRequest = { product_code: this.selectedProduct, region_code: this.selectedRegion, observed_on: this.observationDate, demand_kg: this.observedDemand, source_reference: this.observationSource.trim() };
    this.observationSaving.set(true); this.adminMessage.set('');
    this.matching.registerObservation(payload).subscribe({ next: () => { this.observationSaving.set(false); this.observedDemand = null; this.observationSource = ''; this.trainingResult.set(null); this.loadCoverage(); this.adminMessage.set('Observación registrada.'); }, error: err => { this.observationSaving.set(false); this.adminMessage.set(err.error?.detail ?? 'No fue posible registrar la observación.'); } });
  }
  canTrain(): boolean { const data = this.coverage(); return !!data && data.valid_observations >= data.minimum_required; }
  remainingObservations(): number { const data = this.coverage(); return data ? Math.max(0, data.minimum_required - data.valid_observations) : 0; }
  trainModel(): void {
    if (!this.canTrain()) {
      this.adminMessage.set(`Faltan ${this.remainingObservations()} observaciones válidas para entrenar esta combinación.`);
      return;
    }
    this.training.set(true); this.adminMessage.set(''); this.matching.train({ product_code: this.selectedProduct, region_code: this.selectedRegion }).subscribe({ next: response => { this.trainingResult.set(response); this.training.set(false); this.loadModels(); this.loadAvailability(); }, error: err => { this.adminMessage.set(err.error?.detail ?? 'No fue posible entrenar el modelo con estos datos.'); this.training.set(false); } });
  }
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
  selectedInventoryId: number | null = null;
  selectedInventoryLabel = '';
  observationDate = this.dateOffset(-30);
  observedDemand: number | null = null;
  observationSource = '';
  newNode = { code: '', name: '', latitude: null as number | null, longitude: null as number | null };

  ngOnInit(): void {
    document.documentElement.classList.toggle('dark', this.darkMode());
    this.matching.currentUser().subscribe({
      next: profile => { this.userRole = profile.role; this.userName = profile.full_name; if (profile.role === 'admin') this.loadUsers(); if (profile.role === 'admin' || profile.role === 'analyst') { this.loadModels(); this.loadNodes(); } else this.loadAvailability(); },
      error: () => this.error.set('No se pudo validar el perfil. Recarga la página para volver a intentar.')
    });
    if (this.userRole === 'admin' || this.userRole === 'analyst') this.loadModels();
    this.matching.catalog().subscribe({
      next: (catalog) => {
        this.regions.set(catalog.regions); this.products.set(catalog.products);
        this.selectedRegion = catalog.regions[0]?.code ?? '';
        this.selectedProduct = catalog.products[0]?.code ?? '';
        const firstAvailable = this.availability().find(row => row.available);
        if (this.userRole === 'viewer' && firstAvailable) { this.selectedRegion = firstAvailable.region_code; this.selectedProduct = firstAvailable.product_code; }
        this.checkReadiness();
      },
      error: () => this.error.set('No fue posible cargar el catálogo operativo.')
    });
  }

  run(): void {
    if (!this.selectedRegion || !this.selectedProduct || this.selectedInventoryId === null) {
      this.error.set('Registra una oferta con cantidad y referencia antes de ejecutar el motor.');
      return;
    }
    if (!this.readiness()?.can_run) {
      this.error.set('Esta combinación necesita un modelo entrenado y una oferta vigente antes de ejecutar el análisis.');
      return;
    }
    this.result.set(null); this.loading.set(true); this.error.set('');
    this.matching.run({ product_code: this.selectedProduct, region_code: this.selectedRegion, target_date: this.targetDate, inventory_snapshot_id: this.selectedInventoryId }).subscribe({
      next: (response) => { this.result.set(response); this.loading.set(false); },
      error: (error: HttpErrorResponse) => { this.error.set(error.status === 409 ? error.error?.detail ?? 'Completa los datos de disponibilidad antes de continuar.' : error.error?.detail ?? 'El motor no pudo completar el análisis.'); this.loading.set(false); }
    });
  }

  scenarioChanged(): void { this.result.set(null); this.error.set(''); this.selectedInventoryId = null; this.selectedInventoryLabel = ''; }
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
      next: record => { this.inventorySaving.set(false); this.inventoryOpen.set(false); this.selectedInventoryId = record.id; this.selectedInventoryLabel = `${record.quantity_kg.toLocaleString('es-CO')} kg · ${record.source_reference}`; this.inventoryQuantity = null; this.inventorySource = ''; this.error.set(''); this.checkReadiness(); },
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

