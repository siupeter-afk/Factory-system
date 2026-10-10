import { DEFAULT_LOCALE, type Locale } from './config.ts';

/**
 * UI chrome strings only. Editorial prose lives in Markdown under
 * src/content/, so that a translator can be handed a folder rather than a
 * TypeScript file.
 *
 * `en` is the source of truth: any key missing from a translation falls back
 * to English rather than rendering a raw dot-key at a visitor.
 */
const en = {
  'site.name': 'Cru Media',
  'site.legalName': 'Cru Media Limited',
  'site.tagline': 'Drinks media and events, Hong Kong',

  'nav.home': 'Home',
  'nav.brands': 'Brands',
  'nav.magazines': 'Magazines',
  'nav.events': 'Events',
  'nav.advertise': 'Advertise & Partner',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.skipToContent': 'Skip to content',

  'locale.switch': 'Language',

  'brand.kind.magazine': 'Magazine',
  'brand.kind.event': 'Event',
  'brand.ownership.own': 'A Cru Media brand',
  'brand.ownership.licensed': 'Licensed for {territory}',
  'brand.viewAll': 'All brands',
  'brands.title': 'Our brands',
  'brands.intro': 'Magazines and events across wine, whisky and bar culture in Hong Kong.',
  'brands.visit': 'Visit site',
  'magazines.intro': 'Our titles and their issue archives.',
  'events.intro': 'Trade and consumer events across the year.',
  'advertise.intro': 'Reach the Hong Kong drinks trade across our magazines and events.',
  'advertise.reach': 'Where your brand appears',
  'advertise.body': 'TODO — supply advertising formats, sponsorship tiers and exhibitor packages.',
  'about.intro': 'Drinks media and events, published and staged from Hong Kong.',
  'about.legalName': 'Registered name',
  'about.registration': 'Company registration',
  'about.address': 'Address',
  'contact.intro': 'Enquiries about advertising, sponsorship, exhibiting and editorial.',

  'issues.title': 'Issues',
  'issues.latest': 'Latest issue',
  'issues.issueNo': 'Issue {number}',
  'issues.archive': 'Issue archive',
  'issues.empty': 'Issues will be listed here.',
  'issues.read': 'Read this issue',

  'events.upcoming': 'Upcoming',
  'events.past': 'Past editions',
  'events.venue': 'Venue',
  'events.date': 'Date',
  'events.tbc': 'To be confirmed',
  'events.tickets': 'Tickets',
  'events.audience.trade': 'Trade only',
  'events.audience.consumer': 'Open to the public',
  'events.audience.trade-and-consumer': 'Trade & public',
  'events.empty': 'Event dates will be listed here.',

  'advertise.title': 'Advertise & Partner',
  'advertise.mediaKit': 'Download the media kit',
  'advertise.enquire': 'Make an enquiry',
  'form.name': 'Name',
  'form.company': 'Company',
  'form.email': 'Email',
  'form.phone': 'Phone',
  'form.interest': 'I am interested in',
  'form.interest.advertising': 'Advertising',
  'form.interest.sponsorship': 'Event sponsorship',
  'form.interest.exhibiting': 'Exhibiting',
  'form.interest.editorial': 'Editorial',
  'form.interest.other': 'Other',
  'form.message': 'Message',
  'form.submit': 'Send enquiry',
  'form.required': 'Required',
  'form.orEmail': 'Or email us directly at',

  'age.title': 'Age verification',
  'age.question': 'Are you of legal drinking age in your country of residence?',
  'age.body':
    'This site covers alcoholic beverages and is intended for those of legal drinking age.',
  'age.confirm': 'Yes, enter',
  'age.deny': 'No',
  'age.denied': 'Sorry — you need to be of legal drinking age to view this site.',
  'age.note': 'Please enjoy responsibly.',

  'footer.responsible': 'Please drink responsibly.',
  'footer.rights': 'All rights reserved.',
  'footer.licensingNote':
    'Whisky Magazine and Whisky Live are used under licence for Hong Kong & Macau.',

  'common.readMore': 'Read more',
  'common.viewAll': 'View all',
  'common.backTo': 'Back to {target}',
  'common.todo': 'Content to be supplied',
  'notfound.title': 'Page not found',
  'notfound.body': 'That page does not exist, or has moved.',
} as const;

export type UIKey = keyof typeof en;

const zhHant: Partial<Record<UIKey, string>> = {
  'site.name': 'Cru Media',
  'site.legalName': 'Cru Media Limited',
  'site.tagline': '香港酒類媒體與活動',

  'nav.home': '首頁',
  'nav.brands': '品牌',
  'nav.magazines': '雜誌',
  'nav.events': '活動',
  'nav.advertise': '廣告及合作',
  'nav.about': '關於我們',
  'nav.contact': '聯絡我們',
  'nav.menu': '選單',
  'nav.close': '關閉',
  'nav.skipToContent': '跳至主要內容',

  'locale.switch': '語言',

  'brand.kind.magazine': '雜誌',
  'brand.kind.event': '活動',
  'brand.ownership.own': 'Cru Media 自有品牌',
  'brand.ownership.licensed': '{territory} 授權',
  'brand.viewAll': '全部品牌',
  'brands.title': '我們的品牌',
  'brands.intro': '涵蓋葡萄酒、威士忌與酒吧文化的雜誌與活動。',
  'brands.visit': '前往網站',
  'magazines.intro': '我們的刊物及過往期數。',
  'events.intro': '全年業界與公眾活動。',
  'advertise.intro': '透過我們的雜誌與活動，接觸香港酒業。',
  'advertise.reach': '您的品牌將出現於',
  'advertise.body': 'TODO — 請提供廣告形式、贊助級別及參展方案。',
  'about.intro': '源自香港的酒類媒體與活動。',
  'about.legalName': '註冊名稱',
  'about.registration': '公司註冊編號',
  'about.address': '地址',
  'contact.intro': '廣告、贊助、參展及編輯相關查詢。',

  'issues.title': '期數',
  'issues.latest': '最新一期',
  'issues.issueNo': '第 {number} 期',
  'issues.archive': '過往期數',
  'issues.empty': '期數將於此列出。',
  'issues.read': '閱讀此期',

  'events.upcoming': '即將舉行',
  'events.past': '過往活動',
  'events.venue': '場地',
  'events.date': '日期',
  'events.tbc': '待確認',
  'events.tickets': '門票',
  'events.audience.trade': '業界專場',
  'events.audience.consumer': '公眾開放',
  'events.audience.trade-and-consumer': '業界及公眾',
  'events.empty': '活動日期將於此列出。',

  'advertise.title': '廣告及合作',
  'advertise.mediaKit': '下載媒體資料',
  'advertise.enquire': '提交查詢',
  'form.name': '姓名',
  'form.company': '公司',
  'form.email': '電郵',
  'form.phone': '電話',
  'form.interest': '我有興趣了解',
  'form.interest.advertising': '廣告',
  'form.interest.sponsorship': '活動贊助',
  'form.interest.exhibiting': '參展',
  'form.interest.editorial': '編輯內容',
  'form.interest.other': '其他',
  'form.message': '訊息',
  'form.submit': '提交查詢',
  'form.required': '必填',
  'form.orEmail': '或直接電郵至',

  'age.title': '年齡確認',
  'age.question': '您是否已達所在地的法定飲酒年齡？',
  'age.body': '本網站內容涉及酒類，僅供已達法定飲酒年齡人士瀏覽。',
  'age.confirm': '是，進入網站',
  'age.deny': '否',
  'age.denied': '抱歉，您須達到法定飲酒年齡才可瀏覽本網站。',
  'age.note': '請適量飲酒。',

  'footer.responsible': '請適量飲酒。',
  'footer.rights': '版權所有。',
  'footer.licensingNote': 'Whisky Magazine 及 Whisky Live 為香港及澳門授權使用。',

  'common.readMore': '閱讀更多',
  'common.viewAll': '查看全部',
  'common.backTo': '返回{target}',
  'common.todo': '內容待提供',
  'notfound.title': '找不到頁面',
  'notfound.body': '此頁面不存在，或已遷移。',
};

const zhHans: Partial<Record<UIKey, string>> = {
  'site.name': 'Cru Media',
  'site.legalName': 'Cru Media Limited',
  'site.tagline': '香港酒类媒体与活动',

  'nav.home': '首页',
  'nav.brands': '品牌',
  'nav.magazines': '杂志',
  'nav.events': '活动',
  'nav.advertise': '广告及合作',
  'nav.about': '关于我们',
  'nav.contact': '联系我们',
  'nav.menu': '菜单',
  'nav.close': '关闭',
  'nav.skipToContent': '跳至主要内容',

  'locale.switch': '语言',

  'brand.kind.magazine': '杂志',
  'brand.kind.event': '活动',
  'brand.ownership.own': 'Cru Media 自有品牌',
  'brand.ownership.licensed': '{territory} 授权',
  'brand.viewAll': '全部品牌',
  'brands.title': '我们的品牌',
  'brands.intro': '涵盖葡萄酒、威士忌与酒吧文化的杂志与活动。',
  'brands.visit': '前往网站',
  'magazines.intro': '我们的刊物及往期内容。',
  'events.intro': '全年业界与公众活动。',
  'advertise.intro': '通过我们的杂志与活动，触达香港酒业。',
  'advertise.reach': '您的品牌将出现于',
  'advertise.body': 'TODO — 请提供广告形式、赞助级别及参展方案。',
  'about.intro': '源自香港的酒类媒体与活动。',
  'about.legalName': '注册名称',
  'about.registration': '公司注册编号',
  'about.address': '地址',
  'contact.intro': '广告、赞助、参展及编辑相关咨询。',

  'issues.title': '期数',
  'issues.latest': '最新一期',
  'issues.issueNo': '第 {number} 期',
  'issues.archive': '往期内容',
  'issues.empty': '期数将在此列出。',
  'issues.read': '阅读本期',

  'events.upcoming': '即将举行',
  'events.past': '往届活动',
  'events.venue': '场地',
  'events.date': '日期',
  'events.tbc': '待确认',
  'events.tickets': '门票',
  'events.audience.trade': '业界专场',
  'events.audience.consumer': '公众开放',
  'events.audience.trade-and-consumer': '业界及公众',
  'events.empty': '活动日期将在此列出。',

  'advertise.title': '广告及合作',
  'advertise.mediaKit': '下载媒体资料',
  'advertise.enquire': '提交咨询',
  'form.name': '姓名',
  'form.company': '公司',
  'form.email': '邮箱',
  'form.phone': '电话',
  'form.interest': '我有兴趣了解',
  'form.interest.advertising': '广告',
  'form.interest.sponsorship': '活动赞助',
  'form.interest.exhibiting': '参展',
  'form.interest.editorial': '编辑内容',
  'form.interest.other': '其他',
  'form.message': '留言',
  'form.submit': '提交咨询',
  'form.required': '必填',
  'form.orEmail': '或直接发送邮件至',

  'age.title': '年龄确认',
  'age.question': '您是否已达所在地的法定饮酒年龄？',
  'age.body': '本网站内容涉及酒类，仅供已达法定饮酒年龄人士浏览。',
  'age.confirm': '是，进入网站',
  'age.deny': '否',
  'age.denied': '抱歉，您须达到法定饮酒年龄才可浏览本网站。',
  'age.note': '请适量饮酒。',

  'footer.responsible': '请适量饮酒。',
  'footer.rights': '版权所有。',
  'footer.licensingNote': 'Whisky Magazine 及 Whisky Live 为香港及澳门授权使用。',

  'common.readMore': '阅读更多',
  'common.viewAll': '查看全部',
  'common.backTo': '返回{target}',
  'common.todo': '内容待提供',
  'notfound.title': '找不到页面',
  'notfound.body': '此页面不存在，或已迁移。',
};

const DICTS: Record<Locale, Partial<Record<UIKey, string>>> = {
  en,
  'zh-hant': zhHant,
  'zh-hans': zhHans,
};

/**
 * Look up a chrome string, falling back to English when a translation is
 * missing. `vars` fills {placeholders}.
 */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    const raw = DICTS[locale]?.[key] ?? en[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}

/** Keys present in `en` but missing from a translation -- surfaced by `npm run check:i18n`. */
export function missingKeys(locale: Locale): UIKey[] {
  if (locale === DEFAULT_LOCALE) return [];
  const dict = DICTS[locale] ?? {};
  return (Object.keys(en) as UIKey[]).filter((k) => !(k in dict));
}
