import { readFileSync } from 'fs';
import { join } from 'path';

export class QueryLoader {
  private static queries: Map<string, Map<string, string>> = new Map();

  static loadQueries(filePath: string): Map<string, string> {
    if (this.queries.has(filePath)) {
      return this.queries.get(filePath)!;
    }

    try {
      const fullPath = join(process.cwd(), filePath);
      const content = readFileSync(fullPath, 'utf-8');
      const queryMap = new Map<string, string>();

      // Split by semicolons and clean up
      const queries = content
        .split(';')
        .map(query => query.trim())
        .filter(query => query.length > 0);

      // Extract query names from comments and build query map
      let currentQueryName = '';
      let currentQuery = '';

      queries.forEach(query => {
        const commentMatch = query.match(/^--\s*(.+)$/m);
        if (commentMatch) {
          // Save previous query if exists
          if (currentQueryName && currentQuery) {
            queryMap.set(currentQueryName, currentQuery.trim());
          }
          currentQueryName = commentMatch[1].trim();
          currentQuery = '';
        } else {
          currentQuery += query + '; ';
        }
      });

      // Save the last query
      if (currentQueryName && currentQuery) {
        queryMap.set(currentQueryName, currentQuery.trim());
      }

      this.queries.set(filePath, queryMap);
      return queryMap;
    } catch (error) {
      console.error(`Error loading queries from ${filePath}:`, error);
      return new Map();
    }
  }

  static getQuery(filePath: string, queryName: string): string {
    const queries = this.loadQueries(filePath);
    return queries.get(queryName) || '';
  }

  static reloadQueries(filePath: string): void {
    this.queries.delete(filePath);
    this.loadQueries(filePath);
  }
}
