import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addPayment } from '../api/contractsApi';
import { ApiError } from '../api/client';
import { ErrorState, SuccessState } from '../components/Feedback';
import { useI18n } from '../i18n/I18nProvider';

const today = new Date().toISOString().slice(0, 10);

export function AddPaymentPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [amount, setAmount] = useState('120000');
  const [paymentDate, setPaymentDate] = useState(today);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t('invalidNumber'));
      return;
    }

    setLoading(true);
    try {
      await addPayment(id, {
        amount: parsed,
        paymentDate,
        reference: reference || null,
      });
      navigate(`/contracts/${id}/installments`, { state: { message: t('paymentAdded') } });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setError(err.errors.Amount?.[0] ?? err.errors.PaymentDate?.[0] ?? err.errors.Reference?.[0] ?? err.message);
      } else {
        setError(err instanceof Error ? err.message : t('error'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="page-hero">
        <div className="page-title">
          <div className="page-kicker">{t('addPayment')}</div>
          <h1>{t('recordPayment')}</h1>
          <div className="page-meta">
            <span className="pill neutral">{id}</span>
          </div>
        </div>
        <Link className="button secondary" to={`/contracts/${id}`}>{t('backToDetails')}</Link>
      </div>
      {error ? <ErrorState message={error} /> : null}
      {success ? <SuccessState message={success} /> : null}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>{t('paymentAmount')}<span className="required-mark">*</span></span>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          <span>{t('paymentDate')}</span>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </label>
        <label>
          <span>{t('reference')}</span>
          <input value={reference} onChange={(e) => setReference(e.target.value)} />
        </label>
        <div className="form-actions">
          <Link className="button secondary" to={`/contracts/${id}`}>{t('backToContract')}</Link>
          <button type="submit" disabled={loading}>
            {loading ? t('loading') : t('recordPayment')}
          </button>
        </div>
      </form>
    </section>
  );
}
