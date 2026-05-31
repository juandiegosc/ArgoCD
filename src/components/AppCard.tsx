const FALLBACK_VERSION = 'dev';

function resolveVersion(raw: string | undefined): string {
  if (!raw) return FALLBACK_VERSION;
  return raw;
}

function AppCard() {
  const rawVersion = import.meta.env.VITE_APP_VERSION as string | undefined;
  const version = resolveVersion(rawVersion);

  return (
    <article className="app-card">
      <h1 className="app-card__title">React Demo</h1>
      <p className="app-card__version" data-testid="version">v{version}</p>
      <span role="status" className="app-card__badge">Running on Kubernetes</span>
    </article>
  );
}

export default AppCard;
