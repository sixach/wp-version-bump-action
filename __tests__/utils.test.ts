import {mkdtempSync} from 'fs'
import {copy, remove} from 'fs-extra'
import path, {join} from 'path'
import * as core from '@actions/core'
import {tmpdir} from 'os'

import {retrieveFilePath} from '../src/utils'

describe('Utils tests', () => {
  const ORIGINAL_GITHUB_WORKSPACE = process.env['GITHUB_WORKSPACE']
  const ORIGINAL_CWD = process.cwd()
  let workspace: string
  let spyDebug: jest.SpyInstance<void, Parameters<typeof core.debug>>
  let spySetFailed: jest.SpyInstance<void, Parameters<typeof core.setFailed>>

  // Copy test projects into temporary directory
  beforeAll(async () => {
    // Create temporary directory
    workspace = mkdtempSync(join(tmpdir(), 'version-test'))
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

  describe('For utils', () => {
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
    })
  })
})
