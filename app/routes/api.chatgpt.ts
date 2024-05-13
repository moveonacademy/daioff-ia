import { json, ActionArgs } from "@remix-run/node";
import OpenAI from "openai";
import { emitter } from "~/services/emitter.server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const messages = formData.get("messages") as string;

  let responseText = '';

  try {
    const assistantID = "asst_TQVFirGoqMQIvaAjHgZDqDPK";
    const thread = await openai.beta.threads.create();

    // Crear un mensaje con el contenido proporcionado
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messages
    });

    const stream = openai.beta.threads.runs.stream(thread.id, { assistant_id: assistantID });

    // Leer el flujo de respuestas
    for await (const event of stream) {
      if (event.data.object.toString() === 'thread.message.delta') {
        responseText += event.data.delta.content[0].text.value;

        // Emitir evento progresivo para streaming en vivo
        emitter.emit("message", {
          id: thread.id,
          content: responseText,
          role: 'assistant'
        });
      }
    }

    // Devolver la respuesta generada al cliente
    return json({ response: responseText });
  } catch (error) {
    console.error('Error con OpenAI:', error);
    return json({ error: 'No se pudo obtener una respuesta.' }, { status: 500 });
  }
}