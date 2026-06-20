import type { ProblemEntry } from '../types'

function create(problem: Omit<ProblemEntry, 'id' | 'createdAt'>): ProblemEntry {
  return {
    ...problem,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
}

function sortByNewest(problems: ProblemEntry[]): ProblemEntry[] {
  return [...problems].sort(
    (firstProblem, secondProblem) =>
      new Date(secondProblem.createdAt).getTime() - new Date(firstProblem.createdAt).getTime(),
  )
}

export const problemService = {
  create,
  sortByNewest,
}
