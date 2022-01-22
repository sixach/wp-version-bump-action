import {mkdtempSync, existsSync, readFileSync} from 'fs'
import {copy, remove} from 'fs-extra'
import path, {join} from 'path'
import * as cp from 'child_process'
import * as process from 'process'
import * as core from '@actions/core'
import {tmpdir} from 'os'

describe('Main tests', () => {
  const ORIGINAL_GITHUB_WORKSPACE = process.env['GITHUB_WORKSPACE']
  const ORIGINAL_CWD = process.cwd()
  let workspace: string
  let spyDebug: jest.SpyInstance<void, Parameters<typeof core.debug>>
  let spySetFailed: jest.SpyInstance<void, Parameters<typeof core.setFailed>>

  // Copy test projects into temporary directory
  beforeAll(async () => {
    // Create temporary directory
    workspace = mkdtempSync(join(tmpdir(), 'main-test'))
    // Copy all the projects
    await copy(join(__dirname, 'projects'), workspace)
    // Change directory
    process.chdir(workspace)

    // This hack is necessary because @actions/glob ignores files not in the GITHUB_WORKSPACE
    // https://git.io/Jcxig
    process.env['GITHUB_WORKSPACE'] = workspace
  })

  beforeEach(() => {
    spyDebug = jest.spyOn(core, 'debug')
    spyDebug.mockImplementation(() => null)

    spySetFailed = jest.spyOn(core, 'setFailed')
    spySetFailed.mockImplementation(() => null)
  })

  afterAll(() => {
    process.chdir(ORIGINAL_CWD)
    process.env['GITHUB_WORKSPACE'] = ORIGINAL_GITHUB_WORKSPACE
    remove(workspace)
  })

  describe('run()', () => {
    it('Test if action works normally for theme', async () => {
      const testFile = path.join(workspace, './testTheme/style.css')
      const modifiedFile = path.join(workspace, './testTheme/modified.css')
      process.env['INPUT_VERSION'] = '1.10.6'
      process.env['INPUT_FILE_PATH'] = './testTheme/style.css'
      const np = process.execPath
      const ip = path.join(__dirname, '..', 'lib', 'main.js')
      const options: cp.ExecFileSyncOptions = {
        env: process.env
      }
      console.log(cp.execFileSync(np, [ip], options).toString())
      expect(existsSync(testFile)).toBe(true)
      expect(readFileSync(testFile, 'utf-8')).toEqual(
        readFileSync(modifiedFile, 'utf-8')
      )
    })

    it('Test if action works normally for plugin', async () => {
      const testFile = path.join(workspace, './testPlugin/plugin.php')
      const modifiedFile = path.join(workspace, './testPlugin/modified.php')
      process.env['INPUT_VERSION'] = '2.10.6'
      process.env['INPUT_FILE_PATH'] = './testPlugin/plugin.php'
      const np = process.execPath
      const ip = path.join(__dirname, '..', 'lib', 'main.js')
      const options: cp.ExecFileSyncOptions = {
        env: process.env
      }
      console.log(cp.execFileSync(np, [ip], options).toString())
      expect(existsSync(testFile)).toBe(true)
      expect(readFileSync(testFile, 'utf-8')).toEqual(
        readFileSync(modifiedFile, 'utf-8')
      )
    })
  })
})
