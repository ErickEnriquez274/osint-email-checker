import { getJson } from "serpapi";

export interface DorkResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export const searchGoogleDork = async (
  query: string,
  location?: string
): Promise<DorkResult[]> => {
  try {
    const params: any = {
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
      gl: "mx",
      hl: "es",
    };

    if (location) {
      params.location = location;
    }

    const response = await getJson(params);
    const results = response.organic_results || [];

    return results.map((item: any) => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || "",
      displayLink: new URL(item.link).hostname,
    }));
  } catch (error: any) {
    console.error("Error SerpAPI:", error.message);
    return [];
  }
};