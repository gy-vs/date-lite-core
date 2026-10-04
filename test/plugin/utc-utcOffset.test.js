import MockDate from 'mockdate'
import moment from 'moment'
import dayjs from '../../src'
import utc from '../../src/plugin/utc'

dayjs.extend(utc)

beforeEach(() => {
  MockDate.set(new Date())
})

afterEach(() => {
  MockDate.reset()
})

it('Set utcOffset -> Get utcOffset', () => {
  expect(dayjs().utcOffset(540).utcOffset()).toBe(moment().utcOffset(540).utcOffset())
  expect(dayjs().utcOffset(540).format()).toBe(moment().utcOffset(540).format())
  expect(dayjs().utcOffset(60).format()).toBe(moment().utcOffset(60).format())
  expect(dayjs().utcOffset(8).format()).toBe(moment().utcOffset(8).format())

  expect(dayjs().utcOffset(-540).utcOffset()).toBe(moment().utcOffset(-540).utcOffset())
  expect(dayjs().utcOffset(-540).format()).toBe(moment().utcOffset(-540).format())

  expect(dayjs().utcOffset(-60).format()).toBe(moment().utcOffset(-60).format())
  expect(dayjs().utcOffset(-8).format()).toBe(moment().utcOffset(-8).format())
})

it('valueOf, toDate, toString, toISOString should be the same as original', () => {
  const d = dayjs()
  const du = dayjs().utcOffset(9)
  const mu = moment().utcOffset(9)
  expect(d.valueOf()).toBe(du.valueOf())
  expect(du.valueOf()).toBe(mu.valueOf())
  expect(d.toDate()).toEqual(du.toDate())
  expect(du.toDate()).toEqual(mu.toDate())
  expect(du.toISOString()).toEqual(mu.toISOString())
  expect(d.toString()).toEqual(d.toString())
})

it('clone', () => {
  const du = dayjs().utcOffset(9)
  const duClone = du.clone()
  expect(du.valueOf()).toBe(duClone.valueOf())
  expect(du.format()).toBe(duClone.format())
  expect(du.utcOffset()).toBe(duClone.utcOffset())
})

it('immutable', () => {
  const d = dayjs()
  const du = d.utcOffset(d.utcOffset() + 1)
  expect(d.utcOffset()).not.toBe(du.utcOffset())
  expect(d.format()).not.toBe(du.format())
})

it('utcOffset(0) enable utc mode', () => {
  expect(dayjs().utcOffset(0).format()).toBe(moment().utcOffset(0).format())
  expect(dayjs().utcOffset(0).isUTC()).toBeTruthy()
})

it('utcOffset keepLocalTime', () => {
  const d = '2000-01-01T06:00:00Z'
  expect(dayjs.utc(d).utcOffset(5, true).format())
    .toBe(moment.utc(d).utcOffset(5, true).format())
  expect(dayjs.utc(d).utcOffset(0, true).format())
    .toBe(moment.utc(d).utcOffset(0, true).format())
  expect(dayjs.utc(d).utcOffset(-5, true).format())
    .toBe(moment.utc(d).utcOffset(-5, true).format())
  const d2 = '2016-01-01 00:00:00'
  expect(dayjs(d2).utcOffset(0, true).format())
    .toBe(moment(d2).utcOffset(0, true).format())
  expect(dayjs(d2).utcOffset(-5, true).format())
    .toBe(moment(d2).utcOffset(-5, true).format())
  expect(dayjs(d2).utcOffset(5, true).format())
    .toBe(moment(d2).utcOffset(5, true).format())
})

it('utcOffset keepLocalTime does not mutate the original instance', () => {
  const d = dayjs('2023-10-29T00:00:00+03:00')
  const before = d.format()
  const offsets = [0, -240, 120, -480, 480, 8, -8]
  offsets.forEach((input) => {
    const original = dayjs('2023-10-29T00:00:00+03:00')
    original.utcOffset(input, true)
    expect(original.format()).toBe(before)
    expect(original.valueOf()).toBe(dayjs('2023-10-29T00:00:00+03:00').valueOf())
  })
  // UTC-mode source stays in UTC mode
  const u = dayjs.utc('2000-01-01T06:00:00Z')
  u.utcOffset(5, true)
  expect(u.isUTC()).toBeTruthy()
  expect(u.format()).toBe('2000-01-01T06:00:00Z')
})

it('utcOffset keepLocalTime produces a coherent instance matching moment', () => {
  const inputs = [
    dayjs('2023-10-29T00:00:00+03:00'),
    dayjs.utc('2000-01-01T06:00:00Z'),
    dayjs('2016-01-01 00:00:00'),
    dayjs('2023-10-29T00:00:00+03:00').utcOffset(-5)
  ]
  const momentInputs = [
    moment('2023-10-29T00:00:00+03:00'),
    moment.utc('2000-01-01T06:00:00Z'),
    moment('2016-01-01 00:00:00'),
    moment('2023-10-29T00:00:00+03:00').utcOffset(-5)
  ]
  const testOffsets = [0, -240, 120, -480, 480, 8, -8]
  testOffsets.forEach((offset) => {
    inputs.forEach((input, index) => {
      const localHour = input.hour()
      const localDate = input.date()
      const result = input.utcOffset(offset, true)
      const expected = momentInputs[index].utcOffset(offset, true)
      // keeps the local wall-clock time, only swaps the offset
      expect(result.hour()).toBe(localHour)
      expect(result.date()).toBe(localDate)
      expect(result.utcOffset()).toBe(expected.utcOffset())
      // same instant as moment
      expect(result.valueOf()).toBe(expected.valueOf())
      expect(result.format()).toBe(expected.format())
      // format/valueOf/toISOString agree with clone() and dayjs(result)
      const copies = [result.clone(), dayjs(result)]
      copies.forEach((copy) => {
        expect(copy.format()).toBe(result.format())
        expect(copy.valueOf()).toBe(result.valueOf())
        expect(copy.toISOString()).toBe(result.toISOString())
        expect(copy.utcOffset()).toBe(result.utcOffset())
      })
      expect(result.toDate()).toEqual(result.clone().toDate())
    })
  })
})

it('utcOffset(0, true) returns a coherent UTC instance', () => {
  const result = dayjs('2023-10-29T00:00:00+03:00').utcOffset(0, true)
  const expected = moment('2023-10-29T00:00:00+03:00').utcOffset(0, true)
  expect(result.isUTC()).toBeTruthy()
  expect(result.format()).toBe(expected.format())
  expect(result.toISOString()).toBe(expected.toISOString())
  expect(result.valueOf()).toBe(expected.valueOf())
  expect(result.format()).toBe(result.clone().format())
  expect(result.toISOString()).toBe(result.clone().toISOString())
  expect(result.format()).toBe(dayjs(result).format())
})

it('utcOffset keepLocalTime is chainable', () => {
  const d = dayjs('2023-10-29T00:00:00+03:00')
  const result = d.utcOffset(0, true).utcOffset(5, true)
  const expected = moment('2023-10-29T00:00:00+03:00')
    .utcOffset(0, true).utcOffset(5, true)
  expect(result.format()).toBe(expected.format())
  expect(result.valueOf()).toBe(expected.valueOf())
  expect(result.hour()).toBe(d.hour())
})

it('utcOffset keepLocalTime after switching to UTC keeps the local wall time', () => {
  const time = '2021-02-28 19:40:10'
  const hoursOffsets = [-8, 8, 0]
  hoursOffsets.forEach((hoursOffset) => {
    const result = dayjs(time).utc().utcOffset(hoursOffset * 60, true)
    const expected = moment(time).utc(true).utcOffset(hoursOffset, true)
    // The original local wall time is preserved with the new offset
    expect(result.hour()).toBe(19)
    expect(result.utcOffset()).toBe(hoursOffset * 60)
    expect(result.format()).toBe(expected.format())
    expect(result.valueOf()).toBe(expected.valueOf())
    expect(result.toISOString()).toBe(expected.toISOString())
    // copies stay consistent
    expect(result.clone().toISOString()).toBe(result.toISOString())
    expect(dayjs(result).toISOString()).toBe(result.toISOString())
    expect(result.clone().format()).toBe(result.format())
  })
})

test('UTC mode', () => {
  const d = dayjs.utc('2000-01-01T06:00:00Z')
  expect(d.isUTC()).toBeTruthy()
  expect(d.utcOffset(0).isUTC()).toBeTruthy()
  expect(d.utcOffset(1).isUTC()).toBeFalsy()
})

test('change hours when changing the utc offset in UTC mode', () => {
  const d = dayjs.utc('2000-01-01T06:31:00Z')
  expect(d.hour()).toBe(6)
  expect(d.utcOffset(0).hour()).toBe(6)
  expect(d.utcOffset(-60).hour()).toBe(5)
  expect(d.utcOffset(60).hour()).toBe(7)
  expect(d.utcOffset(-30).format('HH:mm')).toBe('06:01')
  expect(d.utcOffset(30).format('HH:mm')).toBe('07:01')
  expect(d.utcOffset(-1380).format('HH:mm')).toBe('07:31')
})

test('correctly set and add hours in offset mode', () => {
  const d10 = dayjs('2000-01-30T06:31:00+10:00').utcOffset(10)
  const dm8 = dayjs('2000-01-30T06:31:00-08:00').utcOffset(-8)

  expect(d10.hour(5).hour()).toBe(5)
  expect(d10.hour(5).add(1, 'hour').hour()).toBe(6)
  expect(d10.hour(5).add(-10, 'hour').hour()).toBe(19)

  expect(dm8.hour(5).hour()).toBe(5)
  expect(dm8.hour(5).add(1, 'hour').hour()).toBe(6)
  expect(dm8.hour(5).add(-10, 'hour').hour()).toBe(19)
})

test('keep hours when adding month in offset mode', () => {
  const d10 = dayjs('2000-01-30T06:31:00+10:00').utcOffset(10)
  const dm8 = dayjs('2000-01-30T06:31:00-08:00').utcOffset(-8)

  expect(d10.add(1, 'month').hour()).toBe(6)
  expect(dm8.add(1, 'month').hour()).toBe(6)

  expect(d10.add(-2, 'month').hour()).toBe(6)
  expect(dm8.add(-2, 'month').hour()).toBe(6)
})

test('utc costrustor', () => {
  const d = new Date(2019, 8, 11, 0, 0, 0).getTime()
  expect(moment(d).utc().utcOffset(480).valueOf())
    .toBe(dayjs(d).utc().utcOffset(480).valueOf())

  expect(moment(d).utc().local()
    .utcOffset(480)
    .valueOf())
    .toBe(dayjs(d).utc().local()
      .utcOffset(480)
      .valueOf())
})

test('utc startOf', () => {
  const d = new Date(2019, 8, 11, 0, 0, 0, 0).getTime()
  expect(moment(d).utc().utcOffset(480).endOf('day')
    .valueOf())
    .toBe(dayjs(d).utc().utcOffset(480).endOf('day')
      .valueOf())

  expect(moment(d).utc().utcOffset(480).endOf('day')
    .valueOf())
    .toBe(dayjs(d).utc().utcOffset(480).endOf('day')
      .valueOf())
  const d2 = '2017-07-20T11:00:00+00:00'
  const d2d = dayjs(d2).utcOffset(-12).startOf('day').valueOf()
  const d2m = moment(d2).utcOffset(-12).startOf('day').valueOf()
  expect(d2d)
    .toBe(d2m)
  expect(d2d)
    .toBe(1500465600000)
})
