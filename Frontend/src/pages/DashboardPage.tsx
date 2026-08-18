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
  const [monthsInput, setMonthsInput] = useState('3');
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

  function applyMonths() {
    const selectedMonths = Number(monthsInput);
    if (Number.isInteger(selectedMonths) && selectedMonths > 0) {
      setMonths(selectedMonths);
    }
  }

  const showLoading = loading && !dashboard;
  if (showLoading) return <LoadingState />;
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
        <div className="forecast-control-card">
          <div className="forecast-control-head">
            <div>
              <div className="page-kicker">{t('months')}</div>
              <strong className="forecast-control-title">{t('forecastTitle')}</strong>
            </div>
            {loading && dashboard ? <div className="inline-loading">{t('loading')}</div> : null}
          </div>
          <div className="forecast-segments" role="group" aria-label={t('months')}>
            {[3, 6, 12].map((option) => (
              <button
                key={option}
                type="button"
                className={months === option ? 'forecast-segment active' : 'forecast-segment'}
                onClick={() => {
                  setMonthsInput(String(option));
                  setMonths(option);
                }}
                aria-pressed={months === option}
              >
                {option}
              </button>
            ))}
            <input
              className="forecast-period-input"
              type="number"
              min="1"
              step="1"
              value={monthsInput}
              onChange={(event) => setMonthsInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyMonths();
              }}
              aria-label={t('months')}
            />
            <button type="button" className="forecast-segment apply" onClick={applyMonths}>{t('apply')}</button>
          </div>
        </div>
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
                      <div className="table-actions">
                        <Link
                          className="icon-action secondary"
                          to={`/contracts/${item.contract.id}`}
                          aria-label={t('openDetails')}
                          title={t('openDetails')}
                        >
                          <DetailsIcon />
                          <span className="sr-only">{t('openDetails')}</span>
                        </Link>
                        <Link
                          className="icon-action secondary"
                          to={`/contracts/${item.contract.id}/forecast`}
                          aria-label={t('forecast')}
                          title={t('forecast')}
                        >
                          <ForecastIcon />
                          <span className="sr-only">{t('forecast')}</span>
                        </Link>
                        <button
                          type="button"
                          className="icon-action danger"
                          onClick={() => handleDelete(item.contract.id)}
                          disabled={deletingId === item.contract.id}
                          aria-label={deletingId === item.contract.id ? t('loading') : t('deleteContract')}
                          title={deletingId === item.contract.id ? t('loading') : t('deleteContract')}
                        >
                          <DeleteIcon />
                          <span className="sr-only">{deletingId === item.contract.id ? t('loading') : t('deleteContract')}</span>
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

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zm0 0v6h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13h6M8 17h8M8 9h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ForecastIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 15l4-4 3 3 5-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 7h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 7v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-7 0 .7 12.2A1.8 1.8 0 0 0 10.5 21h3a1.8 1.8 0 0 0 1.8-1.8L16 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
