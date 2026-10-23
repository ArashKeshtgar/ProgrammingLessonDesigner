// The booklets the lessons are grouped into, by their `tag`.
export const BOOKLETS: Record<string, { title: string; fa: string }> = {
  backend: { title: 'Backend', fa: 'بک‌اند: C#، TypeScript، Python و Java کنار هم' },
  frontend: { title: 'Frontend', fa: 'فرانت‌اند: Blazor، Angular، React و Vue کنار هم' },
  docker: { title: 'Docker', fa: 'Docker: بسته‌بندی و اجرای همان چهار سرویس' },
  ops: { title: 'Ops', fa: 'عملیات: راه‌اندازی سرور، انتشار، استقرار، بکاپ و بازگردانی' },
}

// Where the booklet PDFs live. CI prints them next to the site (GitHub Pages); a build
// elsewhere (the VPS) has no PDFs of its own and points at those with VITE_PDF_BASE.
export const PDF_BASE: string = import.meta.env.VITE_PDF_BASE || `${import.meta.env.BASE_URL}pdf/`
