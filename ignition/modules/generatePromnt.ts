function generateNFTPrompt(level: string) {
  let prompt =
    "Crear un dibujo lineal de un ave fénix majestuosa en vuelo, adecuado para calcar. ";
  prompt +=
    "El ave fénix debe estar representada con líneas simples y limpias, capturando la esencia del ave resurgiendo de las llamas. ";
  prompt +=
    "El diseño debe enfocarse en los contornos y características principales del fénix sin sombreado ni color. ";

  switch (level) {
    case "Plata":
      prompt +=
        "El estilo debe ser minimalista y la postura del fénix sutilmente diferente, ideal para representar una versión más accesible y menos detallada.";
      break;
    case "Oro":
      prompt +=
        "El estilo debe ser más detallado y vibrante, con toques de color dorado y rojo para reflejar un nivel más prestigioso y atractivo visualmente.";
      break;
    case "Rubí":
      prompt +=
        "El estilo debe ser extremadamente detallado y lujoso, con una gama de colores rojos y burdeos y un fondo elaborado para denotar el nivel más exclusivo.";
      break;
    default:
      prompt +=
        "El estilo debe ser minimalista, enfatizando la claridad y la facilidad de trazo para fines artísticos y educativos.";
      break;
  }

  return prompt;
}

// Ejemplo de uso
console.log(generateNFTPrompt("Oro"));
console.log(generateNFTPrompt("Plata"));
console.log(generateNFTPrompt("Rubí"));
