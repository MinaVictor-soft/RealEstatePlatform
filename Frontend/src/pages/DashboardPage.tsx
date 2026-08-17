import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteContract, getDashboard } from '../api/contractsApi';
import { ErrorState, LoadingState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';
import type { ContractsDashboardResponse } from '../types/contracts';
import { getDemoCustomerNumber, getDemoUnitNumber } from '../utils/demo';
import { formatMoney } from '../utils/format';

export function DashboardPage() {
  const { language, t } = useI18n();
  const navigate = useNavigate();
  const [months, setMonths] = useState(3);
  const [dashboard, setDashboard] = useState<ContractsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  async function load(selectedMonths = months) {
    setLoading(true);
    setError('');
    try {
      setDashboard(await getDashboard(selectedMonths));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [months]);

  async function handleDelete(id: string) {
    if (!window.confirm(t('confirmDeleteContract'))) {
      return;
    }

    setDeletingId(id);
    setError('');
    try {
      await deleteContract(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setDeletingId('');
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!dashboard) return null;

  return (
    <section className="stack">
      <div className="panel">
        <div className="page-hero">
          <div className="page-title">
            <div className="page-kicker">{t('overview')}</div>
            <h1>{t('allContracts')}</h1>
            <div className="muted">{t('overviewHint')}</div>
          </div>
          <div className="page-meta">
            <button type="button" className="secondary" onClick={() => navigate(-1)}>{t('back')}</button>
            <Link className="button" to="/contracts/new">{t('createContractAction')}</Link>
          </div>
        </div>
        <label className="inline-select">
          <span>{t('months')}</span>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={12}>12</option>
          </select>
        </label>
        <div className="metric-grid">
          <Metric label={t('totalContracts')} value={String(dashboard.totalContracts)} />
          <Metric label={t('totalContractValue')} value={formatMoney(dashboard.totalContractValue, language)} />
          <Metric label={t('totalPaid')} value={formatMoney(dashboard.totalPaid, language)} />
          <Metric label={t('totalOutstanding')} value={formatMoney(dashboard.totalOutstanding, language)} />
          <Metric label={t('expectedCollection')} value={formatMoney(dashboard.expectedCollection, language)} />
          <Metric label={t('projectedCollected')} value={formatMoney(dashboard.projectedCollected, language)} />
          <Metric label={t('projectedCollectionPercentage')} value={`${dashboard.projectedCollectionPercentage.toFixed(2)}%`} />
        </div>
      </div>

      {dashboard.contracts.length === 0 ? (
        <div className="panel muted">{t('noContracts')}</div>
      ) : (
        <div className="panel table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>{t('customer')}</th>
                <th>{t('unit')}</th>
                <th>{t('status')}</th>
                <th>{t('contractValue')}</th>
                <th>{t('totalPaid')}</th>
                <th>{t('outstandingAmount')}</th>
                <th>{t('expectedCollection')}</th>
                <th>{t('projectedCollected')}</th>
                <th>{t('projectedCollectionPercentage')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.contracts.map((item) => {
                const customerNumber = getDemoCustomerNumber(item.contract.customerId);
                const unitNumber = getDemoUnitNumber(item.contract.unitId);
                return (
                  <tr key={item.contract.id}>
                    <td>{customerNumber ? `${customerNumber} - ${item.contract.customerName}` : item.contract.customerName}</td>
                    <td>{unitNumber ? `${unitNumber} - ${item.contract.unitCode}` : item.contract.unitCode}</td>
                    <td><span className={`status-badge ${statusTone(item.contract.status)}`}>{item.contract.status}</span></td>
                    <td>{formatMoney(item.contract.contractValue, language)}</td>
                    <td>{formatMoney(item.contract.totalPaid, language)}</td>
                    <td>{formatMoney(item.contract.outstanding, language)}</td>
                    <td>{formatMoney(item.forecast.expectedCollection, language)}</td>
                    <td>{formatMoney(item.forecast.projectedCollected, language)}</td>
                    <td>{`${item.forecast.projectedCollectionPercentage.toFixed(2)}%`}</td>
                    <td>
                      <div className="row wrap">
                        <Link className="button secondary" to={`/contracts/${item.contract.id}`}>{t('openDetails')}</Link>
                        <Link className="button secondary" to={`/contracts/${item.contract.id}/forecast`}>{t('forecast')}</Link>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(item.contract.id)}
                          disabled={deletingId === item.contract.id}
                        >
                          {deletingId === item.contract.id ? t('loading') : t('deleteContract')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
