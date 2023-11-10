import {readFile} from 'fs/promises'
import ts, {NamedDeclaration} from 'typescript'
import {isFunctionWithBody, getName} from './parse-ast'

const increasesComplexity = (node: ts.Node): boolean => {
  switch (node.kind) {
    case ts.SyntaxKind.CaseClause:
      return (node as ts.FunctionBody).statements.length > 0
    case ts.SyntaxKind.CatchClause:
    case ts.SyntaxKind.ConditionalExpression:
    case ts.SyntaxKind.DoStatement:
    case ts.SyntaxKind.ForStatement:
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement:
    case ts.SyntaxKind.IfStatement:
    case ts.SyntaxKind.WhileStatement:
      return true

    case ts.SyntaxKind.BinaryExpression:
      switch ((node as ts.BinaryExpression).operatorToken.kind) {
        case ts.SyntaxKind.BarBarToken:
        case ts.SyntaxKind.AmpersandAmpersandToken:
          return true
        default:
          return false
      }

    default:
      return false
  }
}

export function calculateFromSource(
  source: ts.SourceFile
): Record<string, { complexity: number }> {
  let complexity = 0
  const output: Record<string, { complexity: number }> = {}
  ts.forEachChild(source, function cb(node) {
    if (isFunctionWithBody(node)) {
      const old = complexity
      complexity = 1
      ts.forEachChild(node, cb)
      const name = getName(node as NamedDeclaration)
      output[name] = {complexity}
      complexity = old
    } else {
      if (increasesComplexity(node)) {
        complexity += 1
      }
      ts.forEachChild(node, cb)
    }
  })
  return output
}

export async function calculateComplexity(
  filePath: string,
  scriptTarget: ts.ScriptTarget
): Promise<Record<string, { complexity: number }>> {
  const sourceText = await readFile(filePath)
  const source = ts.createSourceFile(
    filePath,
    sourceText.toString(),
    scriptTarget
  )
  return calculateFromSource(source)
}
