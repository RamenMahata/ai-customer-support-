const response = await fetch(
  "http://localhost:3000/api/chat/stream",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Explain how an AI chatbot works.",
    }),
  }
);

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  const chunk = decoder.decode(value, { stream: true });

  process.stdout.write(chunk);
}