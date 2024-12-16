import React, { useState } from "react";
import glossaryData from "./data/glossary.json";
import GlossaryList from "./components/GlossaryList";
import DefinitionDisplay from "./components/DefinitionDisplay";
import "./App.css";

const App = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const handleSearch = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (input) {
      const filteredSuggestions = glossaryData.filter((item) =>
        item.term.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);

      // Limpia el término seleccionado si no hay coincidencias
      if (filteredSuggestions.length === 0) {
        setSelectedTerm(null);
      }
    } else {
      setSuggestions([]);
      setSelectedTerm(null); // Limpia también el término cuando la búsqueda está vacía
    }
  };

  const handleSelectTerm = (term) => {
    setSelectedTerm(term);
    setSuggestions([]);
    setQuery("");
  };

  return (
    <div className="app-container">
      <header>Glosario FUPAD</header>
      <div className="intro-text">
        Hola, soy el <strong>Glosario FUPAD</strong>. Estoy aquí para ayudarte a consultar términos oficiales y precisos basados en la terminología de FUPAD. Escribe un término en la barra de búsqueda y te mostraré su significado.
        <br />
        <strong>¿Qué término necesitas consultar?</strong>
      </div>


      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar un término..."
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      {query && suggestions.length > 0 && (
        <GlossaryList suggestions={suggestions} onSelect={handleSelectTerm} />
      )}

      {query && suggestions.length === 0 && (
        <p className="no-results">No se encontraron resultados</p>
      )}

      <DefinitionDisplay term={selectedTerm} />
    </div>
  );
};

export default App;
