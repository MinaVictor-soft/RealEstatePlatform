export type InstallmentType = 'Equal';
export type PaymentFrequency = 'Monthly' | 'Quarterly' | 'Yearly';
export type ContractStatus = 'Draft' | 'Active' | 'Completed';
export type InstallmentStatus = 'Pending' | 'PartiallyPaid' | 'Paid';

export interface CreateContractRequest {
  customerId: string;
  unitId: string;
  contractDate: string;
  contractValue: number;
  downPaymentPercentage?: number | null;
  downPaymentAmount?: number | null;
  installmentType: InstallmentType;
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  firstInstallmentDate: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentDate?: string | null;
  reference?: string | null;
}

export interface ContractResponse {
  id: string;
  customerId: string;
  customerName: string;
  unitId: string;
  unitCode: string;
  projectName: string;
  contractDate: string;
  contractValue: number;
  downPaymentPercentage: number | null;
  downPaymentAmount: number | null;
  calculatedDownPaymentAmount: number;
  installmentType: InstallmentType;
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  firstInstallmentDate: string;
  status: ContractStatus;
  totalPaid: number;
  outstanding: number;
  collectionPercentage: number;
}

export interface InstallmentResponse {
  id: string;
  sequenceNumber: number;
  dueDate: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InstallmentStatus;
}

export interface ForecastResponse {
  months: number;
  contractValue: number;
  currentPaid: number;
  expectedCollection: number;
  projectedCollected: number;
  outstanding: number;
  projectedCollectionPercentage: number;
}

export interface ContractForecastResponse {
  contract: ContractResponse;
  forecast: ForecastResponse;
}

export interface ContractsDashboardResponse {
  months: number;
  totalContracts: number;
  totalContractValue: number;
  totalPaid: number;
  totalOutstanding: number;
  expectedCollection: number;
  projectedCollected: number;
  projectedCollectionPercentage: number;
  contracts: ContractForecastResponse[];
}

export interface ValidationProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
