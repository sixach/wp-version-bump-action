import * as core from '@actions/core'
import fs from 'fs'

async function run(): Promise<void> {
  const newVersion = core.getInput('version')
  const filePath = core.getInput('file_path')

  // Check if File Exists
  if (!fs.existsSync(filePath)) {
    core.setFailed(`⚠️ File ${filePath} does not exist`)
  }

  // Valid SemVer
  const regex = new RegExp(/^\d+\.\d+\.\d+$/gm)
  if (regex.test(newVersion)) {
    core.debug('✅ Version Valid')
  } else {
    core.setFailed('❌ Version Invalid')
  }

  // Now things are valid, lets do the thing...
  // Read the file
  fs.readFile(filePath, 'utf8', function (readError, data) {
    if (readError instanceof Error) {
      // If there's an error of some kind then stop execution
      core.setFailed(`⚠️ Could not read the file - ${readError.message}`)
    }

    // Change the version string and save to result var
    const result = data.replace(
      /(\s*?Version:\s+?)\d+\.\d+\.\d+/gm,
      `$1${newVersion}`
    )

    // Write the changes back to the file
    fs.writeFile(filePath, result, 'utf8', function (writeError) {
      if (writeError instanceof Error) {
        core.setFailed(
          `⚠️ Could not write the file to disk - ${writeError.message}`
        )
      }
    })
  })
}

run()
