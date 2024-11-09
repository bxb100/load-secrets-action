/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as op from '@1password/sdk'

const runMock = jest.spyOn(main, 'run')

let errorMock: jest.SpiedFunction<typeof core.error>
let infoMock: jest.SpiedFunction<typeof core.info>
let outputMock: jest.SpiedFunction<typeof core.setOutput>
let getInputMock: jest.SpiedFunction<typeof core.getBooleanInput>
let setEnvMock: jest.SpiedFunction<typeof core.exportVariable>
let opMock: jest.SpiedFunction<typeof op.createClient>

describe('action', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    outputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    getInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation()
    jest.spyOn(core, 'setFailed').mockImplementation()
    setEnvMock = jest.spyOn(core, 'exportVariable').mockImplementation()
    opMock = jest.spyOn(op, 'createClient').mockResolvedValue({
      secrets: {
        resolve: jest.fn().mockResolvedValue('test-secret')
      },
      items: {
        get: jest.fn().mockImplementation(),
        create: jest.fn().mockImplementation(),
        put: jest.fn().mockImplementation(),
        delete: jest.fn().mockImplementation(),
        listAll: jest.fn().mockImplementation()
      },
      vaults: {
        listAll: jest.fn().mockImplementation()
      }
    })
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('sets the time output', async () => {
    process.env = {
      OP_SERVICE_ACCOUNT_TOKEN: 'test-token',
      OP_MANAGED_VARIABLES: 'test-key',
      test: 'op://test/test-key'
    }

    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'unset_previous':
          return true
        case 'export_env':
          return false
        default:
          return false
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(opMock).toHaveReturned()
    expect(errorMock).not.toHaveBeenCalled()

    // Verify that all the core library functions were called correctly
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Unsetting previous values ...')
    expect(infoMock).toHaveBeenNthCalledWith(2, 'Unsetting test-key')
    expect(setEnvMock).toHaveBeenNthCalledWith(1, 'test-key', '')

    expect(outputMock).toHaveBeenNthCalledWith(1, 'test', 'test-secret')
  })
})
