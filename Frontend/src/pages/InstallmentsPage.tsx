import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getInstallments } from '../api/contractsApi';
import { ErrorState, LoadingState, SuccessState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';
import type { InstallmentResponse } from '../types/contracts';
import { formatDate, formatMoney } from '../utils/format';

export function InstallmentsPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const { language, t } = useI18n();
  const [items, setItems] = useState<InstallmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await getInstallments(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="panel">
      <div className="page-hero">
        <div className="page-title">
          <div className="page-kicker">{t('installments')}</div>
          <h1>{t('installments')}</h1>
          <div className="page-meta">
            <span className="pill neutral">{id}</span>
          </div>
        </div>
        <div className="row wrap">
          <Link className="button secondary" to={`/contracts/${id}`}>{t('backToContract')}</Link>
          <Link className="button secondary" to={`/contracts/${id}/payment`}>{t('addPayment')}</Link>
          <Link className="button secondary" to={`/contracts/${id}/forecast`}>{t('forecast')}</Link>
        </div>
      </div>
      {typeof location.state === 'object' && location.state && 'message' in location.state ? (
        <SuccessState message={String((location.state as { message?: string }).message ?? '')} />
      ) : null}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <strong>{t('emptyInstallments')}</strong>
          <div className="muted">{t('generateSchedule')}</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('dueDate')}</th>
                <th className="amount-cell">{t('expectedAmount')}</th>
                <th className="amount-cell">{t('paidAmount')}</th>
                <th className="amount-cell">{t('remainingAmount')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.sequenceNumber}</td>
                  <td>{formatDate(item.dueDate, language)}</td>
                  <td className="amount-cell">{formatMoney(item.expectedAmount, language)}</td>
                  <td className="amount-cell">{formatMoney(item.paidAmount, language)}</td>
                  <td className="amount-cell">{formatMoney(item.remainingAmount, language)}</td>
                  <td><span className={`status-badge ${statusTone(item.status)}`}>{t(statusKey(item.status))}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function statusKey(status: InstallmentResponse['status']) {
  switch (status) {
    case 'Pending':
      return 'statusPending';
    case 'PartiallyPaid':
      return 'statusPartiallyPaid';
    case 'Paid':
      return 'statusPaid';
    default:
      return 'status';
  }
}

function statusTone(status: InstallmentResponse['status']) {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'PartiallyPaid':
      return 'warning';
    case 'Pending':
    default:
      return 'neutral';
  }
}
