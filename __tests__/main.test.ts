import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test} from '@jest/globals'

test('Test if action works normally', () => {
  process.env['GITHUB_WORKSPACE'] = './__tests__/testTheme'
  process.env['INPUT_VERSION'] = '1.3.5'
  process.env['INPUT_FILE_PATH'] = './style.css'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
  // Restore GitHub Workspace
  process.env['GITHUB_WORKSPACE'] = '.'
})
