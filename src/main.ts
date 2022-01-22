import * as core from '@actions/core'
import {retrieveFilePath, validVersion, writeOutput} from './utils'
import fs from 'fs'

async function run(): Promise<void> {
  const newVersion = validVersion(core.getInput('version'))
  const filePath = core.getInput('file_path')
  const realFilePath = retrieveFilePath(filePath)

  // Check if it's a valid SemVer
  if (newVersion) {
    core.debug('✅ Valid SemVer version string provided')
  } else {
    core.setFailed('❌ Invalid SemVer version string provided')
  }

  // Now things are valid, lets do the thing...
  // Read the file
  fs.readFile(realFilePath, 'utf8', (readError, data) => {
    if (readError instanceof Error) {
      // If there's an error of some kind then stop execution
      core.setFailed(`⚠️ Could not read the file - ${readError.message}`)
    }

    // Only if data is not empty
    if (data) {
      // Change the version string and save to result const
      const result = data.replace(
        /(\s*?Version:\s+?)\d+\.\d+\.\d+/gm,
        `$1${newVersion}`
      )

      // Write the changes back to the file
      writeOutput(realFilePath, result)
    } else {
      // It seems like file is empty
      core.setFailed(`⚠️ File is empty, no data been read`)
    }
  })
}

run()
