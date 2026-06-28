import { getSolarTerms, getSolarTermsInRange } from 'chinese-days';
import type { SolarTerm } from 'chinese-days';
import type { SolarTermInfo } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const FARMING_TIPS: Record<string, string> = {
  小寒: '小寒时节注意防寒保墒，设施作物加强夜间保温，露地作物可检查越冬苗情。',
  大寒: '大寒重在防冻护根，做好棚室通风与保温平衡，并提前规划春耕物资。',
  立春: '立春后气温回升，适合检查土壤墒情，逐步开展育苗、整地和春播准备。',
  雨水: '雨水增多，田间要清沟理墒，防止低洼地积水影响根系。',
  惊蛰: '惊蛰后虫害开始活跃，应加强田间巡查，及时做好病虫害早防早治。',
  春分: '春分昼夜均衡，作物进入旺长期，注意追肥、浇水和苗情调控。',
  清明: '清明前后适合播种移栽，要根据降雨和温度安排春播进度。',
  谷雨: '谷雨雨热增加，适合补墒促苗，同时注意湿度升高带来的病害风险。',
  立夏: '立夏后作物生长加快，应加强水肥管理，关注高温和强对流天气。',
  小满: '小满时节籽粒渐满，麦类作物要防干热风，蔬果作物注意稳水稳肥。',
  芒种: '芒种农事繁忙，成熟作物及时抢收，夏播作物趁墒抢种。',
  夏至: '夏至日照强、雨水多，注意排涝降温，水肥管理宜少量多次。',
  小暑: '小暑高温渐盛，田间重点防暑、防旱、防病虫，灌溉避开正午。',
  大暑: '大暑是一年高温高湿期，注意通风降温、排水防涝和病虫害监测。',
  立秋: '立秋后昼夜温差增大，适合加强秋作物后期管理，促进籽粒灌浆。',
  处暑: '处暑暑气渐退，应抓好秋收前管理，晚熟作物注意防早霜和倒伏。',
  白露: '白露后露水增多，病害易发生，应保持田间通风，适时采收成熟作物。',
  秋分: '秋分是秋收秋种关键期，成熟作物及时收获，越冬作物做好播前整地。',
  寒露: '寒露气温下降，露地作物注意防寒，设施栽培可逐步加强保温。',
  霜降: '霜降前后需防霜冻，及时采收不耐寒作物，并做好越冬田块管理。',
  立冬: '立冬后作物进入越冬管理期，注意覆盖保温、控水控肥和清园消毒。',
  小雪: '小雪时节低温增强，设施农业注意棚膜检查和夜间保温。',
  大雪: '大雪后防寒防雪压是重点，及时加固棚架，减少冻害风险。',
  冬至: '冬至后进入数九寒天，田间以保温护苗、蓄水保墒和病源清理为主。',
};

export function getSolarTermInfo(date?: Date): SolarTermInfo {
  const targetDate = startOfDay(date || new Date());
  const targetDateText = formatDate(targetDate);
  const currentFromRange = getSolarTermsInRange(targetDateText, targetDateText)[0];
  const yearlyTerms = getTermsForYears(targetDate.getFullYear() - 1, targetDate.getFullYear() + 1);
  const currentIndex = currentFromRange
    ? yearlyTerms.findIndex(term => term.date === findTermStartDate(currentFromRange, yearlyTerms))
    : findCurrentTermIndex(targetDate, yearlyTerms);
  const currentTerm = yearlyTerms[Math.max(currentIndex, 0)];
  const nextTerm = yearlyTerms[currentIndex + 1] || getTermsForYear(targetDate.getFullYear() + 2)[0];
  const currentStartDate = currentTerm.date;
  const currentEndDate = formatDate(addDays(parseDate(nextTerm.date), -1));

  return {
    currentTerm: {
      name: currentTerm.name,
      startDate: currentStartDate,
      endDate: currentEndDate,
      dateRange: `${formatMonthDay(currentStartDate)} - ${formatMonthDay(currentEndDate)}`,
      dayIndex: currentFromRange?.index,
      farmingTip: FARMING_TIPS[currentTerm.name] || `${currentTerm.name}时节注意结合天气变化安排田间管理。`,
    },
    nextTerm: {
      name: nextTerm.name,
      date: nextTerm.date,
      daysUntil: daysBetween(targetDate, parseDate(nextTerm.date)),
    },
  };
}

export function getCurrentSolarTerm(date?: Date): string {
  return getSolarTermInfo(date).currentTerm.name;
}

export function getNextSolarTerm(date?: Date): { name: string; daysUntil: number } {
  const { nextTerm } = getSolarTermInfo(date);
  return { name: nextTerm.name, daysUntil: nextTerm.daysUntil };
}

export function getSolarTermProverb(termName: string): string {
  return FARMING_TIPS[termName] || '';
}

function getTermsForYear(year: number): SolarTerm[] {
  return getSolarTerms(`${year}-01-01`, `${year}-12-31`);
}

function getTermsForYears(startYear: number, endYear: number): SolarTerm[] {
  const terms: SolarTerm[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    terms.push(...getTermsForYear(year));
  }
  return terms.sort((a, b) => a.date.localeCompare(b.date));
}

function findCurrentTermIndex(date: Date, terms: SolarTerm[]): number {
  const targetDateText = formatDate(date);
  for (let index = terms.length - 1; index >= 0; index -= 1) {
    if (terms[index].date <= targetDateText) {
      return index;
    }
  }
  return 0;
}

function findTermStartDate(termOfDay: SolarTerm, terms: SolarTerm[]): string {
  const matched = [...terms].reverse().find(term => term.term === termOfDay.term && term.date <= termOfDay.date);
  return matched?.date || termOfDay.date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(dateText: string): Date {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.ceil((startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_PER_DAY));
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthDay(dateText: string): string {
  const date = parseDate(dateText);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
