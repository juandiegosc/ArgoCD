import { useState } from 'react';
import { parseMarkdown } from '../utils/markdown';

const DEFAULT = `# Bienvenido al Editor

Escribe **Markdown** aquí y verás la vista previa en tiempo real.

## Características
- Encabezados H1, H2, H3
- Texto **negrita** e *itálico*
- Listas con viñetas

## ArgoCD Demo
Este editor usa un parser **propio** sin dependencias externas.
Desplegado en *Kubernetes* con ArgoCD.
`;

function EditorView() {
  const [text, setText] = useState(DEFAULT);

  return (
    <section className="editor-view">
      <h2 className="view-title">Editor Markdown</h2>
      <div className="editor-panes">
        <div className="editor-pane">
          <label className="editor-pane__label" htmlFor="md-input">Markdown</label>
          <textarea
            id="md-input"
            className="editor-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            spellCheck={false}
            aria-label="Editor Markdown"
          />
        </div>
        <div className="editor-pane">
          <p className="editor-pane__label" aria-hidden="true">Vista previa</p>
          <div
            className="editor-preview"
            aria-label="Vista previa renderizada"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
          />
        </div>
      </div>
    </section>
  );
}

export default EditorView;
