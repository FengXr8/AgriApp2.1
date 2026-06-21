import { Solar } from 'lunar-javascript';

export interface LunarInfo {
  text: string;
  type: 'solarTerm' | 'lunar';
}

export function getCalendarLunarInfo(date: string): LunarInfo {
  const [year, month, day] = date.split('-').map(Number);
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 优先检查节气
  const jieQi = lunar.getJieQi();
  if (jieQi) {
    return {
      text: jieQi,
      type: 'solarTerm',
    };
  }

  // 农历日期
  const lunarDay = lunar.getDay();
  const lunarDayInChinese = lunar.getDayInChinese();

  // 如果是农历初一，显示农历月份
  if (lunarDay === 1) {
    const lunarMonthInChinese = lunar.getMonthInChinese();
    return {
      text: lunarMonthInChinese,
      type: 'lunar',
    };
  }

  // 其他日期显示农历日
  return {
    text: lunarDayInChinese,
    type: 'lunar',
  };
}