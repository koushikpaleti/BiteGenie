const env = {
  mongodbUri: process.env.MONGODB_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  xAiApiKey: process.env.XAI_API_KEY ?? "",
  aiBaseUrl: process.env.AI_BASE_URL ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

const envKeyMap: Record<keyof typeof env, string> = {
  mongodbUri: "MONGODB_URI",
  jwtSecret: "JWT_SECRET",
  openAiApiKey: "OPENAI_API_KEY",
  groqApiKey: "GROQ_API_KEY",
  xAiApiKey: "XAI_API_KEY",
  aiBaseUrl: "AI_BASE_URL",
  openAiModel: "OPENAI_MODEL",
  appUrl: "NEXT_PUBLIC_APP_URL",
  nodeEnv: "NODE_ENV",
};

export function requireEnv(key: keyof typeof env) {
  const value = env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${envKeyMap[key]}`,
    );
  }

  return value;
}

export { env };

export function getAiApiKey() {
  return env.openAiApiKey || env.groqApiKey || env.xAiApiKey || "";
}
