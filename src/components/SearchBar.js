import React from "react";

const SearchBar = ({ search, setSearch, results }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Buscar un término..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Mostrar mensaje si no hay resultados y el usuario escribió algo */}
      {results.length === 0 && search.trim() !== "" && (
        <p className="no-results">No se encontraron resultados</p>
      )}
    </div>
  );
};

export default SearchBar;
