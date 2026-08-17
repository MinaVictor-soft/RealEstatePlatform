import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createContract } from '../api/contractsApi';
import { ApiError } from '../api/client';
import { ErrorState, SuccessState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';
import { DEMO_CUSTOMERS, DEMO_UNITS } from '../utils/demo';

type PaymentMode = 'percentage' | 'amount';
type InstallmentType = 'Equal';
type PaymentFrequency = 'Monthly' | 'Quarterly' | 'Yearly';
type FieldErrors = Partial<Record<'customerId' | 'unitId' | 'contractDate' | 'contractValue' | 'downPayment' | 'numberOfInstallments' | 'firstInstallmentDate', string>>;

const today = new Date().toISOString().slice(0, 10);

export function CreateContractPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('percentage');
  const [customerId, setCustomerId] = useState<string>(DEMO_CUSTOMERS[0].id);
  const [unitId, setUnitId] = useState<string>(DEMO_UNITS[0].id);
  const [contractDate, setContractDate] = useState(today);
  const [contractValue, setContractValue] = useState('3600000');
  const [installmentType, setInstallmentType] = useState<InstallmentType>('Equal');
  const [frequency, setFrequency] = useState<PaymentFrequency>('Monthly');
  const [downPaymentPercentage, setDownPaymentPercentage] = useState('0');
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState('24');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState('2026-09-01');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    const value = Number(contractValue);
    const installments = Number(numberOfInstallments);
    const percentageValue = paymentMode === 'percentage' ? Number(downPaymentPercentage) : null;
    const amountValue = paymentMode === 'amount' ? Number(downPaymentAmount) : null;

    if (!customerId || !unitId || !contractDate || !contractValue || !numberOfInstallments || !firstInstallmentDate) {
      setError(t('required'));
      return;
    }

    if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(installments) || installments <= 0) {
      setError(t('invalidNumber'));
      return;
    }

    if (paymentMode === 'percentage' && (!Number.isFinite(percentageValue ?? NaN) || (percentageValue ?? 0) < 0 || (percentageValue ?? 0) > 100)) {
      setError(t('invalidNumber'));
      return;
    }

    if (paymentMode === 'amount' && (!Number.isFinite(amountValue ?? NaN) || (amountValue ?? 0) < 0)) {
      setError(t('invalidNumber'));
      return;
    }

    setSubmitting(true);
    try {
      const contract = await createContract({
        customerId,
        unitId,
        contractDate,
        contractValue: value,
        downPaymentPercentage: paymentMode === 'percentage' ? percentageValue : null,
        downPaymentAmount: paymentMode === 'amount' ? amountValue : null,
        installmentType,
        frequency,
        numberOfInstallments: installments,
        firstInstallmentDate,
      });
      setSuccess(t('contractCreated'));
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(mapBackendErrors(err.errors));
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : t('error'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function mapBackendErrors(errors: Record<string, string[]>) {
    const next: FieldErrors = {};
    for (const [key, value] of Object.entries(errors)) {
      const message = value[0];
      switch (key) {
        case 'CustomerId':
          next.customerId = message;
          break;
        case 'UnitId':
          next.unitId = message;
          break;
        case 'ContractDate':
          next.contractDate = message;
          break;
        case 'ContractValue':
          next.contractValue = message;
          break;
        case 'DownPayment':
        case 'DownPaymentPercentage':
        case 'DownPaymentAmount':
          next.downPayment = message;
          break;
        case 'NumberOfInstallments':
          next.numberOfInstallments = message;
          break;
        case 'FirstInstallmentDate':
          next.firstInstallmentDate = message;
          break;
        default:
          setError(message ?? t('error'));
          break;
      }
    }
    return next;
  }

  return (
    <section className="panel">
      <div className="page-hero">
        <div className="page-title">
          <div className="page-kicker">{t('createContract')}</div>
          <h1>{t('createContractAction')}</h1>
          <div className="muted">{t('demoHint')}</div>
        </div>
        <div className="page-meta">
          <span className="pill neutral">{t('customerSection')}</span>
          <span className="pill neutral">{t('unitSection')}</span>
          <span className="pill neutral">{t('financialSection')}</span>
        </div>
      </div>
      {error ? <ErrorState message={error} /> : null}
      {success ? <SuccessState message={success} /> : null}
      <div className="create-contract-layout">
        <form className="form-grid" onSubmit={handleSubmit}>
          <section className="subpanel">
            <h2>{t('customerSection')}</h2>
            <label>
              <span>{t('customerNumber')}<span className="required-mark">*</span></span>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} aria-invalid={Boolean(fieldErrors.customerId)}>
                {DEMO_CUSTOMERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.number} - {item.label}
                  </option>
                ))}
              </select>
            </label>
            {fieldErrors.customerId ? <small className="field-error">{fieldErrors.customerId}</small> : null}
          </section>

          <section className="subpanel">
            <h2>{t('unitSection')}</h2>
            <label>
              <span>{t('unitNumber')}<span className="required-mark">*</span></span>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)} aria-invalid={Boolean(fieldErrors.unitId)}>
                {DEMO_UNITS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.number} - {item.label}
                  </option>
                ))}
              </select>
            </label>
            {fieldErrors.unitId ? <small className="field-error">{fieldErrors.unitId}</small> : null}
          </section>

          <section className="subpanel">
            <h2>{t('contractSection')}</h2>
            <label>
              <span>{t('contractValue')}<span className="required-mark">*</span></span>
              <input type="number" min="0" step="0.01" value={contractValue} onChange={(e) => setContractValue(e.target.value)} aria-invalid={Boolean(fieldErrors.contractValue)} />
            </label>
            {fieldErrors.contractValue ? <small className="field-error">{fieldErrors.contractValue}</small> : null}

            <label>
              <span>{t('installmentType')}</span>
              <select value={installmentType} onChange={(e) => setInstallmentType(e.target.value as InstallmentType)}>
                <option value="Equal">{t('equal')}</option>
              </select>
            </label>

            <label>
              <span>{t('frequency')}</span>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}>
                <option value="Monthly">{t('monthly')}</option>
                <option value="Quarterly">{t('quarterly')}</option>
                <option value="Yearly">{t('yearly')}</option>
              </select>
            </label>
          </section>

          <section className="subpanel">
            <h2>{t('datesSection')}</h2>
            <label>
              <span>{t('contractDate')}<span className="required-mark">*</span></span>
              <input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} aria-invalid={Boolean(fieldErrors.contractDate)} />
            </label>
            {fieldErrors.contractDate ? <small className="field-error">{fieldErrors.contractDate}</small> : null}
            <label>
              <span>{t('firstInstallmentDate')}<span className="required-mark">*</span></span>
              <input type="date" value={firstInstallmentDate} onChange={(e) => setFirstInstallmentDate(e.target.value)} aria-invalid={Boolean(fieldErrors.firstInstallmentDate)} />
            </label>
            {fieldErrors.firstInstallmentDate ? <small className="field-error">{fieldErrors.firstInstallmentDate}</small> : null}
          </section>

          <section className="subpanel field-group">
            <h2>{t('financialSection')}</h2>
            <label>
              <span>{t('numberOfInstallments')}<span className="required-mark">*</span></span>
              <input type="number" min="1" step="1" value={numberOfInstallments} onChange={(e) => setNumberOfInstallments(e.target.value)} aria-invalid={Boolean(fieldErrors.numberOfInstallments)} />
            </label>
            {fieldErrors.numberOfInstallments ? <small className="field-error">{fieldErrors.numberOfInstallments}</small> : null}

            <div className="field-group">
              <span>{t('downPaymentPercentage')}/{t('downPaymentAmount')}</span>
              <div className="inline-switch">
                <label>
                  <input type="radio" checked={paymentMode === 'percentage'} onChange={() => setPaymentMode('percentage')} />
                  {t('usePercentage')}
                </label>
                <label>
                  <input type="radio" checked={paymentMode === 'amount'} onChange={() => setPaymentMode('amount')} />
                  {t('useAmount')}
                </label>
              </div>
              {paymentMode === 'percentage' ? (
                <input type="number" min="0" max="100" step="0.01" value={downPaymentPercentage} onChange={(e) => setDownPaymentPercentage(e.target.value)} aria-invalid={Boolean(fieldErrors.downPayment)} />
              ) : (
                <input type="number" min="0" step="0.01" value={downPaymentAmount} onChange={(e) => setDownPaymentAmount(e.target.value)} aria-invalid={Boolean(fieldErrors.downPayment)} />
              )}
              {fieldErrors.downPayment ? <small className="field-error">{fieldErrors.downPayment}</small> : null}
            </div>
          </section>

          <div className="form-actions">
            <Link className="button secondary" to="/">{t('back')}</Link>
            <button type="submit" disabled={submitting}>
              {submitting ? t('loading') : t('createContractAction')}
            </button>
          </div>
        </form>

        <aside className="summary-panel">
          <div className="section-title">
            <div>
              <div className="page-kicker">{t('contractInfo')}</div>
              <h2>{t('summary')}</h2>
            </div>
          </div>
          <div className="summary-stack">
            <SummaryRow label={t('customerNumber')} value={selectedLabel(DEMO_CUSTOMERS, customerId)} />
            <SummaryRow label={t('unitNumber')} value={selectedLabel(DEMO_UNITS, unitId)} />
            <SummaryRow label={t('contractValue')} value={contractValue || '—'} amount />
            <SummaryRow label={t('numberOfInstallments')} value={numberOfInstallments || '—'} />
            <SummaryRow label={t('installmentType')} value={installmentType} />
            <SummaryRow label={t('frequency')} value={frequency} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function selectedLabel(items: readonly { id: string; number: string; label: string }[], id: string) {
  const item = items.find((x) => x.id === id);
  return item ? `${item.number} - ${item.label}` : '—';
}

function SummaryRow({ label, value, amount = false }: { label: string; value: string; amount?: boolean }) {
  return (
    <div className="summary-row">
      <span className="muted">{label}</span>
      <strong className={amount ? 'metric-value amount-cell' : 'metric-value'}>{value}</strong>
    </div>
  );
}
