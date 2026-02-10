
export enum Theme {
  CLASSIC = 'classic',
  PASTEL = 'pastel'
}

export enum BudgetStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SaleStatus {
  PAID = 'PAID',
  PENDING = 'PENDING'
}

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD'
}

export enum UnitType {
  UNIT = 'unidade',
  PACKAGE = 'pacote',
  KIT = 'kit',
  KG = 'quilo',
  GRAM = 'grama',
  METER = 'metro',
  ML = 'mililitro'
}

export enum MaterialCategory {
  PAPER = 'papel',
  INK = 'tinta',
  FINISH = 'acabamento',
  PACKAGING = 'embalagem',
  OTHERS = 'outros'
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: UnitType;
  quantityPerPackage: number;
  totalValue: number;
  costPerUnit: number; // calculado (ex: valor do pacote / quantidade)
}

export interface PricingDetail {
  id: string;
  productId: string;
  materials: { materialId: string; quantityUsed: number; cost: number }[];
  inkCostType: 'fixed' | 'perMl';
  inkFixedCost: number; // custo por folha
  inkSheetsUsed: number; // quantidade de folhas impressas
  inkMlCost: number;
  inkMlUsed: number;
  laborHourlyRate: number;
  laborMinutesUsed: number;
  // Novos campos para simplificar o cálculo do usuário
  laborDesiredSalary: number;
  laborMonthlyHours: number;
  // Novos campos para custos fixos precisos
  fixedRent: number;
  fixedWater: number;
  fixedElectricity: number;
  fixedInternet: number;
  fixedMaintenance: number; // Manutenção de máquinas
  fixedGasoline: number;    // Gasolina/Transporte
  fixedOtherOverhead: number; // Outros custos
  monthlyProductionCapacity: number; // Para rateio
  extraCosts: { description: string; value: number }[];
  profitType: 'percentage' | 'fixed';
  profitMargin: number; // percentage ou valor fixo
  totalCost: number;
  suggestedPrice: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  type: 'físico' | 'digital';
  calculatedCost: number;
  suggestedPrice: number;
  stock: number;
  minStock: number;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  email: string;
  notes: string;
}

export interface BudgetItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  items: BudgetItem[];
  totalValue: number;
  status: BudgetStatus;
  date: string;
  internalNotes: string;
}

export interface Sale {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  budgetId?: string;
  items: BudgetItem[];
  totalValue: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  date: string;
  pixCode?: string;
}

export interface StoreSettings {
  storeName: string;
  systemName: string;
  document: string;
  phone: string;
  email: string;
  logoUrl: string;
  pixKey: string;
  theme: Theme;
}

/**
 * Interface de Usuário para compatibilidade com Firebase Auth no frontend.
 */
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
