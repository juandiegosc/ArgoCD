import useHashRouter from './hooks/useHashRouter';
import useTheme from './hooks/useTheme';
import NavBar from './components/NavBar';
import HomeView from './views/HomeView';
import TasksView from './views/TasksView';
import CounterView from './views/CounterView';
import EditorView from './views/EditorView';

function App() {
  const route = useHashRouter();
  const { theme, toggle } = useTheme();

  return (
    <div className="app-shell">
      <NavBar activeRoute={route} theme={theme} onToggleTheme={toggle} />
      <main className="app-content">
        {route === 'home'    && <HomeView />}
        {route === 'tasks'   && <TasksView />}
        {route === 'counter' && <CounterView />}
        {route === 'editor'  && <EditorView />}
      </main>
    </div>
  );
}

export default App;
