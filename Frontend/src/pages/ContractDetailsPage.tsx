import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteContract, generateSchedule, getContract, getInstallments } from '../api/contractsApi';
import { ApiError } from '../api/client';
import { ErrorState, LoadingState, SuccessState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';
import type { ContractResponse, InstallmentResponse } from '../types/contracts';
import { getDemoCustomerNumber, getDemoUnitNumber } from '../utils/demo';
import { formatDate, formatMoney } from '../utils/format';

export function ContractDetailsPage() {
  const { id = '' } = useParams();
  const { language, t } = useI18n();
  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [installments, setInstallments] = useState<InstallmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError('');
    setNotFound(false);
    try {
      const [nextContract, nextInstallments] = await Promise.all([
        getContract(id),
        getInstallments(id),
      ]);
      setContract(nextContract);
      setInstallments(nextInstallments);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(err instanceof Error ? err.message : t('error'));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleGenerate() {
    setWorking(true);
    setActionError('');
    setMessage('');
    try {
      const result = await generateSchedule(id);
      setContract(result);
      setInstallments(await getInstallments(id));
      setMessage(t('scheduleGenerated'));
    } catch (err) {
      setActionError(resolveActionError(err, t));
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('confirmDeleteContract'))) {
      return;
    }

    setDeleting(true);
    setActionError('');
    try {
      await deleteContract(id);
      setMessage(t('contractDeleted'));
      window.location.href = '/';
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('error'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (notFound) return <ErrorState message={t('notFound')} onRetry={load} />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!contract) return null;
  const customerNumber = getDemoCustomerNumber(contract.customerId);
  const unitNumber = getDemoUnitNumber(contract.unitId);
  const hasInstallments = installments.length > 0;
  const canGenerateSchedule = !hasInstallments && contract.totalPaid <= 0;

  return (
    <section className="stack">
      <div className="panel">
        <div className="page-hero">
          <div className="page-title">
            <div className="page-kicker">{t('contractDetails')}</div>
            <h1>{customerNumber ? `${customerNumber} - ${contract.customerName}` : contract.customerName}</h1>
            <div className="page-meta">
              <span className={`status-badge ${statusTone(contract.status)}`}>{contract.status}</span>
              <span className="pill neutral">{contract.id}</span>
            </div>
          </div>
          <div className="row wrap">
            <Link className="button secondary" to="/">{t('back')}</Link>
            <Link className="button secondary" to={`/contracts/${id}/installments`}>{t('installments')}</Link>
            <Link className="button secondary" to={`/contracts/${id}/payments`}>{t('addPayment')}</Link>
            <Link className="button secondary" to={`/contracts/${id}/forecast`}>{t('forecast')}</Link>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={working || !canGenerateSchedule}
              title={!canGenerateSchedule ? (hasInstallments ? t('scheduleAlreadyExists') : t('cannotGenerateAfterPayments')) : undefined}
            >
              {working ? t('loading') : t('generateSchedule')}
            </button>
            <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('loading') : t('deleteContract')}
            </button>
          </div>
        </div>
        {actionError ? <div className="panel error inline-error">{actionError}</div> : null}
        {message ? <SuccessState message={message} /> : null}
        <div className="metric-grid" style={{ marginTop: '1rem' }}>
          <Metric label={t('contractValue')} value={formatMoney(contract.contractValue, language)} />
          <Metric label={t('totalPaid')} value={formatMoney(contract.totalPaid, language)} />
          <Metric label={t('outstandingAmount')} value={formatMoney(contract.outstanding, language)} />
          <Metric label={t('numberOfInstallments')} value={String(contract.numberOfInstallments)} />
        </div>
        <div className="detail-grid" style={{ marginTop: '1rem' }}>
          <DetailCard title={t('customerInfo')}>
            <DetailRow label={t('customer')} value={customerNumber ? `${customerNumber} - ${contract.customerName}` : contract.customerName} />
          </DetailCard>
          <DetailCard title={t('unitInfo')}>
            <DetailRow label={t('unit')} value={unitNumber ? `${unitNumber} - ${contract.unitCode}` : contract.unitCode} />
            <DetailRow label={t('projectName')} value={contract.projectName} />
          </DetailCard>
          <DetailCard title={t('contractInfo')}>
            <DetailRow label={t('contractDate')} value={formatDate(contract.contractDate, language)} />
            <DetailRow label={t('startDate')} value={formatDate(contract.firstInstallmentDate, language)} />
            <DetailRow label={t('installmentType')} value={contract.installmentType} />
            <DetailRow label={t('frequency')} value={contract.frequency} />
            <DetailRow label={t('numberOfInstallments')} value={String(contract.numberOfInstallments)} />
            <DetailRow label={t('status')} value={contract.status} />
          </DetailCard>
          <DetailCard title={t('financialInfo')}>
            <DetailRow label={t('contractValue')} value={formatMoney(contract.contractValue, language)} />
            <DetailRow label={t('downPaymentPercentage')} value={contract.downPaymentPercentage == null ? '—' : `${contract.downPaymentPercentage}%`} />
            <DetailRow label={t('downPaymentAmount')} value={contract.downPaymentAmount == null ? '—' : formatMoney(contract.downPaymentAmount, language)} />
            <DetailRow label={t('totalPaid')} value={formatMoney(contract.totalPaid, language)} />
            <DetailRow label={t('outstandingAmount')} value={formatMoney(contract.outstanding, language)} />
            <DetailRow label={t('collectionPercentage')} value={`${contract.collectionPercentage.toFixed(2)}%`} />
          </DetailCard>
        </div>
      </div>
      <div className="panel">
        <div className="row wrap">
          <Link className="button" to="/contracts/new">{t('createContract')}</Link>
          <Link className="button secondary" to={`/contracts/${id}/installments`}>{t('viewInstallments')}</Link>
          <Link className="button secondary" to={`/contracts/${id}/payment`}>{t('addPayment')}</Link>
          <Link className="button secondary" to={`/contracts/${id}/forecast`}>{t('forecast')}</Link>
        </div>
      </div>
    </section>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="subpanel">
      <h2>{title}</h2>
      <div className="detail-list">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span className="muted">{label}</span>
      <strong className="amount-cell">{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </div>
  );
}

function statusTone(status: string) {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Completed':
      return 'info';
    case 'Draft':
    default:
      return 'neutral';
  }
}

function resolveActionError(err: unknown, t: (key: 'scheduleAlreadyExists' | 'cannotGenerateAfterPayments' | 'generateScheduleError' | 'error') => string) {
  if (err instanceof ApiError && err.status === 400 && err.errors) {
    const messages = Object.values(err.errors).flat();
    const joined = messages.join(' ').toLowerCase();
    if (joined.includes('already exists')) {
      return t('scheduleAlreadyExists');
    }
    if (joined.includes('payments were recorded')) {
      return t('cannotGenerateAfterPayments');
    }
    return messages[0] ?? t('generateScheduleError');
  }

  if (err instanceof ApiError && err.detail) {
    return err.detail;
  }

  return err instanceof Error ? err.message : t('error');
}
