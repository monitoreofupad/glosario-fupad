import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './components/Modal';

// URL del endpoint de Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwysZWcH25fLSsWpBWRr2zL_w9v2Wkhife5MaUH8eitXcnh9-lFbTUNlfzqCAXKMaSQ/exec';

function App() {
  // ------------------- Estados principales -------------------
  const [glossaryData, setGlossaryData] = useState([]); // Términos cargados desde GitHub
  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda ingresada por el usuario
  const [results, setResults] = useState([]); // Resultados filtrados
  const [selected, setSelected] = useState(null); // Término seleccionado

  // Estados de visibilidad de formularios
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestDefinition, setShowRequestDefinition] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  // Estados para nueva palabra
  const [nuevoTermino, setNuevoTermino] = useState('');
  const [nuevaDefinicion, setNuevaDefinicion] = useState('');
  const [nuevaFuente, setNuevaFuente] = useState('');

  // Estados para ajuste
  const [adjustTerm, setAdjustTerm] = useState('');
  const [currentDefinition, setCurrentDefinition] = useState('');
  const [adjustComment, setAdjustComment] = useState('');
  const [adjustFuente, setAdjustFuente] = useState('');

  // Modal de confirmación
  const [modalContent, setModalContent] = useState(null);
  const showConfirmation = msg => setModalContent(msg);
  const hideConfirmation = () => setModalContent(null);

  // ------------------- Cargar datos del glosario desde GitHub -------------------
  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/monitoreofupad/glosario-fupad/main/src/data/glossary.json?cacheBust=${Date.now()}`)
      .then(response => response.text()) // Primero obtenemos texto crudo
      .then(text => JSON.parse(decodeURIComponent(escape(text)))) // Reconvertimos a UTF-8 y luego parseamos
      .then(data => setGlossaryData(data))
      .catch(error => console.error('Error al cargar el glosario:', error));
  }, []);

  // ------------------- Generador de IDs únicos -------------------
  const generarID = () => new Date().toISOString();

  // ------------------- Enviar sugerencia al backend (Apps Script) -------------------
  const postToScript = async valuesArray => {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: valuesArray })
    });
  };

  // ------------------- Filtrar términos cuando cambia la búsqueda -------------------
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
  }, [searchTerm, glossaryData]);

  // ------------------- Seleccionar un término -------------------
  const handleSelect = item => {
    setSelected(item);
    setResults([]);
  };

  // ------------------- Solicitar definición -------------------
  const handleRequestDefinition = async () => {
    const id = generarID();
    await postToScript([
      id, 'request_definition', searchTerm, '', '', '', new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅  Solicitud de definición enviada.');
    setShowRequestDefinition(true);
  };

  // ------------------- Enviar nueva palabra -------------------
  const handleEnviarSugerencia = async () => {
    if (!nuevoTermino || !nuevaDefinicion) {
      showConfirmation('⚠️  Completa término y definición.');
      return;
    }
    const id = generarID();
    await postToScript([
      id, 'new_term', nuevoTermino, nuevaDefinicion, '', nuevaFuente, new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅  Solicitud de nueva palabra en proceso de Validación.');
    setNuevoTermino(''); setNuevaDefinicion(''); setNuevaFuente('');
    setShowAddForm(false);
  };

  // ------------------- Enviar ajuste a definición existente -------------------
  const handleEnviarAjuste = async () => {
    if (!adjustComment) {
      showConfirmation('⚠️ Describe tu ajuste.');
      return;
    }
    const id = generarID();
    await postToScript([
      id, 'adjust_term', adjustTerm, adjustComment, adjustFuente, '', new Date().toLocaleString(), 'Pendiente'
    ]);
    showConfirmation('✅ Ajuste en Proceso de validación.');
    setAdjustComment(''); setAdjustFuente('');
    setShowAdjustmentForm(false);
  };

  // ------------------- Resaltar términos relacionados en la definición -------------------
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

  // ------------------- Interfaz principal -------------------
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
        {/* Input de búsqueda */}
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Buscar palabra..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sugerencias de búsqueda */}
        {results.length > 0 && (
          <ul className="glossary-suggestions">
            {results.map(item => (
              <li key={item.term} className="suggestion-item" onClick={() => handleSelect(item)}>
                <span className="search-icon">🔍</span>
                {item.term}
              </li>
            ))}
          </ul>
        )}

        {/* Mostrar definición */}
        {selected && (
          <div className="definition-display">
            <h2>{selected.term}</h2>
            <p className="justified">{enlazarDefinicion(selected.definition)}</p>
            <div className="source">
              Fuente:&nbsp;
              {selected.source ? (
                <>
                  {selected.source.split(/(https?:\/\/[^\s]+)/g).map((fragment, index) =>
                    fragment.match(/https?:\/\/[^\s]+/) ? (
                      <a key={index} href={fragment} target="_blank" rel="noopener noreferrer">
                        {fragment}
                      </a>
                    ) : (
                      <span key={index}>{fragment}</span>
                    )
                  )}
                </>
              ) : (
                'No especificada'
              )}
            </div>
            <button className="btn adjust" onClick={() => {
              setAdjustTerm(selected.term);
              setCurrentDefinition(selected.definition);
              setShowAdjustmentForm(true);
            }}>
              🏳️ <span className="adjust-text">Solicitar Ajuste</span>
            </button>
          </div>
        )}

        {/* No se encontró definición */}
        {searchTerm && results.length === 0 && !selected && !showAddForm && !showRequestDefinition && (
          <div className="no-results-message">
            <p>No encontramos definición para "<strong>{searchTerm}</strong>".</p>
            <div className="no-results-actions">
              <button className="btn primary" onClick={() => { setNuevoTermino(searchTerm); setShowAddForm(true); }}>
                Agregar Palabra
              </button>
              <button className="btn secondary" onClick={handleRequestDefinition}>
                Solicitar definición
              </button>
            </div>
          </div>
        )}

        {/* Formulario para nueva palabra */}
        {showAddForm && (
          <div className="add-form">
            <h3>Agregar nueva palabra</h3>
            <input type="text" placeholder="Término" value={nuevoTermino} onChange={e => setNuevoTermino(e.target.value)} />
            <textarea placeholder="Definición" value={nuevaDefinicion} onChange={e => setNuevaDefinicion(e.target.value)} />
            <input type="text" placeholder="Fuente (opcional)" value={nuevaFuente} onChange={e => setNuevaFuente(e.target.value)} />
            <div className="form-actions">
              <button className="btn primary" onClick={handleEnviarSugerencia}>Enviar</button>
              <button className="btn secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Formulario para solicitar ajuste */}
        {showAdjustmentForm && (
          <div className="add-form">
            <h3>Ajuste para "{adjustTerm}"</h3>
            <p className="current-def-text justified">{currentDefinition}</p>
            <textarea placeholder="Nueva definición..." value={adjustComment} onChange={e => setAdjustComment(e.target.value)} />
            <input type="text" placeholder="Fuente (opcional)" value={adjustFuente} onChange={e => setAdjustFuente(e.target.value)} />
            <div className="form-actions">
              <button className="btn primary" onClick={handleEnviarAjuste}>Enviar ajuste</button>
              <button className="btn secondary" onClick={() => setShowAdjustmentForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Confirmación de solicitud de definición */}
        {showRequestDefinition && (
          <div className="no-results-message">
            <p>✅ ¡Solicitud enviada!</p>
          </div>
        )}
      </main>

      {/* Modal de confirmación */}
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