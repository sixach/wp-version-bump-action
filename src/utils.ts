import * as core from '@actions/core'
import * as path from 'path'
import fs, {writeFileSync} from 'fs'

/**
 * Resolves the file path, relatively to the GITHUB_WORKSPACE
 *
 * @param providedPath {String} Provided path to plugin/theme's file
 * @returns {String} Real path inside the Github workspace
 */
export function retrieveFilePath(providedPath: string): string {
  let githubWorkspacePath = process.env['GITHUB_WORKSPACE']
  if (!githubWorkspacePath) {
    throw new Error('GITHUB_WORKSPACE not defined')
  }
  githubWorkspacePath = path.resolve(githubWorkspacePath)
  core.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`)

  // Resolve path to file
  const filePath = path.resolve(githubWorkspacePath, providedPath)
  core.debug(`file_path = '${filePath}'`)

  // Check if File Exists
  if (!fs.existsSync(filePath)) {
    core.setFailed(`⚠️ File ${filePath} does not exist`)
  }

  return filePath
}

/**
 * Writes the data to the given file
 *
 * @param outputFile {String} Absolute path to target file
 * @param data {String} Content of the file
 */
export function writeOutput(outputFile: string, data: string): void {
  try {
    writeFileSync(outputFile, data, {
      encoding: 'utf8'
    })
  } catch (writeError) {
    if (writeError instanceof Error) {
      core.setFailed(
        `⚠️ Could not write the file to disk - ${writeError.message}`
      )
    }
  }
}
