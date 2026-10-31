import Groq from 'groq-sdk';

let client = null;

// Created on first use: the SDK throws when GROQ_API_KEY is missing, and that
// shouldn't stop the rest of the server from starting.
// Fail fast: one retry, 60s per attempt.
export function getGroq() {
  client ??= new Groq({ maxRetries: 1, timeout: 60_000 });
  return client;
}
