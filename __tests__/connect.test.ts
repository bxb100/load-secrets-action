import { Connect } from '../src/api/connect'

describe('connect references regex test', () => {
  it('test suit 1', () => {
    const ref =
      'op://d4472vsddcneis7b4onz4v75nu/Secure Note/weuaijejjhpp2o3em5dtokca2a'
    expect(ref).toMatch(Connect.REGEX)

    const exec = Connect.REGEX.exec(ref)
    expect(exec).not.toBeNull()
    expect(exec?.groups).not.toBeNull()
    expect(exec?.groups?.vault_name).toBe('d4472vsddcneis7b4onz4v75nu')
    expect(exec?.groups?.item_name).toBe('Secure Note')
    expect(exec?.groups?.section_name).toBeUndefined()
    expect(exec?.groups?.field_name).toBe('weuaijejjhpp2o3em5dtokca2a')
  })

  it('test suit 2', () => {
    const ref = 'op://dev/5vtojw237m2cxymfkfhtxsrazm/text'
    expect(ref).toMatch(Connect.REGEX)

    const exec = Connect.REGEX.exec(ref)
    expect(exec).not.toBeNull()
    expect(exec?.groups).not.toBeNull()
    expect(exec?.groups?.vault_name).toBe('dev')
    expect(exec?.groups?.item_name).toBe('5vtojw237m2cxymfkfhtxsrazm')
    expect(exec?.groups?.section_name).toBeUndefined()
    expect(exec?.groups?.field_name).toBe('text')
  })

  it('test suit 3', () => {
    const ref = 'op://dev/5vtojw237m2cxymfkfhtxsrazm/cs/text'
    expect(ref).toMatch(Connect.REGEX)

    const exec = Connect.REGEX.exec(ref)
    expect(exec).not.toBeNull()
    expect(exec?.groups).not.toBeNull()
    expect(exec?.groups?.vault_name).toBe('dev')
    expect(exec?.groups?.item_name).toBe('5vtojw237m2cxymfkfhtxsrazm')
    expect(exec?.groups?.section_name).toBe('cs')
    expect(exec?.groups?.field_name).toBe('text')
  })
})
