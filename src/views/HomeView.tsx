function HomeView() {
  const version = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'dev';

  return (
    <section className="home-view">
      <div className="home-hero">
        <h1 className="home-hero__title">ArgoCD Demo Dashboard test</h1>
        <p className="home-hero__version">v{version}</p>
        <span role="status" className="home-hero__badge">Running on Kubernetes</span>
      </div>

      <div className="home-cards">
        <div className="info-card">
          <h2 className="info-card__title">Tareas</h2>
          <p className="info-card__desc">
            Gestiona tareas con persistencia local. Avanza de <strong>todo</strong> a{' '}
            <strong>in-progress</strong> a <strong>done</strong>.
          </p>
        </div>
        <div className="info-card">
          <h2 className="info-card__title">Contador</h2>
          <p className="info-card__desc">
            Contador con historial de las últimas 10 operaciones. El estado
            persiste entre sesiones.
          </p>
        </div>
        <div className="info-card">
          <h2 className="info-card__title">Editor Markdown</h2>
          <p className="info-card__desc">
            Editor con vista previa en tiempo real. Sin dependencias externas —
            renderizado propio.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HomeView;
