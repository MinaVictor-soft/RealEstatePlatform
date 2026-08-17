import { useEffect, useRef, useState } from 'react';
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
  const [reloadSeed, setReloadSeed] = useState(0);
  const cacheRef = useRef<Record<number, ForecastResponse>>({});
  const requestTokenRef = useRef(0);

  function setCachedForecast(selectedMonths: number) {
   const cached = cacheRef.current[selectedMonths];
   if (cached) {
     setForecast(cached);
     return true;
   }
   return false;
  }

  useEffect(() => {
   let active = true;
   const token = ++requestTokenRef.current;

   async function loadAll() {
     setLoading(true);
     setError('');
     try {
       const responses = await Promise.all(
         options.map(async (option) => [option, await getForecast(id, option)] as const),
       );
       if (!active || token !== requestTokenRef.current) {
         return;
       }

       cacheRef.current = Object.fromEntries(responses);
       const fallbackForecast = responses[0]![1];
       setForecast(cacheRef.current[months] ?? fallbackForecast);
     } catch (err) {
       if (active && token === requestTokenRef.current) {
         setError(err instanceof Error ? err.message : t('error'));
       }
     } finally {
       if (active && token === requestTokenRef.current) {
         setLoading(false);
       }
     }
   }

   cacheRef.current = {};
   setForecast(null);
   void loadAll();

   return () => {
     active = false;
   };
  }, [id, reloadSeed]);

  useEffect(() => {
   if (loading) {
     return;
   }
   if (!setCachedForecast(months)) {
     const token = ++requestTokenRef.current;
     setError('');
     setLoading(true);
     void getForecast(id, months)
       .then((result) => {
         if (token !== requestTokenRef.current) {
           return;
         }
         cacheRef.current[months] = result;
         setForecast(result);
       })
       .catch((err) => {
         if (token === requestTokenRef.current) {
           setError(err instanceof Error ? err.message : t('error'));
         }
       })
       .finally(() => {
         if (token === requestTokenRef.current) {
           setLoading(false);
         }
       });
   }
  }, [id, months, loading, t]);

  const showLoading = loading && !forecast;
  if (showLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => setReloadSeed((value) => value + 1)} />;
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
        <div className="forecast-toolbar">
          <div className="forecast-toolbar-left">
            <label className="inline-select">
              <span>{t('months')}</span>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                aria-busy={loading && forecast ? 'true' : 'false'}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {loading && forecast ? <div className="inline-loading">{t('loading')}</div> : null}
          </div>
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
