import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <section className="panel">
      <h1>{t('notFound')}</h1>
      <p className="muted">{t('error')}</p>
      <Link className="button" to="/contracts/new">
        {t('createContract')}
      </Link>
    </section>
  );
}
