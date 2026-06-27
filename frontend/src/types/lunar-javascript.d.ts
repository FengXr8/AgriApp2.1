declare module 'lunar-javascript' {
  export const Solar: {
    fromYmd(year: number, month: number, day: number): SolarInstance;
  };

  interface SolarInstance {
    getLunar(): LunarInstance;
  }

  interface LunarInstance {
    getJieQi(): string;
    getDayInChinese(): string;
    getMonthInChinese(): string;
    getDay(): number;
  }
}