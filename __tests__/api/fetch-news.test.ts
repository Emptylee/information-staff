import fetchMock from "jest-fetch-mock";

process.env.VITE_TAVILY_API_KEY = 'test-api-key'; // Mock environment variable
import handler from "../../api/fetch-news";
import { createMocks } from "node-mocks-http";

import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();
fetchMock.resetMocks();
fetchMock.mockResponse(JSON.stringify({ results: [{ published_date: new Date().toISOString(), content: 'Mock Content' }] }));
fetchMock.mockResponse();

describe("API Fetch News", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("filters results by the last 48 hours", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { name: "test" },
    });

    fetchMock.mockResponse(/^https:\/\/api\.tavily\.com\/search/, async (req) => {
      return JSON.stringify({ results: [{ published_date: new Date().toISOString(), content: 'Mock Content' }] });
    });

    fetchMock.mockResponseOnce(
      JSON.stringify({
        results: [
          { published_date: new Date().toISOString(), content: "valid content" },
          { published_date: "", content: "old content" },
        ],
      })
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.results).toHaveLength(1);
  });

  it("caches results for duplicate requests", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { name: "duplicate" },
    });

    fetchMock.mockResponse(/^https:\/\/api\.tavily\.com\/search/, async (req) => {
      return JSON.stringify({ results: [{ published_date: new Date().toISOString(), content: 'Mock Content' }] });
    });

    fetchMock.mockResponseOnce(
      JSON.stringify({ results: [{ published_date: new Date().toISOString(), content: "content" }] })
    );

    // First call to populate cache
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);

    // Reset mocks to cover cache logic
    fetchMock.resetMocks();
    const { res: cachedRes } = createMocks({
      method: "POST",
      body: { name: "duplicate" },
    });
    await handler(req, cachedRes);

    expect(cachedRes._getStatusCode()).toBe(200);
    const cachedData = JSON.parse(cachedRes._getData());
    expect(cachedData.results).toHaveLength(1);
  });

  it("returns error for Tavily API failure", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { name: "api error" },
    });

    fetchMock.mockReject(() => Promise.reject("API is down"));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const error = JSON.parse(res._getData());
    expect(error.error).toContain("Failed to fetch news");
  });
});