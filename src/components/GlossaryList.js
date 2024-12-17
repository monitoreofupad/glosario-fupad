import React from "react";

const GlossaryList = ({ suggestions, onSelect }) => {
  return (
    <ul className="glossary-suggestions">
      {suggestions.length > 0 ? (
        suggestions.map((item, index) => (
          <li
            key={index}
            className={`suggestion-item ${item.proposed ? "proposed" : ""}`}
            onClick={() => onSelect(item)} // Pasar el objeto seleccionado
          >
            🔍 {item.term} {item.proposed && <span>(Propuesta)</span>}
          </li>
        ))
      ) : (
        <li className="no-results">No se encontraron resultados</li>
      )}
    </ul>
  );
};

export default GlossaryList;
