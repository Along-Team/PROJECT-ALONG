import { Config } from "./types";

export abstract class Base {
  private apiKey: string;
  constructor(config: Config) {
    this.apiKey = config.apiKey;
  }

  protected invoke<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.apiKey}${endpoint}`;
    const headers = {
      " content-type": "application/json",
      "api-key": this.apiKey,
    };
    const config = {
      ...options,
      headers,
    };
    return fetch(url, config).then(async (response) => {
      if (response.ok) {
        return response.json();
      } else {
        const error = await response.json();
        throw new Error(error);
      }
    });
  }
}
