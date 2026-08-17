import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getForecast } from '../api/contractsApi';
import { ErrorState, LoadingState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';
import type { ForecastResponse } from '../types/contracts';
import { formatMoney } from '../utils/format';

const options = [3, 6, 12];

export function ForecastPage() {
  const { id = '' } = useParams();
  const { language, t } = useI18n();
  const [months, setMonths] = useState(3);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(selectedMonths = months) {
    setLoading(true);
    setError('');
    try {
      setForecast(await getForecast(id, selectedMonths));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(months);
  }, [id, months]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;
  if (!forecast) return null;

  return (
    <section className="stack">
      <div className="panel">
        <div className="page-hero">
          <div className="page-title">
            <div className="page-kicker">{t('forecastTitle')}</div>
            <h1>{t('forecastTitle')}</h1>
            <div className="page-meta">
              <span className="pill neutral">{id}</span>
              <span className="pill neutral">{months} {t('months')}</span>
            </div>
          </div>
          <Link className="button secondary" to={`/contracts/${id}`}>{t('backToDetails')}</Link>
        </div>
        <div className="page-hero">
          <label className="inline-select">
            <span>{t('months')}</span>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="forecast-visual">
            <div className="forecast-bars">
              <div className="forecast-bar paid" style={{ width: `${(forecast.currentPaid / forecast.contractValue) * 100}%` }} />
              <div className="forecast-bar expected" style={{ width: `${(forecast.expectedCollection / forecast.contractValue) * 100}%` }} />
              <div className="forecast-bar projected" style={{ width: `${(forecast.projectedCollected / forecast.contractValue) * 100}%` }} />
            </div>
            <div className="forecast-legend">
              <span><i className="legend-dot paid" />{t('totalPaid')}</span>
              <span><i className="legend-dot expected" />{t('expectedCollection')}</span>
              <span><i className="legend-dot projected" />{t('projectedCollected')}</span>
            </div>
          </div>
        </div>
        <div className="metric-grid">
          <Summary label={t('expectedCollection')} value={formatMoney(forecast.expectedCollection, language)} />
          <Summary label={t('projectedCollected')} value={formatMoney(forecast.projectedCollected, language)} />
          <Summary label={t('outstandingAmount')} value={formatMoney(forecast.outstanding, language)} />
          <Summary label={t('projectedCollectionPercentage')} value={`${forecast.projectedCollectionPercentage.toFixed(2)}%`} />
          <Summary label={t('contractValueCard')} value={formatMoney(forecast.contractValue, language)} />
          <Summary label={t('totalPaid')} value={formatMoney(forecast.currentPaid, language)} />
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </div>
  );
}
