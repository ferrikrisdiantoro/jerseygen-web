import type { AIProvider } from "./types";
import { mockProvider } from "./mock";
import { kieaiProvider } from "./kieai";
import { freepikProvider } from "./freepik";

export function getProvider(): AIProvider {
  const name = (process.env.AI_PROVIDER || "mock").toLowerCase();
  switch (name) {
    case "kieai":
      return kieaiProvider;
    case "freepik":
      return freepikProvider;
    case "mock":
    default:
      return mockProvider;
  }
}

export type { AIProvider, GenerateInput } from "./types";
