import type { CounterState } from '../types/index';
import { applyOperation } from '../utils/counterUtils';
import useLocalStorage from '../hooks/useLocalStorage';

const INITIAL: CounterState = { value: 0, history: [] };

const OP_LABEL = { increment: '+ incremento', decrement: '- decremento', reset: 'reset' };

function CounterView() {
  const [state, setState] = useLocalStorage<CounterState>('counter', INITIAL);

  const apply = (op: Parameters<typeof applyOperation>[1]) => {
    setState(applyOperation(state, op));
  };

  return (
    <section className="counter-view">
      <h2 className="view-title">Contador</h2>

      <div className="counter-display">
        <span className="counter-display__value" aria-live="polite" aria-label="Valor actual">
          {state.value}
        </span>
      </div>

      <div className="counter-controls">
        <button onClick={() => apply('decrement')} className="btn btn--outline btn--lg" aria-label="Decrementar">
          −
        </button>
        <button onClick={() => apply('reset')} className="btn btn--ghost">
          Reset
        </button>
        <button onClick={() => apply('increment')} className="btn btn--primary btn--lg" aria-label="Incrementar">
          +
        </button>
      </div>

      {state.history.length > 0 && (
        <div className="counter-history">
          <h3 className="counter-history__title">Historial</h3>
          <ol className="counter-history__list" aria-label="Historial de operaciones">
            {[...state.history].reverse().map((entry, i) => (
              <li key={i} className="counter-history__entry">
                <span className="counter-history__op">{OP_LABEL[entry.operation]}</span>
                <span className="counter-history__result">→ {entry.result}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

export default CounterView;
