import React from "react";

const DefinitionDisplay = ({ term }) => {
  // Función que maneja saltos de línea y convierte enlaces en clicables
  const parseText = (text) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g; // Detecta URLs
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line.split(urlRegex).map((part, idx) =>
          part.match(urlRegex) ? (
            <a
              key={idx}
              href={part}
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
              {part}
            </a>
          ) : (
            part
          )
        )}
        <br />
      </span>
    ));
  };

  return (
    <div className="definition-display">
      {term ? (
        <>
          {/* Título del término */}
          <h2>{term.term}</h2>

          {/* Definición con manejo de saltos de línea y enlaces */}
          <div className="definition-content">{parseText(term.definition)}</div>

          {/* Fuente estilizada */}
          {term.source && (
            <p style={{ fontStyle: "italic", marginTop: "15px", color: "#777" }}>
            {parseText(term.source.replace(/^Fuente:\s*/, ""))}
            </p>
        )}        </>
      ) : (
        <p className="no-term">Selecciona un término para ver su definición.</p>
      )}
    </div>
  );
};

export default DefinitionDisplay;
