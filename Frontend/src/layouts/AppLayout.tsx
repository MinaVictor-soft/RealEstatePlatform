import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

export function AppLayout() {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname, t);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">GT</div>
          <div>
            <div className="sidebar-client">Golden Terrace</div>
            <div className="sidebar-product">{t('appTitle')}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/">{t('dashboard')}</NavLink>
          <NavLink to="/contracts/new">{t('createContract')}</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-label">{t('language')}</div>
          <div className="language-switcher vertical">
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
              {t('english')}
            </button>
            <button type="button" className={language === 'ar' ? 'active' : ''} onClick={() => setLanguage('ar')}>
              {t('arabic')}
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-header">
          <div className="workspace-context">
            <div className="page-kicker">{t('appTitle')}</div>
            <div className="workspace-title">{pageTitle}</div>
          </div>
          <div className="workspace-actions">
            <span className="pill neutral">{language === 'ar' ? 'العربية' : 'English'}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type Translator = ReturnType<typeof useI18n>['t'];

function getPageTitle(pathname: string, t: Translator) {
  if (pathname.startsWith('/contracts/new')) return t('createContractAction');
  if (pathname.includes('/installments')) return t('installments');
  if (pathname.includes('/payment')) return t('recordPayment');
  if (pathname.includes('/forecast')) return t('forecastTitle');
  if (pathname.includes('/contracts/')) return t('contractDetails');
  return t('dashboard');
}
