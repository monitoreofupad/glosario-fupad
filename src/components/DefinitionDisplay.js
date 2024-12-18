import React from "react";

const DefinitionDisplay = ({ term, glossary, onWordClick }) => {
  // Función que resalta palabras relacionadas y convierte enlaces
  const highlightTerms = (text, glossary, currentTerm) => {
    if (!text) return null;

    return text.split(" ").map((word, index) => {
      const cleanWord = word.replace(/[.,]/g, ""); // Elimina puntuación
      const isRelated =
        cleanWord.toLowerCase() !== currentTerm.toLowerCase() && // No resaltar el término actual
        glossary.some((item) => item.term.toLowerCase() === cleanWord.toLowerCase());

      // Detecta si es un enlace URL
      if (word.match(/(https?:\/\/[^\s]+)/g)) {
        return (
          <a
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#004f74",
              textDecoration: "underline",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#002a40")}
            onMouseLeave={(e) => (e.target.style.color = "#004f74")}
          >
            {word}{" "}
          </a>
        );
      }

      // Resalta palabras relacionadas
      return isRelated ? (
        <span
          key={index}
          className="highlighted-word"
          onClick={() => onWordClick(cleanWord)}
          style={{
            color: "#004f74",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#002a40")}
          onMouseLeave={(e) => (e.target.style.color = "#004f74")}
        >
          {word}{" "}
        </span>
      ) : (
        word + " "
      );
    });
  };

  // Función para convertir enlaces en la fuente
  const parseSource = (source) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return source.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#004f74",
              textDecoration: "underline",
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="definition-display">
      {term ? (
        <>
          {/* Título del término */}
          <h2>{term.term}</h2>

          {/* Definición con resaltado de términos */}
          <div className="definition-content">
            {highlightTerms(term.definition, glossary, term.term)}
          </div>

          {/* Fuente con manejo de enlaces */}
          {term.source && (
            <p className="source" style={{ marginTop: "15px", color: "#777", fontStyle: "italic" }}>
              {parseSource(term.source)}
            </p>
          )}
        </>
      ) : (
        <div className="no-term-message" style={{ textAlign: "center", color: "#777" }}>
          Selecciona un término para ver su definición.
        </div>
      )}
    </div>
  );
};

export default DefinitionDisplay;
