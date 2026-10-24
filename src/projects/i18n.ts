// The Projects tab is bilingual from the start: every interface string exists in
// both languages, and TypeScript refuses a key that one of them lacks.
export type DocLang = 'fa' | 'en'
export const DOC_LANGS: DocLang[] = ['fa', 'en']

const en = {
  tab: 'Projects',
  title: 'Projects',
  tagline: 'How the portfolio fits together: every project, what it runs and what it talks to.',
  menu: 'Menu',
  overview: 'System map',
  groupServer: 'On the server',
  groupPc: 'On the PC only',
  groupExternal: 'Outside compose',
  groupInfra: 'Infrastructure',
  groupAbout: 'About this site',
  styling: 'How this site is styled',
  previous: 'Previous',
  next: 'Next',
  atGlance: 'At a glance',
  repo: 'Repository',
  runs: 'Runs',
  runsVps: 'on the VPS, built by Control Panel’s compose',
  runsPc: 'on the PC only (a compose profile keeps it off the VPS)',
  runsExternal: 'outside this compose; reached over the network',
  domains: 'Sites',
  public: 'public',
  private: 'behind basic auth',
  services: 'Services',
  service: 'Service',
  kind: 'Kind',
  notes: 'Notes',
  managed: 'controlled from Control Panel as',
  profile: 'profile',
  connections: 'Connections',
  talksTo: 'Talks to',
  usedBy: 'Used by',
  via: 'through',
  none: 'none',
  diagram: 'Its services and their neighbours',
  noWriteup: 'A written guide for this project comes in the next phase; everything above is read from the deployment files.',
  mapHow: 'How this map is made',
  mapHowBody: 'A script reads the files that actually run the portfolio and writes the map; the build fails when the map and those files disagree. Nothing here is drawn by hand.',
  sources: 'Read from',
  legend: 'Legend',
  legendArrow: 'an arrow means “talks to” (calls, reads from, or starts after)',
  legendPc: 'dashed: on the PC only',
  legendExternal: 'dotted: outside compose',
  sites: 'Public face',
  domain: 'Domain',
  project: 'Project',
  access: 'Access',
  example: 'Example',
  copy: 'Copy',
  copied: 'Copied',
  source: 'Source',
  langName: 'English',
  contents: 'Topics',
  contentsIntro: 'This project, part by part. Each topic is one piece of the real code: what it does, why it is written that way, and the code itself.',
  files: 'Files',
  lines: (n: number) => `${n} lines`,
  method: 'Method',
  path: 'Path',
  who: 'Who may call it',
  handler: 'Handler',
  column: 'Column',
  type: 'Type',
  nullable: 'Null',
  yes: 'yes',
  no: 'no',
  denied: 'Denied',
  page: 'Page',
  guards: 'Guards',
  redirectsTo: 'redirects to',
  readFromCode: 'Read from the code itself, not written by hand.',
  accessOf: {
    public: 'anyone',
    'signed-in': 'any signed-in user',
    Admin: 'Admin only',
    internal: 'inside the Docker network only',
  } as Record<string, string>,
  kinds: {
    web: 'web front end',
    service: 'service',
    database: 'database',
    queue: 'message queue',
    proxy: 'proxy',
    job: 'one-off job',
  },
  counts: (n: number) => (n === 1 ? '1 service' : `${n} services`),
}

type Strings = typeof en

const fa: Strings = {
  tab: 'پروژه‌ها',
  title: 'پروژه‌ها',
  tagline: 'اینکه پروژه‌ها چطور کنار هم کار می‌کنند: هر پروژه، چه چیزی اجرا می‌کند و با چه چیزی حرف می‌زند.',
  menu: 'فهرست',
  overview: 'نقشه‌ی کل سیستم',
  groupServer: 'روی سرور',
  groupPc: 'فقط روی PC',
  groupExternal: 'بیرون از compose',
  groupInfra: 'زیرساخت',
  groupAbout: 'درباره‌ی این سایت',
  styling: 'این سایت چطور استایل شده',
  previous: 'قبلی',
  next: 'بعدی',
  atGlance: 'در یک نگاه',
  repo: 'مخزن',
  runs: 'کجا اجرا می‌شود',
  runsVps: 'روی VPS، با compose کنترل پنل ساخته می‌شود',
  runsPc: 'فقط روی PC (یک profile در compose آن را از VPS بیرون نگه می‌دارد)',
  runsExternal: 'بیرون از این compose؛ از طریق شبکه به آن وصل می‌شوند',
  domains: 'سایت‌ها',
  public: 'عمومی',
  private: 'پشت basic auth',
  services: 'سرویس‌ها',
  service: 'سرویس',
  kind: 'نوع',
  notes: 'توضیح',
  managed: 'از کنترل پنل کنترل می‌شود با نام',
  profile: 'profile',
  connections: 'ارتباط‌ها',
  talksTo: 'با این‌ها حرف می‌زند',
  usedBy: 'این‌ها از آن استفاده می‌کنند',
  via: 'از طریق',
  none: 'هیچ',
  diagram: 'سرویس‌هایش و همسایه‌هایشان',
  noWriteup: 'راهنمای نوشته‌شده‌ی این پروژه در مرحله‌ی بعد اضافه می‌شود؛ همه‌ی چیزهای بالا از فایل‌های استقرار خوانده شده‌اند.',
  mapHow: 'این نقشه چطور ساخته می‌شود',
  mapHowBody: 'یک اسکریپت فایل‌هایی را که واقعاً پروژه‌ها را اجرا می‌کنند می‌خواند و نقشه را می‌سازد؛ اگر نقشه با آن فایل‌ها نخواند، build شکست می‌خورد. هیچ چیز اینجا دستی کشیده نشده.',
  sources: 'خوانده‌شده از',
  legend: 'راهنما',
  legendArrow: 'فلش یعنی «با آن حرف می‌زند» (صدا می‌زند، از آن می‌خواند، یا بعد از آن بالا می‌آید)',
  legendPc: 'خط‌چین: فقط روی PC',
  legendExternal: 'نقطه‌چین: بیرون از compose',
  sites: 'رو به اینترنت',
  domain: 'دامنه',
  project: 'پروژه',
  access: 'دسترسی',
  example: 'مثال',
  copy: 'کپی',
  copied: 'کپی شد',
  source: 'منبع',
  langName: 'فارسی',
  contents: 'موضوع‌ها',
  contentsIntro: 'این پروژه، بخش به بخش. هر موضوع یک تکه از کد واقعی است: چه کار می‌کند، چرا این‌طور نوشته شده، و خود کد.',
  files: 'فایل‌ها',
  lines: (n: number) => `${n.toLocaleString('fa-IR')} خط`,
  method: 'متد',
  path: 'مسیر',
  who: 'چه کسی می‌تواند صدا بزند',
  handler: 'متد کد',
  column: 'ستون',
  type: 'نوع',
  nullable: 'Null',
  yes: 'بله',
  no: 'نه',
  denied: 'ممنوع',
  page: 'صفحه',
  guards: 'guardها',
  redirectsTo: 'می‌رود به',
  readFromCode: 'از خود کد خوانده شده، نه دستی نوشته شده.',
  accessOf: {
    public: 'همه',
    'signed-in': 'هر کاربر واردشده',
    Admin: 'فقط Admin',
    internal: 'فقط از داخل شبکه‌ی Docker',
  } as Record<string, string>,
  kinds: {
    web: 'رابط وب',
    service: 'سرویس',
    database: 'دیتابیس',
    queue: 'صف پیام',
    proxy: 'پراکسی',
    job: 'کار یک‌باره',
  },
  counts: (n: number) => `${n.toLocaleString('fa-IR')} سرویس`,
}

export const STRINGS: Record<DocLang, Strings> = { en, fa }

// Text with `code` and **bold** spans, as safe HTML: escaped first, then only
// <code> and <strong> added.
export function inline(text: string): string {
  const escaped = text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
  return escaped.replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const KEY = 'projects-lang'
export function savedLang(): DocLang {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'en' || v === 'fa' ? v : 'fa'
  } catch {
    return 'fa' // storage can be blocked (private mode); the default is fine
  }
}
export function saveLang(lang: DocLang): void {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // not remembered this time
  }
}
