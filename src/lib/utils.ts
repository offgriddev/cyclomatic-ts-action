import ts from 'typescript'
import {readdir} from 'fs/promises'
import { calculateComplexity } from './complexity'
import { Metric } from './types'

// current support only ts
export async function analyzeTypeScriptProject(
  sourceFiles: string[],
  scriptTarget: ts.ScriptTarget
): Promise<Metric[]> {
  const metrics = []
  for (const file of sourceFiles) {
    const result = await calculateComplexity(file, scriptTarget)

    const max = Object.values(result).reduce((prev, cur) => {
      return prev > cur.complexity? prev : cur.complexity
    }, 0)

    metrics.push({
      source: file,
      complexity: max
    })
  }

  return metrics
}

export async function getSourceFolders(folders: string[], includedType: RegExp, excludedType: RegExp): Promise<string[]> {
  let files: string[] = []
  for (const folder of folders) {
    files = files.concat(await getSourceFile(folder, includedType, excludedType))
  }
  return files
}

export async function getSourceFile(
  folder: string,
  includedType: RegExp,
  excludedType: RegExp
): Promise<string[]> {
  let filePaths: string[] = []
  // get contents for folder
  const paths = await readdir(folder, {withFileTypes: true})
  // check if item is a directory

  for (const path of paths) {
    const filePath = `${folder}/${path.name}`

    if (path.isDirectory()) {
      if (path.name.match(/.*node_modules.*|.git|.github/)) continue

      const recursePaths = await getSourceFile(
        `${folder}/${path.name}`,
        includedType,
        excludedType
      )
      filePaths = filePaths.concat(recursePaths)
    } else {
      if (filePath.match(includedType) && !filePath.match(excludedType))
        filePaths.push(filePath)
    }
  }
  return filePaths
}
