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
  const format = d.format()
  const valueOf = d.valueOf()
  const utcOffset = d.utcOffset()
  const isUTC = d.isUTC()
  const offsets = [0, -240, 120]
  offsets.forEach((offset) => {
    d.utcOffset(offset, true)
    expect(d.format()).toBe(format)
    expect(d.valueOf()).toBe(valueOf)
    expect(d.utcOffset()).toBe(utcOffset)
    expect(d.isUTC()).toBe(isUTC)
  })

  const ud = dayjs.utc('2023-10-29T05:00:00Z')
  const uFormat = ud.format()
  const uValueOf = ud.valueOf()
  offsets.forEach((offset) => {
    ud.utcOffset(offset, true)
    expect(ud.format()).toBe(uFormat)
    expect(ud.valueOf()).toBe(uValueOf)
    expect(ud.utcOffset()).toBe(0)
    expect(ud.isUTC()).toBeTruthy()
  })
})

it('utcOffset keepLocalTime returns a consistent new instance', () => {
  const d = dayjs('2023-10-29T00:00:00+03:00')
  const m = moment('2023-10-29T00:00:00+03:00')
  const offsets = [0, -240, 120]
  offsets.forEach((offset) => {
    const ins = d.utcOffset(offset, true)
    const mins = m.clone().utcOffset(offset, true)

    // keeps the local time and only changes the offset
    expect(ins.format('YYYY-MM-DD HH:mm:ss')).toBe(d.format('YYYY-MM-DD HH:mm:ss'))
    expect(ins.utcOffset()).toBe(offset)
    expect(ins.format()).toBe(mins.format())
    expect(ins.valueOf()).toBe(mins.valueOf())
    expect(ins.toISOString()).toBe(mins.toISOString())

    // the new instance is consistent with its clones
    expect(ins.clone().format()).toBe(ins.format())
    expect(dayjs(ins).format()).toBe(ins.format())
    expect(ins.clone().valueOf()).toBe(ins.valueOf())
    expect(dayjs(ins).valueOf()).toBe(ins.valueOf())
    expect(ins.clone().toISOString()).toBe(ins.toISOString())
    expect(dayjs(ins).toISOString()).toBe(ins.toISOString())
    expect(ins.clone().utcOffset()).toBe(ins.utcOffset())
  })
})

it('utcOffset keepLocalTime from a utc instance', () => {
  const d = dayjs.utc('2023-10-29T05:00:00Z')
  expect(d.utcOffset(0, true).format()).toBe('2023-10-29T05:00:00Z')
  expect(d.utcOffset(120, true).format()).toBe('2023-10-29T05:00:00+02:00')
  expect(d.utcOffset(-240, true).format()).toBe('2023-10-29T05:00:00-04:00')
  expect(d.utcOffset(120, true).utcOffset()).toBe(120)
  expect(d.utcOffset(-240, true).utcOffset()).toBe(-240)
  const ins0 = d.utcOffset(0, true)
  expect(ins0.valueOf()).toBe(Date.UTC(2023, 9, 29, 5, 0, 0))
  expect(ins0.toISOString()).toBe('2023-10-29T05:00:00.000Z')
  expect(ins0.clone().format()).toBe(ins0.format())
  expect(dayjs(ins0).format()).toBe(ins0.format())
  // the original utc instance is not mutated
  expect(d.format()).toBe('2023-10-29T05:00:00Z')
  expect(d.valueOf()).toBe(Date.UTC(2023, 9, 29, 5, 0, 0))
  expect(d.isUTC()).toBeTruthy()
})

it('utcOffset keepLocalTime with a string offset', () => {
  const d = dayjs('2023-10-29T00:00:00+03:00')
  const ins = d.utcOffset('+02:00', true)
  const mins = moment('2023-10-29T00:00:00+03:00').utcOffset('+02:00', true)
  expect(ins.utcOffset()).toBe(120)
  expect(ins.format('YYYY-MM-DD HH:mm:ss')).toBe(d.format('YYYY-MM-DD HH:mm:ss'))
  expect(ins.format()).toBe(mins.format())
  expect(ins.valueOf()).toBe(mins.valueOf())
  expect(ins.clone().format()).toBe(ins.format())
  expect(dayjs(ins).valueOf()).toBe(ins.valueOf())
  expect(d.utcOffset()).not.toBe(120)
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
