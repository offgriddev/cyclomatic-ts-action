import ts from 'typescript'
import {calculateComplexity} from './complexity'

type ComplexityResult = {
  file: string
  report: Record<string, {complexity: number}>
}
// current support only ts
export async function analyzeTypeScript(
  sourceFiles: string[],
  scriptTarget: ts.ScriptTarget
): Promise<ComplexityResult[]> {
  const metrics = []
  for (const filename of sourceFiles) {

    const complexityMeasure = await calculateComplexity(
      filename,
      scriptTarget || ts.ScriptTarget.ES2018
    )

    metrics.push({
      file: filename,
      report: complexityMeasure
    })
  }

  return metrics
}
