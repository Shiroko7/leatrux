import { stemmer } from '$lib/stemmer';

type Note = { content: string; path: string };

let allNotes: Note[] = [];

export const vectorStore = {
  async initialize() {
    try {
      const response = await fetch('/notes-index.json');
      allNotes = await response.json();
    } catch (error) {
      console.error('Failed to load notes:', error);
      throw error;
    }
  },

  async findRelevantContext(query: string): Promise<Note[]> {
    // 1. Preprocess the query
    const queryTerms = query
      .toLowerCase()
      .split(/\W+/) // Split into words
      .map(term => stemmer(term))
      .filter(term => term.length > 2); // Ignore short terms

    if (queryTerms.length === 0) return [];

    return allNotes
      .map(note => {
        // 2. Preprocess note content and path
        const contentStems = note.content
          .toLowerCase()
          .split(/\W+/)
          .map(stemmer);
          
        const pathStems = note.path
          .toLowerCase()
          .split('/')
          .flatMap(part => part.split(/\W+/))
          .map(stemmer);

        // 3. Calculate relevance score
        let score = 0;
        
        queryTerms.forEach(term => {
          // Boost matches in filename/path
          if (pathStems.includes(term)) score += 3;
          
          // Count occurrences in content
          const contentCount = contentStems.filter(t => t === term).length;
          score += contentCount;
          
          // Bonus for exact phrase match
          if (note.content.toLowerCase().includes(query.toLowerCase())) {
            score += 5;
          }
        });

        return { note, score };
      })
      // 4. Filter and sort results
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ note }) => note);
  }

};
