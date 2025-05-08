import React, { useState, useEffect } from 'react';
import glossaryData from './data/glossary.json';
import './App.css';
import Modal from './components/Modal';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwysZWcH25fLSsWpBWRr2zL_w9v2Wkhife5MaUH8eitXcnh9-lFbTUNlfzqCAXKMaSQ/exec';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestDefinition, setShowRequestDefinition] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const [nuevoTermino, setNuevoTermino] = useState('');
  const [nuevaDefinicion, setNuevaDefinicion] = useState('');
  const [nuevaFuente, setNuevaFuente] = useState('');

  const [adjustTerm, setAdjustTerm] = useState('');
  const [currentDefinition, setCurrentDefinition] = useState('');
  const [adjustComment, setAdjustComment] = useState('');
  const [adjustFuente, setAdjustFuente] = useState('');

  const [modalContent, setModalContent] = useState(null);
  const showConfirmation = msg => setModalContent(msg);
  const hideConfirmation = () => setModalContent(null);

  const generarID = () => new Date().toISOString();

  const postToScript = async valuesArray => {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: valuesArray })
    });
  };

  useEffect(() => {
    if (!searchTerm) {
      setResults([]); setSelected(null);
      setShowAddForm(false);
      setShowRequestDefinition(false);
      setShowAdjustmentForm(false);
      return;
    }
    const filtered = glossaryData.filter(item =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
    setSelected(null);
    setShowAddForm(false);
    setShowRequestDefinition(false);
    setShowAdjustmentForm(false);
  }, [searchTerm]);

  const handleSelect = item => {
    setSelected(item);
    setResults([]);
  };

  const handleRequestDefinition = async () => {
    const id = generarID();
    await postToScript([
      id, 'request_definition', searchTerm, '', '', '', new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅  Solicitud de definición enviada.');
    setShowRequestDefinition(true);
  };

  const handleEnviarSugerencia = async () => {
    if (!nuevoTermino || !nuevaDefinicion) {
      showConfirmation('⚠️  Completa término y definición.');
      return;
    }
    const id = generarID();
    await postToScript([
      id, 'new_term', nuevoTermino, nuevaDefinicion, '', nuevaFuente, new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅  Solicitud de nueva palabra enviada.');
    setNuevoTermino(''); setNuevaDefinicion(''); setNuevaFuente('');
    setShowAddForm(false);
  };

  const handleEnviarAjuste = async () => {
    if (!adjustComment) {
      showConfirmation('⚠️ Describe tu ajuste.');
      return;
    }
    const id = generarID();
    await postToScript([
      id, 'adjust_term', adjustTerm, adjustComment, adjustFuente, '', new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅ Ajuste enviado.');
    setAdjustComment(''); setAdjustFuente('');
    setShowAdjustmentForm(false);
  };

  const enlazarDefinicion = (definicion) => {
    const terminos = glossaryData.map(t => t.term.toLowerCase());
    const palabras = definicion.split(/\b/);
    return (
      <>
        {palabras.map((palabra, i) => {
          const palabraLimpia = palabra
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[.,;:!?()¿¡"“”]/g, '');

          if (terminos.includes(palabraLimpia)) {
            const termMatch = glossaryData.find(t => t.term.toLowerCase() === palabraLimpia);
            return (
              <span
                key={i}
                className="glossary-link"
                style={{ color: '#004f74', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => handleSelect(termMatch)}
              >
                {palabra}
              </span>
            );
          }
          return palabra;
        })}
      </>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Glosario FUPAD</h1>
        <div className="intro-card">
          <p><strong>Hola, soy el Glosario FUPAD.</strong> Estoy aquí para ayudarte a consultar términos oficiales y precisos.</p>
          <p><strong>¿Qué término necesitas consultar?</strong></p>
        </div>
      </header>

      <main className="app-main">
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Buscar palabra..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {results.length > 0 && (
          <ul className="glossary-suggestions">
            {results.map(item => (
              <li key={item.term}
                className="suggestion-item"
                onClick={() => handleSelect(item)}>
                <span className="search-icon">🔍</span>
                {item.term}
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="definition-display">
            <h2>{selected.term}</h2>
            <p className="justified">{enlazarDefinicion(selected.definition)}</p>
            <div className="source"> Fuente:&nbsp;{selected.source ? ( <>
                        {
                          selected.source.split(/(https?:\/\/[^\s]+)/g).map((fragment, index) =>
                            fragment.match(/https?:\/\/[^\s]+/) ? (
                              <a key={index} href={fragment} target="_blank" rel="noopener noreferrer">
                                {fragment}
                              </a>
                            ) : (
                              <span key={index}>{fragment}</span>
                            )
                          )
                        }
                      </>
                    ) : (
                      'No especificada'
                    )}
             </div>


            <button
              className="btn adjust"
              onClick={() => {
                setAdjustTerm(selected.term);
                setCurrentDefinition(selected.definition);
                setShowAdjustmentForm(true);
              }}
            >
              🏳️ <span className="adjust-text">Solicitar Ajuste</span>
            </button>
          </div>
        )}

        {searchTerm && results.length === 0 && !selected && !showAddForm && !showRequestDefinition && (
          <div className="no-results-message">
            <p>No encontramos definición para "<strong>{searchTerm}</strong>".</p>
            <div className="no-results-actions">
              <button className="btn primary"
                onClick={() => { setNuevoTermino(searchTerm); setShowAddForm(true); }}>
                Enviar para aprobación
              </button>
              <button className="btn secondary"
                onClick={handleRequestDefinition}>
                Solicitar definición
              </button>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="add-form">
            <h3>Agregar nueva palabra</h3>
            <input type="text" placeholder="Término"
              value={nuevoTermino} onChange={e => setNuevoTermino(e.target.value)} />
            <textarea placeholder="Definición"
              value={nuevaDefinicion} onChange={e => setNuevaDefinicion(e.target.value)} />
            <input type="text" placeholder="Fuente (opcional)"
              value={nuevaFuente} onChange={e => setNuevaFuente(e.target.value)} />
            <div className="form-actions">
              <button className="btn primary" onClick={handleEnviarSugerencia}>Enviar</button>
              <button className="btn secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {showAdjustmentForm && (
          <div className="add-form">
            <h3>Ajuste para "{adjustTerm}"</h3>
            <p className="current-def-text justified">{currentDefinition}</p>
            <textarea placeholder="Nueva definición..."
              value={adjustComment} onChange={e => setAdjustComment(e.target.value)} />
            <input type="text" placeholder="Fuente (opcional)"
              value={adjustFuente} onChange={e => setAdjustFuente(e.target.value)} />
            <div className="form-actions">
              <button className="btn primary" onClick={handleEnviarAjuste}>Enviar ajuste</button>
              <button className="btn secondary" onClick={() => setShowAdjustmentForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {showRequestDefinition && (
          <div className="no-results-message">
            <p>✅ ¡Solicitud enviada!</p>
          </div>
        )}
      </main>

      {modalContent && (
        <Modal onClose={hideConfirmation}>
          <p>{modalContent}</p>
          <button className="btn primary" onClick={hideConfirmation}>Cerrar</button>
        </Modal>
      )}
    </div>
  );
}

export default App;
