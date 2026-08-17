import { useI18n } from '../i18n/I18nProvider';

export function LoadingState() {
  const { t } = useI18n();
  return (
    <div className="panel loading-card" aria-busy="true" aria-live="polite">
      <div className="skeleton loading-line lg" />
      <div className="skeleton loading-line" />
      <div className="skeleton loading-line" />
      <div className="muted">{t('loading')}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="panel error">
      <div>{message}</div>
      {onRetry ? (
        <button type="button" className="secondary" onClick={onRetry}>
          {t('retry')}
        </button>
      ) : null}
    </div>
  );
}

export function SuccessState({ message }: { message: string }) {
  return <div className="panel success" role="status" aria-live="polite">{message}</div>;
}
