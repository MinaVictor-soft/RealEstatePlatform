import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

export function AppLayout() {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pageTitle = getPageTitle(location.pathname, t);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const sync = () => {
      setIsMobile(media.matches);
      if (media.matches) {
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(false);
      }
    };

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function toggleSidebar() {
    if (isMobile) {
      setSidebarOpen((value) => !value);
      return;
    }

    setSidebarCollapsed((value) => !value);
  }

  const sidebarToggleLabel = isMobile
    ? (sidebarOpen ? t('hideSidebar') : t('showSidebar'))
    : (sidebarCollapsed ? t('showSidebar') : t('hideSidebar'));

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <img src="/golden-terrace-logo.jpg?v=2" alt="Golden Terrace" className="brand-logo" />
          </div>
          <div>
            <div className="sidebar-client">Golden Terrace</div>
            <div className="sidebar-product">{t('appTitle')}</div>
          </div>
        </div>

        <div className="sidebar-section">{t('overview')}</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">⌂</span>
            <span>{t('dashboard')}</span>
          </NavLink>
          <NavLink to="/contracts/new" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">＋</span>
            <span>{t('createContract')}</span>
          </NavLink>
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
            <div className="workspace-breadcrumb">{t('overview')} / {pageTitle}</div>
            <div className="workspace-title">{pageTitle}</div>
          </div>
          <div className="workspace-actions">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarToggleLabel}
              aria-expanded={isMobile ? sidebarOpen : !sidebarCollapsed}
            >
              <span className="sidebar-toggle-icon">☰</span>
              <span className="sidebar-toggle-label">{sidebarToggleLabel}</span>
            </button>
            <span className="pill neutral">{language === 'ar' ? 'العربية' : 'English'}</span>
            <div className="workspace-avatar">
              <img src="/golden-terrace-logo.jpg?v=2" alt="Golden Terrace" className="workspace-avatar-logo" />
            </div>
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
