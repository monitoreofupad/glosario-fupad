import React from "react";

const GlossaryList = ({ suggestions, onSelect }) => {
  return (
    <ul className="glossary-suggestions">
      {suggestions.length > 0 ? (
        suggestions.map((item, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => onSelect(item)} // Pasar el objeto seleccionado
          >
            🔍 {item.term} {/* Mostrar la propiedad 'term' */}
          </li>
        ))
      ) : (
        <li className="no-results">No se encontraron resultados</li>
      )}
    </ul>
  );
};

export default GlossaryList;
