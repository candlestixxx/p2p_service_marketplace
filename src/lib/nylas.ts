import Nylas from "nylas";

if (!process.env.NYLAS_API_KEY) {
  console.warn("NYLAS_API_KEY is missing. Calendar sync will run in mock mode.");
}

export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || "mock-api-key",
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});
