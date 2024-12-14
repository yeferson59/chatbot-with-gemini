"use server";
import { googleApi } from "@/config/env.config";
import { Content, GoogleGenerativeAI } from "@google/generative-ai";

// Historial para mantener las interacciones
const history: Content[] = [];

// Crear la estructura para incluir la imagen en el payload
const createGenerativePart = (base64Image: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Image,
      mimeType, // Ejemplo: "image/jpeg"
    },
  };
};

// Función principal para generar el mensaje con la API de Gemini
export const generateMessage = async (
  message: string,
  base64Image?: string | null,
  mimeType?: string
) => {
  const genAI = new GoogleGenerativeAI(googleApi);

  // Configuración del modelo
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp", // Asegúrate de usar el modelo correcto
  });

  // Si hay una imagen, la añadimos al payload
  if (base64Image && mimeType) {
    const imagePart = createGenerativePart(base64Image, mimeType);
    const result = await model.generateContent([message, imagePart]);
    history.push(result.response.candidates?.[0].content as Content);
    return result.response.text();
  }

  try {
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const chatSession = model.startChat({
      generationConfig,
      history: history,
    });

    const result = await chatSession.sendMessage(message);

    // Actualizamos el historial
    history.push(result.response.candidates?.[0].content as Content);

    return result.response.text();
  } catch (error) {
    console.error("Error al generar el mensaje:", error);
    throw new Error("Error al generar el mensaje con Gemini.");
  }
};
