import React, { useState } from "react";
import glossaryData from "./data/glossary.json";
import GlossaryList from "./components/GlossaryList";
import DefinitionDisplay from "./components/DefinitionDisplay";
import "./App.css";

const App = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtra los términos basados en la búsqueda, ignorando tildes
  const handleSearch = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (input) {
      const normalizedInput = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const filteredSuggestions = glossaryData.filter((item) =>
        item.term
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(normalizedInput)
      );
      setSuggestions(filteredSuggestions);
      setSelectedTerm(null); // Limpia la selección anterior
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectTerm = (term) => {
    setSelectedTerm(term);
    setSuggestions([]);
    setQuery(""); // Limpia el buscador
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="app-container">
      <header>Glosario FUPAD</header>
      <div className="intro-text">
        Hola, soy el <strong>Glosario FUPAD</strong>. Estoy aquí para ayudarte a consultar términos
        oficiales y precisos. <br />
        <strong>¿Qué término necesitas consultar?</strong>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar un término..."
          value={query}
          onChange={handleSearch}
        />
      </div>

      {/* Resultados */}
      <div className="suggestions-container">
        {suggestions.length > 0 ? (
          <GlossaryList suggestions={suggestions} onSelect={handleSelectTerm} />
        ) : query ? (
          <div className="no-results-message">
            No encontramos resultados para <strong>"{query}"</strong>.
            <div>
              <button className="add-button" onClick={toggleAddForm}>
                {showAddForm ? "Ocultar formulario" : "Agregar nueva palabra"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Formulario para agregar palabras */}
      {showAddForm && (
        <div className="add-form">
          <h3>Agregar una nueva palabra</h3>
          <div className="form-group">
            <input type="text" placeholder="Término" />
          </div>
          <div className="form-group">
            <textarea placeholder="Definición"></textarea>
          </div>
          <div className="form-group">
            <input type="text" placeholder="Fuente" />
          </div>
          <button className="submit-button">Enviar</button>
        </div>
      )}

      {/* Definición seleccionada */}
      <DefinitionDisplay term={selectedTerm} />
    </div>
  );
};

export default App;
