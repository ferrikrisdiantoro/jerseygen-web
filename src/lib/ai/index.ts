import type { AIProvider } from "./types";
import { mockProvider } from "./mock";
import { kieaiProvider } from "./kieai";
import { freepikProvider } from "./freepik";

/** Resolve a provider by name. Falls back to mock for unknown names. */
export function getProvider(name?: string): AIProvider {
  switch ((name || "mock").toLowerCase()) {
    case "kieai":
      return kieaiProvider;
    case "freepik":
      return freepikProvider;
    case "mock":
    default:
      return mockProvider;
  }
}

export type { AIProvider, GenerateInput, ProviderOptions } from "./types";
