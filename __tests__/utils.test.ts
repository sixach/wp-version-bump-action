import {mkdtempSync, existsSync, readFileSync} from 'fs'
import {copy, remove} from 'fs-extra'
import path, {join} from 'path'
import * as core from '@actions/core'
import {tmpdir} from 'os'

import {retrieveFilePath, writeOutput} from '../src/utils'

describe('Utils tests', () => {
  const ORIGINAL_GITHUB_WORKSPACE = process.env['GITHUB_WORKSPACE']
  const ORIGINAL_CWD = process.cwd()
  let workspace: string
  let spyDebug: jest.SpyInstance<void, Parameters<typeof core.debug>>
  let spySetFailed: jest.SpyInstance<void, Parameters<typeof core.setFailed>>

  // Copy test projects into temporary directory
  beforeAll(async () => {
    // Create temporary directory
    workspace = mkdtempSync(join(tmpdir(), 'utils-test'))
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

  describe('Workspace', () => {
    beforeAll(() => {
      delete process.env['GITHUB_WORKSPACE']
    })

    afterAll(() => {
      process.env['GITHUB_WORKSPACE'] = workspace
    })

    it('Throws error if workspace is undefined', async () => {
      expect(() => {
        retrieveFilePath('./testTheme/style.css')
      }).toThrowError(`GITHUB_WORKSPACE not defined`)
    })
  })

  describe('retrieveFilePath()', () => {
    it('Throws error if no file found', async () => {
      retrieveFilePath('./testTheme/nonExistentFile.css')
      const nonExistent = path.join(
        workspace,
        './testTheme/nonExistentFile.css'
      )
      expect(spySetFailed).toBeCalledWith(
        `⚠️ File ${nonExistent} does not exist`
      )
    })

    it('Returns correct file path', () => {
      const expectedPath = path.join(workspace, './testTheme/style.css')
      expect(retrieveFilePath('./testTheme/style.css')).toEqual(expectedPath)
      expect(spyDebug).toBeCalledWith(expect.stringMatching(/^file_path = .*/))
      expect(spySetFailed).not.toBeCalledWith(
        `⚠️ File ${expectedPath} does not exist`
      )
    })
  })

  describe('writeOutput()', () => {
    it('Throws error if file cannot be written', async () => {
      // Try to use empty string as a file name
      writeOutput('', 'FAKE DATA')
      expect(spySetFailed).toBeCalledWith(
        expect.stringMatching(
          /^⚠️ Could not write the file to disk - ENOENT: no such file.*/
        )
      )
    })

    it('Correctly writes data to file', () => {
      // Try to create a dummy file in workspace directory
      const testFile = path.join(workspace, './test.txt')
      writeOutput(testFile, 'FAKE DATA')
      expect(existsSync(testFile)).toBe(true)
      expect(readFileSync(testFile, 'utf-8')).toEqual('FAKE DATA')
    })
  })
})
