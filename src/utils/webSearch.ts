import { WebSearch } from 'langchain/tools/web_search';

class WebSearchUtil {
  private webSearch: WebSearch;

  constructor() {
    this.webSearch = new WebSearch({
      apiKey: process.env.BING_SEARCH_API_KEY,
      limit: 10
    });
  }

  async search(query: string): Promise<string> {
    try {
      const results = await this.webSearch.invoke(query);
      return results;
    } catch (error) {
      console.error(`Web search error: ${(error as Error).message}`);
      throw error;
    }
  }
}

export default WebSearchUtil;