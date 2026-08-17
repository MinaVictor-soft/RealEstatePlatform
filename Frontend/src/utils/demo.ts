export const DEMO_CUSTOMER_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_UNIT_ID = '33333333-3333-3333-3333-333333333333';

export const DEMO_CUSTOMERS = [
  { number: '1', id: DEMO_CUSTOMER_ID, label: 'Ahmed Hassan' },
  { number: '2', id: '22222222-2222-2222-2222-222222222222', label: 'Mona Ali' },
] as const;

export const DEMO_UNITS = [
  { number: '1', id: DEMO_UNIT_ID, label: 'PR-101' },
  { number: '2', id: '44444444-4444-4444-4444-444444444444', label: 'PR-102' },
] as const;

export function getDemoCustomerNumber(id: string) {
  return DEMO_CUSTOMERS.find((item) => item.id === id)?.number ?? '';
}

export function getDemoUnitNumber(id: string) {
  return DEMO_UNITS.find((item) => item.id === id)?.number ?? '';
}
