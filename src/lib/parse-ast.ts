import ts from 'typescript'

export function isFunctionWithBody(node: ts.Node): boolean {
  switch (node.kind) {
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.Constructor:
      return (node as ts.FunctionExpression).body !== undefined
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
      return true
    default:
      return false
  }
}

export function getName(node: ts.NamedDeclaration): string {
  const { name, pos, end } = node
  const key =
    name !== undefined && ts.isIdentifier(name)
      ? name.text
      : JSON.stringify({ pos, end })
  return key
}
