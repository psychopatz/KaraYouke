const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const apiSearch = async (query, maxResults, page) => {
  try {
    const response = await fetch(`${backendUrl}/search?query=${query}&max_results=${maxResults}&page=${page}`);
    const data = await response.json();
    return {
      results: data.results,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};
