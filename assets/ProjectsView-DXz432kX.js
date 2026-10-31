import{d as q,o as a,c as o,a as n,t,F as v,r as A,n as I,f as O,l as S,e as b,S as V,k as Q,m as _n,p as Tn,u as y,q as J,s as L,v as se,x as ge,y as C,z as $n,b as F,w as D,R as H,A as An,C as K,D as Sn,E as xn,G as Pn,H as jn,I as Cn,J as En,h as On,K as Rn}from"./index-BdjNq_hB.js";const In={class:"data-table"},Ln={key:0,class:"doc-table-wrap"},Dn={class:"doc-table"},Hn={dir:"ltr"},Wn={dir:"ltr"},Fn={dir:"ltr"},Mn={class:"muted"},zn={key:0,dir:"ltr"},Vn={key:1,dir:"ltr"},qn={class:"doc-table-wrap"},Bn={class:"doc-table"},Nn={dir:"ltr"},Qn={dir:"ltr"},Un={dir:"ltr"},Gn={key:2,class:"muted"},Kn={key:3,class:"muted"},Jn={key:4,class:"muted"},Yn={key:5,class:"muted"},Xn={key:2,class:"doc-table-wrap"},Zn={class:"doc-table"},et={dir:"ltr"},nt={key:0,dir:"ltr"},tt={key:1},at={dir:"ltr"},st={dir:"ltr"},ot={class:"data-note"},it=q({__name:"DataTable",props:{data:{},code:{},lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]),c=d=>!i.data.only||i.data.only.includes(d),l=b(()=>i.code.endpoints.filter(d=>c(d.area))),w=b(()=>i.code.tables.filter(d=>c(d.table)));return(d,h)=>(a(),o("div",In,[e.data.kind==="endpoints"?(a(),o("div",Ln,[n("table",Dn,[n("thead",null,[n("tr",null,[n("th",null,t(s.value.method),1),n("th",null,t(s.value.path),1),n("th",null,t(s.value.who),1),n("th",null,t(s.value.source),1)])]),n("tbody",null,[(a(!0),o(v,null,A(l.value,r=>(a(),o("tr",{key:r.method+r.path+r.area},[n("td",Hn,[n("span",{class:I(["http",`http-${r.method.toLowerCase()}`])},t(r.method),3)]),n("td",Wn,[n("code",null,t(r.path),1)]),n("td",null,t(s.value.accessOf[r.access]??r.access),1),n("td",Fn,[n("code",Mn,t(r.handler?`${r.handler}() `:"")+t(r.file.split("/").at(-1))+":"+t(r.line),1)])]))),128))])])])):e.data.kind==="tables"?(a(!0),o(v,{key:1},A(w.value,r=>{var f,m,k;return a(),o("div",{key:r.table,class:"sql-table"},[r.provider?(a(),o("h3",zn,t(r.database)+" · "+t(r.table),1)):(a(),o("h3",Vn,t(r.database)+"."+t(r.schema??"dbo")+"."+t(r.table),1)),n("div",qn,[n("table",Bn,[n("thead",null,[n("tr",null,[n("th",null,t(r.provider==="mongodb"?s.value.field:s.value.column),1),n("th",null,t(s.value.type),1),n("th",null,t(s.value.nullable),1),n("th",null,t(s.value.notes),1)])]),n("tbody",null,[(a(!0),o(v,null,A(r.columns,p=>(a(),o("tr",{key:p.name},[n("td",Nn,[n("code",null,t(p.name),1)]),n("td",Qn,[n("code",null,t(p.type),1)]),n("td",null,t(p.nullable===null?"—":p.nullable?s.value.yes:s.value.no),1),n("td",Un,[(a(!0),o(v,null,A(p.notes,T=>(a(),o("code",{key:T,class:"note"},t(T),1))),128))])]))),128))])])]),(f=r.checks)!=null&&f.length?(a(),o("p",Gn,[O(t(s.value.checks)+": ",1),(a(!0),o(v,null,A(r.checks,p=>(a(),o("code",{key:p,dir:"ltr",class:"note"},t(p),1))),128))])):S("",!0),(m=r.uniques)!=null&&m.length?(a(),o("p",Kn,[O(t(s.value.uniques)+": ",1),(a(!0),o(v,null,A(r.uniques,p=>(a(),o("code",{key:p,dir:"ltr",class:"note"},t(p),1))),128))])):S("",!0),(k=r.indexes)!=null&&k.length?(a(),o("p",Jn,[O(t(s.value.indexes)+": ",1),(a(!0),o(v,null,A(r.indexes,p=>(a(),o("code",{key:p,dir:"ltr",class:"note"},t(p),1))),128))])):S("",!0),r.denies.length?(a(),o("p",Yn,[O(t(s.value.denied)+": ",1),(a(!0),o(v,null,A(r.denies,p=>(a(),o("code",{key:p,dir:"ltr"},t(p),1))),128))])):S("",!0)])}),128)):e.data.kind==="routes"?(a(),o("div",Xn,[n("table",Zn,[n("thead",null,[n("tr",null,[n("th",null,t(s.value.path),1),n("th",null,t(s.value.page),1),n("th",null,t(s.value.guards),1)])]),n("tbody",null,[(a(!0),o(v,null,A(e.code.routes,r=>(a(),o("tr",{key:r.path},[n("td",et,[n("code",null,t(r.path),1)]),n("td",null,[r.component?(a(),o("code",nt,t(r.component),1)):(a(),o("span",tt,[O(t(s.value.redirectsTo)+" ",1),n("code",at,t(r.redirect),1)]))]),n("td",st,[(a(!0),o(v,null,A(r.guards,f=>(a(),o("code",{key:f,class:"note"},t(f),1))),128))])]))),128))])])])):S("",!0),n("p",ot,t(s.value.readFromCode),1)]))}}),rt=`@use 'sass:color';
@use 'sass:map';
@use 'sass:math';
@use 'tokens';

// #region contrast
// WCAG 2 relative luminance of one sRGB channel (0-255).
@function -linear($channel) {
  $c: math.div($channel, 255);

  @if $c <= 0.04045 {
    @return math.div($c, 12.92);
  }

  @return math.pow(math.div($c + 0.055, 1.055), 2.4);
}

@function luminance($color) {
  $r: -linear(color.channel($color, 'red', $space: rgb));
  $g: -linear(color.channel($color, 'green', $space: rgb));
  $b: -linear(color.channel($color, 'blue', $space: rgb));

  @return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
}

// Contrast ratio between two colours, 1 to 21.
@function contrast($a, $b) {
  $la: luminance($a) + 0.05;
  $lb: luminance($b) + 0.05;

  @return math.div(math.max($la, $lb), math.min($la, $lb));
}

// Stops the build when two colours that carry text are too close.
@function require-contrast($fg, $bg, $min, $what) {
  $ratio: contrast($fg, $bg);

  @if $ratio < $min {
    @error '#{$what}: contrast #{math.div(math.round($ratio * 100), 100)} is below #{$min}.';
  }

  @return $ratio;
}

// #endregion

// A token by name; an unknown name is a build error, not a silent empty value.
@function -lookup($map, $key, $what) {
  @if not map.has-key($map, $key) {
    @error 'Unknown #{$what} "#{$key}". Known: #{map.keys($map)}.';
  }

  @return map.get($map, $key);
}

@function radius($size) {
  @return -lookup(tokens.$radius, $size, 'radius');
}

@function bp($name) {
  @return -lookup(tokens.$breakpoints, $name, 'breakpoint');
}

@function font($name) {
  @return -lookup(tokens.$fonts, $name, 'font');
}

@function layout($name) {
  @return -lookup(tokens.$layout, $name, 'layout size');
}

@function print-color($name) {
  @return -lookup(tokens.$print, $name, 'print colour');
}
`,lt=`// One import for every partial: @use '../abstracts' as *;
@forward 'tokens';
@forward 'functions';
@forward 'mixins';
`,dt=`@use 'functions' as fn;

// #region below
// Narrower than a breakpoint. With $print, paper gets the same layout (A4 is
// about as narrow as a phone for a table).
@mixin below($name, $print: false) {
  @if $print {
    @media (max-width: fn.bp($name)), print {
      @content;
    }
  } @else {
    @media (max-width: fn.bp($name)) {
      @content;
    }
  }
}

// #endregion

@mixin from($name) {
  @media (min-width: fn.bp($name) + 1px) {
    @content;
  }
}

// #region surface
// The bordered card every block of the site sits in.
@mixin surface($radius: md) {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: fn.radius($radius);
}

// #endregion

// A small rounded label (tags, origins, chips).
@mixin chip($bg, $fg) {
  background: var(--#{$bg});
  color: var(--#{$fg});
  border-radius: fn.radius(pill);
  padding: 0 0.7rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

// Keyboard focus that shows on every background, in both themes.
@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}
`,ct=`@use 'sass:map';

// Design tokens. The only file with raw colours: stylelint refuses a hex value
// anywhere else, so every colour on the site has a name and a contrast check.

// The light theme in full; the dark one only says what differs (map.merge below).
$light: (
  bg: #fafaf7,
  card: #fff,
  ink: #1d2327,
  muted: #5d6870,
  line: #dfe2e0,
  accent: #1f4d3a,
  accent-ink: #fff,
  accent-soft: #e4efe9,
  warn: #8a3b12,
  warn-soft: #fbece3,
  info: #24507a,
  info-soft: #e5eef7,
  code-bg: #14181c,
  code-ink: #e6edf0,
  hl-keyword: #ff9b8f,
  hl-string: #a5d6a7,
  hl-number: #ffcc80,
  hl-comment: #8a969e,
  hl-title: #90caf9,
  hl-type: #ce93d8,
);

// #region themes
$dark: map.merge(
  $light,
  (
    bg: #12161a,
    card: #1a2025,
    ink: #e8ecee,
    muted: #9aa6ad,
    line: #2c353b,
    accent: #7fc4a2,
    accent-ink: #0d1f17,
    accent-soft: #1e2d27,
    warn: #f0a77d,
    warn-soft: #33241c,
    info: #9cc3ea,
    info-soft: #1c2733,
    code-bg: #0b0e10,
  )
);

// #endregion

$themes: (
  light: $light,
  dark: $dark,
);

// Text on background that must stay readable (WCAG AA: 4.5 for body text).
// Checked for both themes at build time (base/_theme.scss).
$contrast-pairs: (
  (ink, bg, 4.5),
  (ink, card, 4.5),
  (muted, bg, 4.5),
  (muted, card, 4.5),
  (accent, card, 4.5),
  (accent, accent-soft, 4.5),
  (accent-ink, accent, 4.5),
  (warn, warn-soft, 4.5),
  (info, info-soft, 4.5),
  (code-ink, code-bg, 4.5),
  (hl-keyword, code-bg, 4.5),
  (hl-string, code-bg, 4.5),
  (hl-comment, code-bg, 4.5),
  (hl-title, code-bg, 4.5),
  (hl-type, code-bg, 4.5),
);

// Paper: black on white, and syntax colours dark enough for a laser printer.
$print: (
  paper: #fff,
  ink: #000,
  code-bg: #f5f5f5,
  code-ink: #111,
  code-line: #ddd,
  keyword: #a3261b,
  string: #2e6b30,
  number: #8a4b00,
  comment: #6b7378,
  title: #1d4f8a,
  type: #6a2c80,
);

// One colour per project, used by the map and the project pages. The ids are the
// project ids of src/data/project-map.json; \`npm run check\` fails on a project
// without a colour here.
$project-accents: (
  edge: #4a5560,
  shared: #5b6470,
  controlpanel: #2b5c8a,
  ledgerdashboard: #8a5a12,
  rebiomed: #a33b5a,
  labflow: #6b4fa3,
  languagelessondesigner: #2e7d6b,
  programminglessondesigner: #1f4d3a,
  clinicreport: #b2452e,
  analytics: #2f6e9e,
  integrationhub: #5f6b1d,
  clinichub: #8a3b7a,
  wutility: #3d6b4f,
  pharmaflow: #b0335f,
  financepowerapp: #2d6b6b,
);
$radius: (
  sm: 6px,
  md: 10px,
  lg: 12px,
  pill: 999px,
);
$breakpoints: (
  phone: 720px,
  tablet: 960px,
);
$fonts: (
  text: ('Vazirmatn', 'Tahoma', system-ui, sans-serif),
  mono: ('JetBrains Mono', ui-monospace, 'Consolas', 'Menlo', monospace),
);
$layout: (
  page: 1000px,
  docs: 1200px,
  sidebar: 17rem,
);
`,pt=`@use '../abstracts' as *;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font: 16px/1.8 font(text);
}

a {
  color: var(--accent);

  @include focus-ring;
}

h1,
h2,
h3 {
  line-height: 1.4;
}

h2 {
  margin: 2rem 0 0.6rem;
  font-size: 1.3rem;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0.3rem;
}

h3 {
  margin: 1rem 0 0.2rem;
  font-size: 1.05rem;
}

code,
pre {
  font-family: var(--mono);
  font-variant-ligatures: none;
}

button {
  font: inherit;

  @include focus-ring;
}
`,ut=`@use '../abstracts' as *;
@use '../components/code';

// The booklet pages are printed to PDF by CI (scripts/pdf.mjs).
@media print {
  .topbar,
  .lesson-nav,
  .tabs,
  .filters,
  .booklet-links,
  .docs-side,
  .docs-pager,
  .lang-switch {
    display: none !important;
  }

  body {
    background: print-color(paper);
    color: print-color(ink);
    font-size: 10.5pt;
  }

  .page {
    max-width: none;
    padding: 0;
  }

  .code-tabs pre {
    white-space: pre-wrap;
    word-break: break-word;
    background: print-color(code-bg);
    color: print-color(code-ink);
    border: 1px solid print-color(code-line);
    font-size: 8pt;
  }

  // The same highlight.js selectors as on screen, in ink a printer can do.
  @each $token, $selector in code.$hljs {
    #{$selector} {
      color: print-color($token);
    }
  }

  .compare-wrap {
    overflow: visible;
  }

  .hero,
  .topics {
    break-inside: avoid;
  }

  .booklet-lesson {
    break-before: page;
    border: 0;
  }

  .pitfall,
  .concept,
  .exercise,
  .sample,
  .compare tr {
    break-inside: avoid;
  }
}
`,ht=`@use 'sass:map';
@use '../abstracts' as *;

// #region theme
// Sass builds the custom properties; the browser switches them. Anything that
// changes while the page is open (the theme here, the text direction in the
// Projects tab) has to be a CSS variable: Sass is gone by then.
@mixin -emit($theme) {
  @each $name, $value in $theme {
    --#{$name}: #{$value};
  }
}

// Every pair in tokens.$contrast-pairs, in every theme. A failure stops the build.
@each $theme-name, $theme in $themes {
  @each $fg, $bg, $min in $contrast-pairs {
    $ratio: require-contrast(map.get($theme, $fg), map.get($theme, $bg), $min, '#{$theme-name} theme: #{$fg} on #{$bg}');
  }
}

:root {
  @include -emit($light);

  --mono: #{font(mono)};
}

@media (prefers-color-scheme: dark) {
  :root {
    @include -emit($dark);
  }
}

// #endregion
`,ft=`@use '../abstracts' as *;

.cover {
  padding: 2rem 0 1rem;

  .kicker {
    color: var(--muted);
    margin: 0;
  }

  h1 {
    margin: 0;
    font-size: 2.2rem;
  }
}

.toc {
  padding-inline-start: 1.4rem;
}

.booklet-lesson {
  border-top: 2px solid var(--accent);
  margin-top: 2rem;
}
`,mt=`@use '../abstracts' as *;

.code-tabs {
  @include surface;

  margin: 1rem 0;
  overflow: hidden;

  figcaption {
    padding: 0.5rem 0.8rem 0;
  }

  &.all .sample + .sample {
    border-top: 1px solid var(--line);
    padding-top: 0.5rem;
  }

  pre {
    margin: 0;
    padding: 1rem;
    background: var(--code-bg);
    color: var(--code-ink);
    overflow-x: auto;
    font-size: 0.82rem;
    line-height: 1.55;
    text-align: left;
  }
}

.tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  flex-wrap: wrap;
  align-items: center;
  direction: ltr;
}

.sample-head {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 0.8rem 0.4rem;

  .lang {
    font-weight: 600;
    direction: ltr;
  }

  .path {
    color: var(--muted);
    font-size: 0.75rem;
  }
}

// #region origins
// Where a sample comes from: real project code, a tested example, or a port.
$-origins: (
  real: accent,
  tested: info,
  port: warn,
);

.origin {
  font-size: 0.78rem;
  border-radius: radius(sm);
  padding: 0 0.5rem;

  @each $origin, $tone in $-origins {
    &.#{$origin} {
      background: var(--#{$tone}-soft);
      color: var(--#{$tone});
    }
  }
}

// #endregion

// highlight.js classes -> theme tokens. One map, used again by print.
$hljs: (
  keyword: '.hljs-keyword, .hljs-built_in, .hljs-literal, .hljs-meta .hljs-keyword',
  string: '.hljs-string, .hljs-regexp, .hljs-meta .hljs-string',
  number: '.hljs-number',
  comment: '.hljs-comment',
  title: '.hljs-title, .hljs-title.function_, .hljs-attr, .hljs-attribute',
  type: '.hljs-type, .hljs-title.class_, .hljs-meta, .hljs-tag, .hljs-name',
);

@each $token, $selector in $hljs {
  #{$selector} {
    color: var(--hl-#{$token});
  }
}

.hljs-comment {
  font-style: italic;
}
`,gt=`@use '../abstracts' as *;

.compare-wrap {
  @include surface;

  overflow-x: auto;
}

.compare {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.88rem;

  th,
  td {
    padding: 0.5rem 0.7rem;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
    text-align: start;
    min-width: 8rem;
  }

  thead th {
    background: var(--accent-soft);
  }

  tbody th {
    font-weight: 600;
  }

  .known {
    background: color-mix(in srgb, var(--accent-soft) 55%, transparent);
  }

  td code {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.8rem;
  }

  .diff {
    color: var(--muted);
    min-width: 13rem;
  }
}

// Phones and paper: each row becomes a card with labelled cells, so nothing
// scrolls or gets cut.
@include below(phone, $print: true) {
  .compare-wrap {
    border: 0;
    background: none;
    overflow: visible;
  }

  .compare {
    thead {
      display: none;
    }

    &,
    tbody,
    tr,
    th,
    td {
      display: block;
      width: 100%;
      min-width: 0;
    }

    tr {
      @include surface;

      margin-bottom: 0.7rem;
      overflow: hidden;
    }

    tbody th {
      background: var(--accent-soft);
    }

    td {
      display: grid;
      grid-template-columns: 6.5rem 1fr;
      gap: 0.5rem;
      text-align: left;

      &::before {
        content: attr(data-label);
        font-family: font(text);
        color: var(--muted);
        font-size: 0.8rem;
        text-align: left;
      }

      &.diff {
        direction: rtl;
        text-align: right;
        grid-template-columns: 1fr;

        &::before {
          display: none;
        }
      }
    }
  }
}
`,bt=`@use '../abstracts' as *;

.page {
  max-width: layout(page);
  margin: 0 auto;
  padding: 1rem;
}

.lead {
  color: var(--muted);
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

// #region placeholders
// Every small button of the site: filters, code tabs, review actions.
%button {
  cursor: pointer;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  border-radius: radius(sm);
  padding: 0.2rem 0.8rem;
}

%button-on {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

.filters button,
.tabs button,
.card-actions button {
  @extend %button;
}

.filters button.on,
.tabs button.on,
.card-actions .primary {
  @extend %button-on;
}

// #endregion

.btn-link {
  cursor: pointer;
  border: 0;
  background: none;
  color: var(--accent);
  text-decoration: underline;
  padding: 0;

  &.danger {
    color: var(--warn);
    margin-top: 2rem;
  }
}
`,vt=`@use '../abstracts' as *;

.booklet-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--line);
  margin-top: 1.5rem;

  h2 {
    border: 0;
    margin: 0;
  }

  small {
    color: var(--muted);
    font-size: 0.85rem;
    font-weight: 400;
  }
}

.booklet-links {
  display: flex;
  gap: 1rem;
}

.lesson-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.6rem;

  a {
    @include surface;

    display: flex;
    gap: 0.8rem;
    align-items: center;
    padding: 0.7rem 1rem;
    text-decoration: none;
    color: var(--ink);

    &:hover {
      border-color: var(--accent);
    }
  }
}

.num {
  background: var(--accent-soft);
  color: var(--accent);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 600;
  flex: none;
}

.titles {
  display: grid;
  flex: 1;
  min-width: 0;

  small {
    color: var(--muted);
  }
}

.tagchip {
  @include chip(accent-soft, accent);

  direction: ltr;
  display: inline-block;
}
`,yt=`@use '../abstracts' as *;

.lesson-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.spacer {
  flex: 1;
}

.hero {
  margin: 1rem 0;
  padding: 1.2rem;
  background: var(--accent-soft);
  border-radius: radius(lg);

  h1 {
    margin: 0.4rem 0 0;
    direction: ltr;
    text-align: left;
  }
}

.hfa {
  margin: 0.2rem 0 0.6rem;
  color: var(--muted);
}

.topics {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;

  span {
    @include surface(sm);

    padding: 0 0.5rem;
    font-size: 0.85rem;
    direction: ltr;
  }
}

.goals li {
  margin: 0.3rem 0;
}

.dialog {
  @include surface;

  padding: 0.3rem 1rem;

  p {
    margin: 0.5rem 0;
  }

  .asks {
    color: var(--muted);
  }

  b {
    display: inline-block;
    min-width: 2.8rem;
    color: var(--accent);
  }
}

.concept {
  @include surface;

  padding: 0.1rem 1rem 0.6rem;
  margin: 0.6rem 0;

  p {
    margin: 0.2rem 0;
  }
}

.pitfall {
  @include surface;

  border-inline-start: 4px solid var(--warn);
  border-radius: 0;
  padding: 0.5rem 1rem;
  margin: 0.6rem 0;

  p {
    margin: 0.2rem 0;
  }
}

.pf-head {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

// "Why:", "Fix:", "Answer:" labels inside pitfalls, answers and hints.
.pitfall i,
.answer i,
.hint i {
  color: var(--muted);
  font-style: normal;
  font-weight: 600;
}

.refs {
  list-style: none;
  padding: 0;

  li {
    display: grid;
    gap: 0;
    padding: 0.4rem 0;
    border-bottom: 1px dashed var(--line);
  }

  code {
    color: var(--accent);
    font-size: 0.85rem;
    word-break: break-all;
    text-align: left;
  }
}

.exercise {
  @include surface(sm);

  padding: 0.4rem 1rem;
  margin: 0.5rem 0;

  summary {
    cursor: pointer;
    font-weight: 500;
  }
}

.answer {
  background: var(--accent-soft);
  border-radius: radius(sm);
  padding: 0.3rem 0.6rem;
}

.take {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--accent-soft);
  border-radius: radius(md);

  p {
    margin: 0.3rem 0 0;
    font-weight: 500;
    text-align: left;
  }
}
`,wt=`@use '../abstracts' as *;

.review .stats {
  color: var(--muted);
}

.card {
  @include surface(lg);

  padding: 1.2rem;
  margin: 1rem 0;

  .front {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0.5rem 0;
  }

  .hint {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 0.9rem;
  }

  .back {
    border-top: 1px dashed var(--line);
    margin-top: 0.8rem;
    padding-top: 0.5rem;

    p {
      margin: 0.3rem 0;
    }
  }

  &.empty {
    text-align: center;
    color: var(--muted);
  }
}

.card-kind {
  color: var(--muted);
  font-size: 0.85rem;
}

.card-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}
`,kt=`@use '../abstracts' as *;

.topbar {
  background: var(--accent);
  color: var(--accent-ink);

  a {
    color: var(--accent-ink);
    text-decoration: none;
  }

  .brand {
    font-weight: 600;
    direction: ltr;
    margin-inline-end: auto;
  }

  .tab {
    opacity: 0.8;
    padding: 0.1rem 0.5rem;
    border-radius: radius(sm);

    &.on {
      opacity: 1;
      background: color-mix(in srgb, var(--accent-ink) 18%, transparent);
    }
  }
}

.topbar-in {
  max-width: layout(page);
  margin: 0 auto;
  padding: 0.6rem 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
`,_t=`// The whole site's styles, in cascade order. Partials only @use the abstracts
// (tokens, functions, mixins), which emit no CSS of their own.
@use 'base/theme';
@use 'base/base';
@use 'components/topbar';
@use 'components/controls';
@use 'components/lesson-list';
@use 'components/lesson';
@use 'components/compare';
@use 'components/code';
@use 'components/booklet';
@use 'components/review';
@use 'projects/accents';
@use 'projects/docs';
@use 'projects/map';
@use 'base/print';
`,Tt=`@use 'sass:color';
@use 'sass:map';
@use '../abstracts' as *;

// One colour per project (tokens.$project-accents) becomes .accent-<id>, which
// sets --project and --project-soft for the map boxes and the project pages.
// In the dark theme the same hue is lifted so it still stands out.
@function -on-dark($c) {
  @return color.scale($c, $lightness: 42%);
}

@function -soft($c, $card, $amount) {
  @return color.mix($c, $card, $amount);
}

// #region accents-check
// The outline is a graphic (WCAG asks 3:1); the text in the box is body text
// (4.5:1). The box colour is mixed from the accent, so it is checked too.
@each $id, $c in $project-accents {
  $card: map.get($light, card);
  $dark-c: -on-dark($c);
  $dark-card: map.get($dark, card);
  $ok: require-contrast($c, $card, 3, 'project #{$id}: outline, light');
  $ok: require-contrast($dark-c, $dark-card, 3, 'project #{$id}: outline, dark');
  $ok: require-contrast(map.get($light, ink), -soft($c, $card, 12%), 4.5, 'project #{$id}: text on its box, light');
  $ok: require-contrast(map.get($light, muted), -soft($c, $card, 12%), 4.5, 'project #{$id}: muted text on its box, light');
  $ok: require-contrast(map.get($dark, ink), -soft($dark-c, $dark-card, 16%), 4.5, 'project #{$id}: text on its box, dark');
  $ok: require-contrast(map.get($dark, muted), -soft($dark-c, $dark-card, 16%), 4.5, 'project #{$id}: muted text on its box, dark');
}

// #endregion

@each $id, $c in $project-accents {
  .accent-#{$id} {
    --project: #{$c};
    --project-soft: #{-soft($c, map.get($light, card), 12%)};
  }
}

@media (prefers-color-scheme: dark) {
  @each $id, $c in $project-accents {
    .accent-#{$id} {
      --project: #{-on-dark($c)};
      --project-soft: #{-soft(-on-dark($c), map.get($dark, card), 16%)};
    }
  }
}
`,$t=`@use 'sass:map';
@use '../abstracts' as *;

// The Projects tab, laid out like a reference site: contents on the start side,
// the page, previous / next. Only logical properties (inline-start, inline-end),
// so the same rules serve Persian (right to left) and English (left to right).

.docs {
  max-width: layout(docs);
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.docs-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}

.docs-title {
  display: grid;
  flex: 1;
  min-width: 12rem;

  strong {
    font-size: 1.3rem;
  }

  span {
    color: var(--muted);
    font-size: 0.9rem;
  }
}

.docs-menu {
  @include surface(sm);

  cursor: pointer;
  padding: 0.2rem 0.9rem;
  color: var(--ink);

  @include from(tablet) {
    display: none;
  }
}

.lang-switch {
  display: flex;
  gap: 0.3rem;

  a {
    @include surface(sm);

    padding: 0.1rem 0.7rem;
    text-decoration: none;
    color: var(--ink);

    &.on {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-ink);
    }
  }
}

.docs-body {
  display: grid;
  gap: 2rem;

  // minmax(0, 1fr), not the default auto: an auto column grows to its widest
  // child, and the map's SVG would widen the whole page on a phone.
  grid-template-columns: minmax(0, 1fr);

  @include from(tablet) {
    grid-template-columns: layout(sidebar) minmax(0, 1fr);
  }
}

// #region sidebar
.docs-side {
  display: none;
  align-self: start;
  padding: 0.5rem 0;

  &.open {
    display: block;
  }

  @include from(tablet) {
    display: block;
    position: sticky;
    top: 0;
    max-height: 100vh;
    overflow-y: auto;
  }

  h3 {
    margin: 1rem 0 0.3rem;
    padding-inline-start: 0.8rem;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  a {
    display: block;
    padding: 0.25rem 0.8rem;
    border-inline-start: 3px solid transparent;
    color: var(--ink);
    text-decoration: none;

    &:hover {
      background: var(--accent-soft);
    }

    // The page you are on: marked in its project's colour where it has one.
    &.on {
      background: var(--accent-soft);
      border-inline-start-color: var(--project, var(--accent));
      font-weight: 600;
    }
  }
}

// #endregion

.docs-main {
  min-width: 0;

  h1 {
    margin: 0.5rem 0 0.3rem;
    font-size: 2rem;
  }
}

.project-title {
  border-inline-start: 6px solid var(--project);
  padding-inline-start: 0.7rem;
}

.project-summary {
  font-size: 1.1rem;
  color: var(--muted);
}

// #region pager
// Previous / next as buttons. The arrow follows the reading direction: in Persian
// "previous" points right.
$-arrows: (
  ltr: (prev: '←', next: '→'),
  rtl: (prev: '→', next: '←'),
);

.docs-pager {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;

  a {
    background: var(--accent);
    color: var(--accent-ink);
    border-radius: radius(sm);
    padding: 0.3rem 1rem;
    text-decoration: none;
  }

  .next {
    margin-inline-start: auto;
  }
}

// On .docs itself, not any [dir] ancestor: <html dir="rtl"> wraps every page of the
// site and would otherwise win over the English pages' ltr.
@each $dir, $arrow in $-arrows {
  .docs[dir='#{$dir}'] .docs-pager {
    .prev::before {
      content: '#{map.get($arrow, prev)} ';
    }

    .next::after {
      content: ' #{map.get($arrow, next)}';
    }
  }
}

// #endregion

.glance {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.4rem 1.2rem;
  margin: 0;

  // Phones: each label above its value.
  @include below(phone) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;

    dd {
      margin-bottom: 0.6rem;
    }
  }

  dt {
    color: var(--muted);
  }

  dd {
    margin: 0;
  }
}

.site {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-inline-end: 1rem;

  a {
    overflow-wrap: anywhere;
  }
}

.access {
  &.is-public {
    @include chip(info-soft, info);
  }

  &.is-private {
    @include chip(warn-soft, warn);
  }
}

.doc-table-wrap {
  @include surface;

  overflow-x: auto;
}

.doc-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.92rem;

  th,
  td {
    padding: 0.45rem 0.8rem;
    border-bottom: 1px solid var(--line);
    text-align: start;
    vertical-align: top;
  }

  thead th {
    background: var(--accent-soft);
  }
}

.connections {
  display: grid;
  gap: 1rem;

  @include from(phone) {
    grid-template-columns: 1fr 1fr;
  }

  h3 {
    margin-top: 0;
  }

  ul {
    padding-inline-start: 1.2rem;
  }

  small code {
    margin-inline-end: 0.4rem;
    font-size: 0.78rem;
    color: var(--muted);
  }
}

.muted {
  color: var(--muted);
}

.doc-note {
  background: var(--info-soft);
  color: var(--info);
  border-radius: radius(sm);
  padding: 0.6rem 1rem;
}

.doc-refs {
  list-style: none;
  padding: 0;

  li {
    display: grid;
    padding: 0.3rem 0;
    border-bottom: 1px dashed var(--line);
  }

  code {
    color: var(--accent);
    font-size: 0.85rem;
    word-break: break-all;
  }
}

.doc-section code {
  font-size: 0.88em;
}

// #region example
// The "Example" box of a reference site: a tinted panel, the word Example, then code.
.example {
  margin: 1rem 0;
  background: var(--accent-soft);
  border-inline-start: 4px solid var(--accent);
  border-radius: radius(sm);
  overflow: hidden;

  figcaption {
    display: flex;
    gap: 0.6rem;
    align-items: baseline;
    flex-wrap: wrap;
    padding: 0.5rem 0.9rem;
  }

  pre {
    margin: 0;
    padding: 0.9rem;
    background: var(--code-bg);
    color: var(--code-ink);
    overflow-x: auto;
    font-size: 0.82rem;
    line-height: 1.55;
  }
}

.example-path {
  color: var(--muted);
  font-size: 0.75rem;
}

.example-copy {
  @include surface(sm);

  cursor: pointer;
  margin-inline-start: auto;
  padding: 0 0.7rem;
  color: var(--ink);
}

// #endregion

// The open project's topics, nested under it in the contents list.
.side-topics {
  margin: 0.2rem 0 0.6rem;
  border-inline-start: 2px solid var(--project);
  margin-inline-start: 0.8rem;

  h4 {
    margin: 0.6rem 0 0.1rem;
    padding-inline-start: 0.8rem;
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
  }

  a {
    padding-block: 0.15rem;
    font-size: 0.92rem;
  }
}

.breadcrumb {
  margin: 0.5rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.topic-files {
  @include surface(sm);

  padding: 0.5rem 0.9rem;
  margin: 1rem 0;

  ul {
    margin: 0.3rem 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.6rem;
    align-items: baseline;
  }

  code {
    font-size: 0.82rem;
    overflow-wrap: anywhere;
  }
}

.contents-group ol {
  margin-top: 0.2rem;
}

// HTTP verbs in the endpoint tables: reading is calm, changing is marked.
$-http-tones: (
  get: info,
  post: accent,
  put: warn,
  delete: warn,
);

.http {
  font: 600 0.75rem var(--mono);
  border-radius: radius(sm);
  padding: 0.05rem 0.4rem;

  @each $verb, $tone in $-http-tones {
    &.http-#{$verb} {
      background: var(--#{$tone}-soft);
      color: var(--#{$tone});
    }
  }
}

.data-table {
  margin: 0.8rem 0;

  .note {
    display: inline-block;
    margin-inline-end: 0.4rem;
    font-size: 0.78rem;
    color: var(--muted);
  }
}

.sql-table h3 {
  font-family: var(--mono);
  font-size: 0.95rem;
}

.data-note {
  margin: 0.3rem 0 0;
  color: var(--muted);
  font-size: 0.8rem;
}

// #region search
.docs-search input {
  @include surface(sm);

  width: 100%;
  padding: 0.35rem 0.7rem;
  color: var(--ink);
  font: inherit;
  font-size: 0.92rem;
}

.docs-hits {
  margin-top: 0.5rem;

  small {
    display: block;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 400;
  }

  p {
    padding-inline-start: 0.8rem;
  }
}

// #endregion

// #region progress
// Finished topics: a tick in the contents, a count beside the project.
.read-mark {
  margin-inline-start: 0.3rem;
  color: var(--accent);
  font-weight: 600;
}

.side-progress {
  margin-inline-start: 0.4rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 400;
}

.doc-progress {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  color: var(--muted);

  progress {
    accent-color: var(--accent);
    width: 10rem;
  }
}

.topic-done button,
.quiz-again {
  @include surface(sm);

  cursor: pointer;
  padding: 0.3rem 1rem;
  color: var(--ink);
  font: inherit;

  &.on {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }
}

.topic-done {
  margin: 1.5rem 0;
}

// #endregion

// #region quiz
// The exercise under a topic, like a reference site's "Test yourself".
.quiz {
  @include surface;

  margin: 2rem 0 1rem;
  padding: 0.5rem 1.2rem 1rem;
  border-inline-start: 4px solid var(--project, var(--accent));

  ol {
    padding-inline-start: 1.2rem;
  }
}

.quiz-q {
  margin-bottom: 1.2rem;
}

.quiz-text {
  font-weight: 600;
}

.quiz-options {
  display: grid;
  gap: 0.4rem;

  button {
    @include surface(sm);

    cursor: pointer;
    padding: 0.4rem 0.8rem;
    color: var(--ink);
    font: inherit;
    text-align: start;

    &:hover:not(:disabled) {
      background: var(--accent-soft);
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &.right {
      background: var(--accent-soft);
      border-color: var(--accent);
      color: var(--accent);
      opacity: 1;
    }

    &.wrong {
      background: var(--warn-soft);
      border-color: var(--warn);
      color: var(--warn);
    }
  }
}

.quiz-why {
  margin: 0.5rem 0 0;
  border-radius: radius(sm);
  padding: 0.4rem 0.8rem;

  &.right {
    background: var(--accent-soft);
    color: var(--accent);
  }

  &.wrong {
    background: var(--warn-soft);
    color: var(--warn);
  }
}

.quiz-score {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  font-weight: 600;
}

// #endregion
`,At=`@use '../abstracts' as *;

// The system map (SystemMap.vue): boxes in each project's colour, outlines that
// say where a thing runs, arrows for "talks to".
$-where: (
  vps: none,
  pc: 6 4,
  external: 2 3,
);

.system-map {
  @include surface;

  margin: 1rem 0;
  padding: 0.8rem;

  // Wide graphs scroll inside their frame, never the page.
  overflow-x: auto;

  svg {
    display: block;
    width: 100%;
    min-width: 40rem;
    height: auto;
  }
}

.node {
  rect {
    fill: var(--project-soft);
    stroke: var(--project);
    stroke-width: 1.5;
  }

  @each $where, $dash in $-where {
    &.is-#{$where} rect {
      stroke-dasharray: $dash;
    }
  }

  &.is-current rect {
    stroke-width: 3;
  }

  &.is-link {
    cursor: pointer;

    &:hover rect,
    &:focus-visible rect {
      stroke-width: 3;
    }

    &:focus-visible {
      outline: none;
    }
  }
}

.node-label {
  fill: var(--ink);
  font: 600 13px font(text);
}

.node-sub {
  fill: var(--muted);
  font: 11px font(text);
}

.arrow {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.2;
  opacity: 0.75;
}

.arrow-head {
  fill: var(--muted);
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.5rem;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.85rem;

  li::before {
    display: inline-block;
    width: 1.6rem;
    margin-inline-end: 0.4rem;
    vertical-align: middle;
    content: '';
    border-top: 2px solid var(--muted);
  }

  .legend-pc::before {
    border-top-style: dashed;
  }

  .legend-external::before {
    border-top-style: dotted;
  }
}
`,St={class:"example"},xt={key:0,class:"example-path",dir:"ltr"},Pt={key:1,class:"example-path",dir:"ltr"},jt={dir:"ltr"},Ct=["innerHTML"],Et=q({__name:"ExampleBox",props:{example:{},lang:{}},setup(e){const i=Object.assign({"../../styles/abstracts/_functions.scss":rt,"../../styles/abstracts/_index.scss":lt,"../../styles/abstracts/_mixins.scss":dt,"../../styles/abstracts/_tokens.scss":ct,"../../styles/base/_base.scss":pt,"../../styles/base/_print.scss":ut,"../../styles/base/_theme.scss":ht,"../../styles/components/_booklet.scss":ft,"../../styles/components/_code.scss":mt,"../../styles/components/_compare.scss":gt,"../../styles/components/_controls.scss":bt,"../../styles/components/_lesson-list.scss":vt,"../../styles/components/_lesson.scss":yt,"../../styles/components/_review.scss":wt,"../../styles/components/_topbar.scss":kt,"../../styles/main.scss":_t,"../../styles/projects/_accents.scss":Tt,"../../styles/projects/_docs.scss":$t,"../../styles/projects/_map.scss":At}),s=e,c=b(()=>V[s.lang]),l=b(()=>{const r=s.example;if(r.code)return r.code;const f=r.file?i[`../../${r.file}`]:void 0;return f===void 0?`// missing file: ${r.file}`:r.region?_n(f,r.region)??`// missing region "${r.region}" in ${r.file}`:f.trimEnd()}),w=b(()=>Tn(l.value,s.example.lang)),d=Q(!1);async function h(){try{await navigator.clipboard.writeText(l.value),d.value=!0,setTimeout(()=>d.value=!1,1500)}catch{}}return(r,f)=>(a(),o("figure",St,[n("figcaption",null,[n("b",null,t(c.value.example),1),n("span",null,t(e.example.title[e.lang]),1),e.example.file?(a(),o("code",xt,"src/"+t(e.example.file),1)):e.example.source?(a(),o("code",Pt,t(e.example.source),1)):S("",!0),n("button",{type:"button",class:"example-copy",onClick:h},t(d.value?c.value.copied:c.value.copy),1)]),n("pre",jt,[n("code",{class:"hljs",innerHTML:w.value},null,8,Ct)])]))}}),Ot=["id"],Rt=["innerHTML"],It={key:0},Lt=["innerHTML"],Dt={key:0,class:"doc-section"},Ht={class:"doc-refs"},Wt={dir:"ltr"},te=q({__name:"DocSections",props:{sections:{},examples:{},refs:{},code:{},lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]);return(c,l)=>{var w;return a(),o(v,null,[(a(!0),o(v,null,A(e.sections,d=>(a(),o("section",{id:d.id,key:d.id,class:"doc-section"},[n("h2",null,t(d.h),1),(a(!0),o(v,null,A(d.p??[],(h,r)=>(a(),o("p",{key:r,innerHTML:y(J)(h)},null,8,Rt))),128)),d.list?(a(),o("ul",It,[(a(!0),o(v,null,A(d.list,(h,r)=>(a(),o("li",{key:r,innerHTML:y(J)(h)},null,8,Lt))),128))])):S("",!0),d.data&&e.code?(a(),L(it,{key:1,data:d.data,code:e.code,lang:e.lang},null,8,["data","code","lang"])):S("",!0),(a(!0),o(v,null,A(d.examples??[],h=>(a(),L(Et,{key:h,example:e.examples[h],lang:e.lang},null,8,["example","lang"]))),128))],8,Ot))),128)),(w=e.refs)!=null&&w.length?(a(),o("section",Dt,[n("h2",null,t(s.value.source),1),n("ul",Ht,[(a(!0),o(v,null,A(e.refs,d=>(a(),o("li",{key:d.file+d.line},[n("code",Wt,t(d.project)+"/"+t(d.file)+t(d.line?`:${d.line}`:""),1),n("span",null,t(d.note[e.lang]),1)]))),128))])])):S("",!0)],64)}}});function Ft(e,i,s={w:168,h:54},c={x:64,y:18}){var j;const l=new Map(e.map(g=>[g,[]])),w=new Map(e.map(g=>[g,[]]));for(const g of i)!l.has(g.from)||!l.has(g.to)||g.from===g.to||(l.get(g.from).push(g.to),w.get(g.to).push(g.from));const d=new Map,h=new Set,r=g=>{if(d.has(g))return d.get(g);h.add(g);const x=w.get(g).filter(E=>!h.has(E)),u=x.length?Math.max(...x.map(r))+1:0;return h.delete(g),d.set(g,u),u};e.forEach(r);const f=[];for(const g of e)(f[j=d.get(g)]??(f[j]=[])).push(g);const m=new Map;f.forEach((g,x)=>{if(x>0){const u=E=>{const W=w.get(E).map(z=>m.get(z)).filter(z=>z!==void 0);return W.length?W.reduce((z,ee)=>z+ee,0)/W.length:Number.MAX_SAFE_INTEGER};g.sort((E,W)=>u(E)-u(W))}g.forEach((u,E)=>m.set(u,E))});const k=Math.max(...f.map(g=>g.length)),p=k*s.h+(k-1)*c.y;return{nodes:f.flatMap((g,x)=>{const u=(p-(g.length*s.h+(g.length-1)*c.y))/2;return g.map((E,W)=>({id:E,column:x,x:x*(s.w+c.x),y:u+W*(s.h+c.y)}))}),width:f.length*s.w+(f.length-1)*c.x,height:p,box:s}}function Mt(e,i,s){const c=e.y+s.h/2,l=i.y+s.h/2;if(i.column>e.column){const h=e.x+s.w,r=i.x,f=(h+r)/2;return`M${h},${c} C${f},${c} ${f},${l} ${r},${l}`}const d=Math.max(e.x,i.x)+s.w+40;return`M${e.x+s.w},${c} C${d},${c} ${d},${l} ${i.x+s.w},${l}`}const zt={class:"system-map",dir:"ltr"},Vt=["viewBox","aria-label"],qt=["d"],Bt=["transform","tabindex","role","aria-label","onClick","onKeydown"],Nt=["width","height"],Qt={x:"12",y:"23",class:"node-label"},Ut={x:"12",y:"41",class:"node-sub"},Gt=48,be=q({__name:"SystemMap",props:{nodes:{},arrows:{},current:{},label:{}},setup(e){const i=e,s=ge(),c=b(()=>Ft(i.nodes.map(m=>m.id),i.arrows)),l=b(()=>new Map(c.value.nodes.map(m=>[m.id,m]))),w=b(()=>new Map(i.nodes.map(m=>[m.id,m]))),d=b(()=>c.value.nodes.map(m=>({...m,node:w.value.get(m.id)}))),h=b(()=>i.arrows.filter(m=>l.value.has(m.from)&&l.value.has(m.to)).map(m=>({...m,d:Mt(l.value.get(m.from),l.value.get(m.to),c.value.box)}))),r=b(()=>`-8 -8 ${c.value.width+Gt+16} ${c.value.height+16}`);function f(m,k){k==null||k.preventDefault(),m.to&&s.push(m.to)}return(m,k)=>(a(),o("figure",zt,[(a(),o("svg",{viewBox:r.value,"aria-label":e.label,role:"group",preserveAspectRatio:"xMidYMin meet"},[k[0]||(k[0]=n("defs",null,[n("marker",{id:"arrow",viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto-start-reverse"},[n("path",{d:"M0,0 L10,5 L0,10 z",class:"arrow-head"})])],-1)),(a(!0),o(v,null,A(h.value,p=>(a(),o("path",{key:p.from+p.to,d:p.d,class:"arrow","marker-end":"url(#arrow)"},[n("title",null,t(p.title),1)],8,qt))),128)),(a(!0),o(v,null,A(d.value,p=>(a(),o("g",{key:p.id,class:I(["node",`accent-${p.node.project}`,`is-${p.node.where}`,{"is-current":p.id===e.current,"is-link":p.node.to}]),transform:`translate(${p.x},${p.y})`,tabindex:p.node.to?0:-1,role:p.node.to?"link":void 0,"aria-label":p.node.label,onClick:T=>f(p.node),onKeydown:se(T=>f(p.node,T),["enter"])},[n("rect",{width:c.value.box.w,height:c.value.box.h,rx:"9"},null,8,Nt),n("text",Qt,t(p.node.label),1),n("text",Ut,t(p.node.sub),1)],42,Bt))),128))],8,Vt))]))}}),ve="analytics",ye={fa:"گزارش و پیش‌بینی برای پلتفرم ClinicHub: پول گروه از FinancePowerApp و عملیات کلینیک‌ها از رویدادهای بی‌نام IntegrationHub، در یک انبار داده. FastAPI، DuckDB و React؛ فقط‌خواندنی.",en:"Reporting and forecasting for the ClinicHub platform: the group's money from FinancePowerApp and the clinics' operations from IntegrationHub's de-identified event feed, in one warehouse. FastAPI, DuckDB and React; read-only."},we=[{project:"Analytics",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],Kt={id:ve,summary:ye,refs:we},Jt=Object.freeze(Object.defineProperty({__proto__:null,default:Kt,id:ve,refs:we,summary:ye},Symbol.toStringTag,{value:"Module"})),ke="clinichub",_e={fa:"پلتفرم کلینیک برای کلینیک‌های سرپایی و خانوادگی انتاریو: بیمار و کارت سلامت، نوبت و صف، ویزیت، صورت‌حساب OHIP و سفارش به آزمایشگاه. بقیه‌ی پروژه‌های کلینیکی به آن وصل می‌شوند و از طریق آن وارد می‌شوند.",en:"A clinic platform for Ontario walk-in and family practices: patients and health cards, booking and walk-in queues, the visit, OHIP billing and orders to the lab. The other clinic projects connect to it, and sign in through it."},Te=[{project:"ClinicHub",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],Yt={id:ke,summary:_e,refs:Te},Xt=Object.freeze(Object.defineProperty({__proto__:null,default:Yt,id:ke,refs:Te,summary:_e},Symbol.toStringTag,{value:"Module"})),$e="clinicreport",Ae={fa:"گزارش‌نویسی ساخت‌یافته‌ی متن‌باز برای کلینیک‌ها: مدیر برای هر خدمت (اکو، نوار قلب، هولتر، سونوگرافی) یک قالب می‌سازد، تایپیست هنگام دیکته‌ی پزشک آن را پر می‌کند و پزشک امضا می‌کند. .NET و React روی SQLite.",en:"Open-source structured reporting for clinics: an administrator designs a template per service (echo, ECG, Holter, ultrasound), a typist fills it while the physician dictates, and the physician signs. .NET and React on SQLite."},Se=[{project:"ClinicReport",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],Zt={id:$e,summary:Ae,refs:Se},ea=Object.freeze(Object.defineProperty({__proto__:null,default:Zt,id:$e,refs:Se,summary:Ae},Symbol.toStringTag,{value:"Module"})),xe="controlpanel",Pe={en:"A central status portal for the portfolio: every project sits behind its own small adapter, core-api gathers their live status into one dashboard, an Admin can start and stop the containers, and an optional AI assistant answers questions about the live data through read-only tools.",fa:"درگاه مرکزی وضعیت برای همه‌ی پروژه‌ها: هر پروژه پشت یک adapter کوچک خودش است، core-api وضعیت زنده‌ی همه را در یک داشبورد جمع می‌کند، Admin می‌تواند کانتینرها را روشن و خاموش کند، و یک دستیار هوش مصنوعی اختیاری با ابزارهای فقط‌خواندنی به سؤال‌ها درباره‌ی همین داده‌ها جواب می‌دهد."},je=[{project:"ControlPanel",file:"README.md",line:5,note:{en:"Architecture and the /status contract",fa:"معماری و قرارداد /status"}},{project:"ControlPanel",file:"README.md",line:31,note:{en:"The two adapter patterns",fa:"دو الگوی adapter"}},{project:"ControlPanel",file:"README.md",line:86,note:{en:"Service control through socket-proxy",fa:"کنترل سرویس‌ها از طریق socket-proxy"}},{project:"ControlPanel",file:"README.md",line:148,note:{en:"Running with Docker Compose",fa:"اجرا با Docker Compose"}},{project:"ControlPanel",file:"README.md",line:186,note:{en:"Tests",fa:"تست‌ها"}},{project:"ControlPanel",file:"deploy/vps/release.ps1",line:1,note:{en:"The release script",fa:"اسکریپت انتشار"}}],na={id:xe,summary:Pe,refs:je},ta=Object.freeze(Object.defineProperty({__proto__:null,default:na,id:xe,refs:je,summary:Pe},Symbol.toStringTag,{value:"Module"})),Ce="edge",Ee={fa:"تنها چیزی که رو به اینترنت است: Caddy روی پورت‌های ۸۰ و ۴۴۳، با HTTPS خودکار، هدرهای امنیتی و basic auth برای سایت‌های خصوصی. هیچ چیز دیگری روی سرور پورتی باز نمی‌کند.",en:"The only thing that faces the internet: Caddy on ports 80 and 443, with automatic HTTPS, security headers and basic auth for the private sites. Nothing else on the server publishes a port."},Oe=[{project:"ControlPanel",file:"deploy/vps/Caddyfile",line:1,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],aa={id:Ce,summary:Ee,refs:Oe},sa=Object.freeze(Object.defineProperty({__proto__:null,default:aa,id:Ce,refs:Oe,summary:Ee},Symbol.toStringTag,{value:"Module"})),Re="financepowerapp",Ie={fa:"حسابداری یک گروه کلینیک در انتاریو: دفاتر هر کلینیک، آزمایشگاه و داروخانه، با داده از اپ‌های پلتفرم ClinicHub. کارش را به‌صورت یک canvas app در Power Apps روی Azure SQL شروع کرد.",en:"Accounting for an Ontario clinic group: the books of each clinic, the lab and the pharmacy, fed by the ClinicHub platform's applications. It started as a Power Apps canvas app over Azure SQL."},Le=[{project:"FinancePowerApp",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],oa={id:Re,summary:Ie,refs:Le},ia=Object.freeze(Object.defineProperty({__proto__:null,default:oa,id:Re,refs:Le,summary:Ie},Symbol.toStringTag,{value:"Module"})),De="integrationhub",He={fa:"موتور واسط پلتفرم ClinicHub: سفارش‌ها، لغوها، نتیجه‌ها و اسناد مالی بین ClinicHub، LabFlow، ClinicReport، FinancePowerApp و PharmaFlow از آن رد می‌شوند، با یک لاگ واحد از هر چه فرستاده شد. PostgreSQL و RabbitMQ.",en:"The interface engine of the ClinicHub platform: orders, cancels, results and financial documents between ClinicHub, LabFlow, ClinicReport, FinancePowerApp and PharmaFlow pass through it, with one log of what was sent. PostgreSQL and RabbitMQ."},We=[{project:"IntegrationHub",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],ra={id:De,summary:He,refs:We},la=Object.freeze(Object.defineProperty({__proto__:null,default:ra,id:De,refs:We,summary:He},Symbol.toStringTag,{value:"Module"})),Fe="labflow",Me={fa:"سیستم اطلاعات آزمایشگاه برای یک آزمایشگاه محلی در انتاریو: نوبت، پذیرش، نمونه‌گیری، نتیجه، گزارش آنلاین و ایمیل، با تفسیر کمکی هوش مصنوعی که پزشک بازبینی می‌کند. ASP.NET Core و React.",en:"A lab information system for an Ontario community lab: booking, reception, collection, results, online reports and email, with AI-assisted interpretation that a clinician reviews. ASP.NET Core and React."},ze=[{project:"LabFlow",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],da={id:Fe,summary:Me,refs:ze},ca=Object.freeze(Object.defineProperty({__proto__:null,default:da,id:Fe,refs:ze,summary:Me},Symbol.toStringTag,{value:"Module"})),Ve="languagelessondesigner",qe={fa:"درس‌های collocation انگلیسی، با یک سرویس کوچک همگام‌سازی که پیشرفت مرور را روی سرور نگه می‌دارد. همین اپ، پشت basic auth روی ctx، خواننده‌ی خصوصی Context صاحبش است.",en:"The English collocation lessons, with a small sync service that keeps review progress on the server. The same app, behind basic auth on ctx, is the owner's private Context reader."},Be=[{project:"ControlPanel",file:"deploy/vps/Caddyfile",line:46,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],pa={id:Ve,summary:qe,refs:Be},ua=Object.freeze(Object.defineProperty({__proto__:null,default:pa,id:Ve,refs:Be,summary:qe},Symbol.toStringTag,{value:"Module"})),Ne="ledgerdashboard",Qe={fa:"ردیاب جست‌وجوی شغل و رزومه‌ساز با هوش مصنوعی: رابط React و API با Node/Express، روی فایل‌های واقعی جست‌وجوی شغل و دیتابیس SQL Server خودش.",en:"A job-search tracker and AI résumé builder: a React front end and a Node/Express API over the real job-search files and its own SQL Server database."},ha={id:Ne,summary:Qe},fa=Object.freeze(Object.defineProperty({__proto__:null,default:ha,id:Ne,summary:Qe},Symbol.toStringTag,{value:"Module"})),Ue="overview",Ge=[{id:"intro",h:"The portfolio as one system",p:["Every project, one server. Caddy is the only thing that faces the internet; behind it each site goes to its own containers, three of the apps share one SQL Server, and Control Panel watches all of them through small adapters.","Each box is a project. A solid outline runs on the VPS, a dashed one only on the PC, a dotted one is outside this compose and is reached over the network. Click a box for its page: its services, what it talks to, and how to work with it."]}],Ke=[{id:"intro",h:"همه‌ی پروژه‌ها به‌عنوان یک سیستم",p:["همه‌ی پروژه‌ها، یک سرور. Caddy تنها چیزی است که رو به اینترنت است؛ پشت آن هر سایت به کانتینرهای خودش می‌رود، سه اپ یک SQL Server مشترک دارند، و کنترل پنل همه را از طریق adapterهای کوچک زیر نظر دارد.","هر جعبه یک پروژه است. خط کامل یعنی روی VPS اجرا می‌شود، خط‌چین یعنی فقط روی PC، و نقطه‌چین یعنی بیرون از این compose است و از طریق شبکه به آن وصل می‌شوند. روی هر جعبه کلیک کنید تا صفحه‌اش باز شود: سرویس‌هایش، با چه چیزهایی حرف می‌زند، و چطور با آن کار کنید."]}],ma={id:Ue,en:Ge,fa:Ke},ga=Object.freeze(Object.defineProperty({__proto__:null,default:ma,en:Ge,fa:Ke,id:Ue},Symbol.toStringTag,{value:"Module"})),Je="pharmaflow",Ye={fa:"داروخانه‌ی محلی برای یک گروه کلینیک در انتاریو، بخشی از پلتفرم ClinicHub: نسخه‌ی انتاریویی یک سیستم قدیمی داروخانه‌ی بیمارستان.",en:"A community pharmacy for an Ontario clinic group, part of the ClinicHub platform: the Ontario version of a legacy hospital pharmacy system."},Xe=[{project:"PharmaFlow",file:"README.md",line:3,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],ba={id:Je,summary:Ye,refs:Xe},va=Object.freeze(Object.defineProperty({__proto__:null,default:ba,id:Je,refs:Xe,summary:Ye},Symbol.toStringTag,{value:"Module"})),Ze="programminglessondesigner",en={fa:"همین سایت: درس‌های برنامه‌نویسی روی کد واقعی پروژه‌ها، هر مفهوم کنار هم در چند زبان، و همین تب پروژه‌ها.",en:"This site: programming lessons built on real project code, each concept compared side by side, and this Projects tab."},nn=[{project:"ProgrammingLessonDesigner",file:"README.md",line:1,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],ya={id:Ze,summary:en,refs:nn},wa=Object.freeze(Object.defineProperty({__proto__:null,default:ya,id:Ze,refs:nn,summary:en},Symbol.toStringTag,{value:"Module"})),tn="rebiomed",an={fa:"بازار کانادایی تجهیزات پزشکی دست‌دوم: MongoDB، Express، React و Node، با TypeScript در بک‌اند و پرداخت آزمایشی Stripe به دلار کانادا.",en:"A Canadian marketplace for pre-owned medical equipment: MongoDB, Express, React and Node, TypeScript on the back end, and a Stripe test-mode checkout in CAD."},sn=[{project:"mern-animation-project",file:"README.md",line:5,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],ka={id:tn,summary:an,refs:sn},_a=Object.freeze(Object.defineProperty({__proto__:null,default:ka,id:tn,refs:sn,summary:an},Symbol.toStringTag,{value:"Module"})),on="shared",rn={fa:"یک SQL Server Express در کانتینر، مشترک بین کنترل پنل، LedgerDashboard و LabFlow. هر اپ دیتابیس و login کم‌دسترسی خودش را دارد، و همه هر شب بکاپ گرفته می‌شوند.",en:"One SQL Server Express in a container, shared by Control Panel, LedgerDashboard and LabFlow. Each app has its own database and its own least-privilege login, and all of them are backed up nightly."},ln=[{project:"ControlPanel",file:"deploy/vps/compose.vps.yml",line:55,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],Ta={id:on,summary:rn,refs:ln},$a=Object.freeze(Object.defineProperty({__proto__:null,default:Ta,id:on,refs:ln,summary:rn},Symbol.toStringTag,{value:"Module"})),dn="styling",cn={en:"Sass where it earns its place: tokens with names, a build that refuses unreadable colours, a few mixins, and one set of rules for both reading directions. Every example below is the real file, read at build time.",fa:"Sass هر جا که واقعاً به کار می‌آید: tokenهای نام‌دار، buildی که رنگ ناخوانا را رد می‌کند، چند mixin، و یک مجموعه قاعده برای هر دو جهت نوشتن. همه‌ی مثال‌های پایین خود فایل واقعی‌اند که موقع build خوانده می‌شوند."},pn=[{id:"split",h:"What Sass does, and what CSS variables do",p:["Sass runs once, at build time, and is gone when the page opens. So everything that changes while you look at the page, the dark theme and the text direction here, stays a CSS custom property. Sass writes those properties from its maps and checks them; the browser switches them."],examples:["theme"]},{id:"structure",h:"Structure: modules, not one big file",list:["`abstracts/`: tokens, functions and mixins. They emit no CSS, and every partial loads them with `@use '../abstracts' as *`.","`base/`: the theme, element defaults and print. `components/`: one partial per part of the lesson pages. `projects/`: this tab.","`@use` and `@forward` only. The old `@import` is deprecated in Dart Sass, and stylelint refuses it.","Nesting stops at three levels: deeper selectors are harder to override and say more about the HTML than they should."]},{id:"tokens",h:"Tokens: one name per colour",p:["Colours exist in one file only, `_tokens.scss`; stylelint rejects a hex value anywhere else. The dark theme does not repeat the light one: `map.merge` takes the light map and changes only what differs."],examples:["themes"]},{id:"contrast",h:"A build that refuses unreadable colours",p:["A Sass function computes the WCAG contrast ratio of two colours. Every pair that carries text is checked in both themes, and a pair below 4.5:1 stops the build with its name and its ratio. The lowest pair today is muted text on the light background, at 5.46."],examples:["contrast"]},{id:"accents",h:"Each project's colour, checked too",p:["Every project has a colour in a map; a loop turns it into an `.accent-<id>` class for the map and the project pages, lifted for the dark theme. The box colour is mixed from it, so the text inside the box is checked as well: 3:1 for the outline (a graphic), 4.5:1 for the text."],examples:["accents"]},{id:"mixins",h:"Mixins and one placeholder",p:["A mixin where the same few lines repeat: the bordered card (`surface`, behind every card on the site) and the breakpoints. One `%placeholder` with `@extend`, for the small buttons, because there it joins selectors instead of copying lines. Everything else is plain rules."],examples:["surface","below","placeholders"]},{id:"maps",h:"Maps and loops instead of repeated rules",p:["Where rules differ only by a name, a map and `@each` write them: the three origin labels of a code sample, the highlight.js colours (used again by the print styles), and the arrows of the pager."],examples:["origins"]},{id:"direction",h:"Persian and English with the same rules",p:["This tab switches between right to left and left to right. Only logical properties are used (`border-inline-start`, `margin-inline-start`), so the contents list and its marker move to the right side by themselves. The one thing that must know the direction, the arrow on Previous and Next, comes from a map with both."],examples:["sidebar","pager"]},{id:"checks",h:"What CI checks",list:["`npm run lint:css`: stylelint with the SCSS standard rules, plus no `@import`, no hex colours outside the tokens, no named colours.","The contrast checks above, on every build.","`npm run check`: every project in the map has a colour, and both languages of every page have the same sections."]}],un=[{id:"split",h:"کار Sass و کار متغیرهای CSS",p:["Sass یک بار و فقط موقع build اجرا می‌شود و وقتی صفحه باز است دیگر وجود ندارد. پس هر چیزی که وقتی صفحه جلوی شماست عوض می‌شود، یعنی تم تاریک و جهت متن در همین تب، custom property در CSS می‌ماند. Sass این propertyها را از mapهایش می‌نویسد و چکشان می‌کند؛ مرورگر عوضشان می‌کند."],examples:["theme"]},{id:"structure",h:"ساختار: ماژول‌ها، نه یک فایل بزرگ",list:["`abstracts/`: tokenها، functionها و mixinها. هیچ CSSی تولید نمی‌کنند، و هر partial آن‌ها را با `@use '../abstracts' as *` می‌آورد.","`base/`: تم، پیش‌فرض‌های عناصر و چاپ. `components/`: یک partial برای هر بخش صفحه‌های درس. `projects/`: همین تب.","فقط `@use` و `@forward`. `@import` قدیمی در Dart Sass منسوخ شده و stylelint آن را رد می‌کند.","تودرتویی حداکثر سه سطح: selectorهای عمیق‌تر سخت‌تر override می‌شوند و بیش از اندازه به ساختار HTML وابسته‌اند."]},{id:"tokens",h:"Tokenها: برای هر رنگ یک نام",p:["رنگ‌ها فقط در یک فایل هستند، `_tokens.scss`؛ stylelint مقدار hex را هر جای دیگر رد می‌کند. تم تاریک تم روشن را تکرار نمی‌کند: `map.merge` map روشن را می‌گیرد و فقط تفاوت‌ها را عوض می‌کند."],examples:["themes"]},{id:"contrast",h:"buildی که رنگ ناخوانا را رد می‌کند",p:["یک function در Sass نسبت کنتراست WCAG دو رنگ را حساب می‌کند. هر جفت رنگی که متن رویش است در هر دو تم چک می‌شود، و جفتی زیر ۴.۵ به ۱ build را با نام و نسبتش متوقف می‌کند. کم‌کنتراست‌ترین جفت فعلی متن کم‌رنگ روی پس‌زمینه‌ی روشن است، با نسبت ۵.۴۶."],examples:["contrast"]},{id:"accents",h:"رنگ هر پروژه هم چک می‌شود",p:["هر پروژه یک رنگ در یک map دارد؛ یک حلقه آن را به کلاس `.accent-<id>` برای نقشه و صفحه‌های پروژه تبدیل می‌کند، و برای تم تاریک روشن‌ترش می‌کند. رنگ جعبه از همین رنگ ترکیب می‌شود، پس متن داخل جعبه هم چک می‌شود: ۳ به ۱ برای خط دور (یک گرافیک)، ۴.۵ به ۱ برای متن."],examples:["accents"]},{id:"mixins",h:"Mixinها و یک placeholder",p:["Mixin جایی که همان چند خط تکرار می‌شود: کارت حاشیه‌دار (`surface`، پشت همه‌ی کارت‌های سایت) و breakpointها. یک `%placeholder` با `@extend`، برای دکمه‌های کوچک، چون آنجا selectorها را کنار هم می‌گذارد به‌جای کپی کردن خط‌ها. بقیه قاعده‌های ساده‌اند."],examples:["surface","below","placeholders"]},{id:"maps",h:"Map و حلقه به‌جای قاعده‌های تکراری",p:["جایی که قاعده‌ها فقط در یک نام فرق دارند، یک map و `@each` آن‌ها را می‌نویسند: سه برچسب منشأ نمونه‌کد، رنگ‌های highlight.js (که استایل چاپ هم دوباره از آن‌ها استفاده می‌کند)، و فلش‌های دکمه‌های قبلی و بعدی."],examples:["origins"]},{id:"direction",h:"فارسی و انگلیسی با همان قاعده‌ها",p:["این تب بین راست‌به‌چپ و چپ‌به‌راست عوض می‌شود. فقط خاصیت‌های منطقی به کار رفته‌اند (`border-inline-start`، `margin-inline-start`)، پس فهرست کناری و نشانه‌اش خودشان به سمت راست می‌روند. تنها چیزی که باید جهت را بداند، فلش دکمه‌های قبلی و بعدی، از یک map با هر دو جهت می‌آید."],examples:["sidebar","pager"]},{id:"checks",h:"چیزهایی که CI چک می‌کند",list:["`npm run lint:css`: stylelint با قاعده‌های استاندارد SCSS، به‌اضافه‌ی ممنوعیت `@import`، رنگ hex بیرون از tokenها، و رنگ با نام.","چک‌های کنتراست بالا، در هر build.","`npm run check`: هر پروژه‌ی نقشه یک رنگ دارد، و هر دو زبانِ هر صفحه بخش‌های یکسان دارند."]}],hn={theme:{title:{en:"Sass writes the custom properties; the browser switches them",fa:"Sass propertyها را می‌نویسد؛ مرورگر عوضشان می‌کند"},lang:"scss",file:"styles/base/_theme.scss",region:"theme"},themes:{title:{en:"The dark theme says only what differs",fa:"تم تاریک فقط تفاوت‌ها را می‌گوید"},lang:"scss",file:"styles/abstracts/_tokens.scss",region:"themes"},contrast:{title:{en:"WCAG contrast in Sass, and the error that stops the build",fa:"کنتراست WCAG در Sass، و خطایی که build را متوقف می‌کند"},lang:"scss",file:"styles/abstracts/_functions.scss",region:"contrast"},accents:{title:{en:"Every project colour, checked in both themes",fa:"رنگ هر پروژه، چک‌شده در هر دو تم"},lang:"scss",file:"styles/projects/_accents.scss",region:"accents-check"},surface:{title:{en:"The card mixin",fa:"mixin کارت"},lang:"scss",file:"styles/abstracts/_mixins.scss",region:"surface"},below:{title:{en:"A breakpoint mixin that can include paper",fa:"mixin breakpoint که کاغذ چاپی را هم می‌گیرد"},lang:"scss",file:"styles/abstracts/_mixins.scss",region:"below"},placeholders:{title:{en:"The one placeholder: small buttons",fa:"تنها placeholder: دکمه‌های کوچک"},lang:"scss",file:"styles/components/_controls.scss",region:"placeholders"},origins:{title:{en:"A map and @each for the origin labels",fa:"یک map و @each برای برچسب‌های منشأ"},lang:"scss",file:"styles/components/_code.scss",region:"origins"},sidebar:{title:{en:"The contents list: logical properties only",fa:"فهرست کناری: فقط خاصیت‌های منطقی"},lang:"scss",file:"styles/projects/_docs.scss",region:"sidebar"},pager:{title:{en:"Arrows that follow the reading direction",fa:"فلش‌هایی که جهت خواندن را دنبال می‌کنند"},lang:"scss",file:"styles/projects/_docs.scss",region:"pager"}},Aa={id:dn,summary:cn,en:pn,fa:un,examples:hn},Sa=Object.freeze(Object.defineProperty({__proto__:null,default:Aa,en:pn,examples:hn,fa:un,id:dn,summary:cn},Symbol.toStringTag,{value:"Module"})),fn="wutility",mn={fa:"wUtility Web، ابزاری با .NET که دیتابیس‌های SQL Server را همگام می‌کند. API آن به‌جای این compose روی Azure اجرا می‌شود، چون با Windows authentication وصل می‌شود؛ کنترل پنل از طریق wutility-adapter و با کلید API به آن می‌رسد.",en:"wUtility Web, a .NET tool that syncs SQL Server databases. Its API runs on Azure rather than in this compose, because it connects with Windows authentication; Control Panel reaches it through wutility-adapter with an API key."},gn=[{project:"ControlPanel",file:"README.md",line:119,note:{fa:"منبع این خلاصه",en:"Where this summary comes from"}}],xa={id:fn,summary:mn,refs:gn},Pa=Object.freeze(Object.defineProperty({__proto__:null,default:xa,id:fn,refs:gn,summary:mn},Symbol.toStringTag,{value:"Module"})),ja=[{project:"analytics",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"finance",title:{en:"From FinancePowerApp",fa:"از FinancePowerApp"}},{id:"dbt",title:{en:"Warehouse models (dbt)",fa:"مدل‌های انبار داده (dbt)"}},{id:"events",title:{en:"Events from IntegrationHub",fa:"رویدادهای IntegrationHub"}},{id:"access",title:{en:"Sign-in, scope and the API",fa:"ورود، محدوده و API"}},{id:"models",title:{en:"Forecasts and anomalies",fa:"پیش‌بینی‌ها و ناهنجاری‌ها"}},{id:"ops",title:{en:"Runs and their checks",fa:"اجراها و بررسی‌هایشان"}},{id:"web",title:{en:"Dashboard (React)",fa:"داشبورد (React)"}}],pages:[{id:"overview",group:"start",title:{en:"What Analytics is",fa:"Analytics چیست"},heads:{fa:["گزارش و پیش‌بینی، فقط خواندنی","تصمیم‌هایی که بقیه از آن‌ها پیروی می‌کند","ساخته‌شده در فازها، بی‌پرده"],en:["Reporting and forecasting, read-only","The decisions everything else follows","Built in phases, said plainly"]}},{id:"run",group:"start",title:{en:"Run it",fa:"اجرا"},heads:{fa:["یک CLI، چند فرمان","همه‌ی تنظیمات در یک کلاس","serve، و یک image برای سه سرویس"],en:["One CLI, many commands","Every setting in one class","serve, and one image for three services"]}},{id:"tests",group:"start",title:{en:"Tests",fa:"تست‌ها"},heads:{fa:["داده‌ی ساختگی و یک ClinicHub بدل","cache تازه‌ی تنظیمات برای هر تست","CI چه اجرا می‌کند"],en:["Synthetic data and a stand-in ClinicHub","A fresh settings cache for every test","What CI runs"]}},{id:"columns",group:"finance",title:{en:"Columns one by one",fa:"ستون‌ها یکی‌یکی"},heads:{fa:["یک فهرست، هرگز SELECT *","ستون‌هایی که هرگز نباید خوانده شوند","یک view اختیاری"],en:["A list, never SELECT *","Columns that must never be read","An optional view"]}},{id:"extract",group:"finance",title:{en:"Extract runs and the raw schema",fa:"اجراهای استخراج و schema خام"},heads:{fa:["یک پوشه برای هر اجرا","فقط اجراهای کامل حساب می‌شوند","تاریخچه‌ی سن‌بندی که از اجراها دوباره ساخته می‌شود"],en:["One folder per run","Only complete runs count","An ageing history rebuilt from the runs"]}},{id:"marts",group:"dbt",title:{en:"Staging and marts",fa:"staging و martها"},heads:{fa:["raw، staging، martها","یک business و slug کلینیکش","درآمد یعنی بستانکار منهای بدهکار"],en:["raw, staging, marts","A business and its clinic slug","Revenue is credits minus debits"]}},{id:"checks",group:"dbt",title:{en:"Balances, ageing and OHIP",fa:"تراز، سن‌بندی و OHIP"},heads:{fa:["تست، queryی است که نباید چیزی برگرداند","دسته‌های سن‌بندی برای هر snapshot","آن‌چه OHIP کم پرداخت یا رد کرد"],en:["A test is a query that must return nothing","Ageing buckets per snapshot","What OHIP short-paid and refused"]}},{id:"allow-list",group:"events",title:{en:"A strict allow-list",fa:"یک allow-list سخت‌گیر"},heads:{fa:["هر فیلد باید شبیه قرارداد باشد","نسخه، نوع، بعد فیلدها","آن‌چه قرارداد نام نبرده دور ریخته می‌شود"],en:["Every field must look like the contract","Version, type, then the fields","What the contract does not name is dropped"]}},{id:"consumer",group:"events",title:{en:"The consumer: write, then acknowledge",fa:"consumer: اول بنویس، بعد تأیید کن"},heads:{fa:["exchange مال hub، صف مال ما","تأیید فقط بعد از رسیدن فایل به دیسک","خالی کردن صف، یا ادامه دادن"],en:["The hub's exchange, our queue","Acknowledged only after the file is on disk","Drain, or keep running"]}},{id:"orders",group:"events",title:{en:"From events to orders",fa:"از رویدادها تا درخواست‌ها"},heads:{fa:["یک ردیف برای هر شناسه‌ی رویداد","یک درخواست از رویدادهایش، با هر ترتیبی","میانه و صدک ۹۰"],en:["One row per event id","An order from its events, in any order","Median and 90th percentile"]}},{id:"tokens",group:"access",title:{en:"ClinicHub tokens",fa:"tokenهای ClinicHub"},heads:{fa:["چه چیزی بررسی می‌شود","دو املای یک permission","از permissionها تا محدوده"],en:["What is checked","Two spellings of a permission","From permissions to a scope"]}},{id:"clinic-scope",group:"access",title:{en:"A clinic sees only its own numbers",fa:"هر کلینیک فقط عددهای خودش را می‌بیند"},heads:{fa:["وابستگی‌ها روی هر endpoint","کلینیک همیشه اعمال می‌شود","با شکستن آزموده شده"],en:["Dependencies on every endpoint","The clinic always applies","Tested by breaking it"]}},{id:"api",group:"access",title:{en:"The API's queries",fa:"queryهای API"},heads:{fa:["groupBy از یک فهرست ثابت","groupBy=none","فقط خواندنی، و صادق وقتی نمی‌تواند بخواند"],en:["groupBy from a fixed list","groupBy=none","Read-only, and honest when it cannot read"]}},{id:"forecast",group:"models",title:{en:"Revenue forecast and its baseline",fa:"پیش‌بینی درآمد و baseline آن"},heads:{fa:["چهار نامزد، ساده‌ترین اول","backtest با مبدأ غلتان، کمترین MASE","یک نوار تقریبی"],en:["Four candidates, simplest first","Rolling-origin backtest, lowest MASE","A rough band"]}},{id:"anomalies",group:"models",title:{en:"Remittance anomalies",fa:"ناهنجاری‌های پرداخت OHIP"},heads:{fa:["در برابر تاریخچه‌ی خود ارائه‌دهنده","سه قاعده برای پرچم"],en:["Against the provider's own history","Three rules for a flag"]}},{id:"pipeline",group:"ops",title:{en:"analytics run: a copy, then a swap",fa:"analytics run: یک کپی، بعد جایگزینی"},heads:{fa:["هرگز در جای خودش ساخته نمی‌شود","گام‌هایی که اجرا را متوقف می‌کنند و گام‌هایی که نه","schedule: یک حلقه، نه cron"],en:["Never built in place","Steps that stop the run, steps that do not","schedule: a loop, not cron"]}},{id:"quality",group:"ops",title:{en:"Data-quality report and alerts",fa:"گزارش کیفیت داده و هشدارها"},heads:{fa:["یک گزارش برای هر اجرا، بیرون از انبار","از عددها تا هشدارها","یک بار بگو، بعد از یک روز دوباره"],en:["A report per run, outside the warehouse","From numbers to warnings","Tell once, then again after a day"]}},{id:"reconcile",group:"ops",title:{en:"Reconciliation with FinancePowerApp",fa:"تطبیق با FinancePowerApp"},heads:{fa:["جمع‌های خود دفاتر","اختلاف یک هشدار است"],en:["The books' own totals","A difference is a warning"]}},{id:"web",group:"web",title:{en:"Sign-in and pages",fa:"ورود و صفحه‌ها"},heads:{fa:["جریان code با PKCE، فقط برای همین tab","یک ۴۰۱ از نو شروع می‌کند، حداکثر سه بار","صفحه‌ها"],en:["Code flow with PKCE, for this tab only","A 401 starts over, three times at most","Pages"]}},{id:"web-data",group:"web",title:{en:"Filters, data and CSV",fa:"فیلترها، داده و CSV"},heads:{fa:["شمارش رو به عقب از آخرین داده","کد business و slug کلینیک","CSVی که spreadsheet اجرایش نمی‌کند"],en:["Counted back from the latest data","Business codes and clinic slugs","CSV that a spreadsheet will not run"]}}]},{project:"clinichub",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"platform",title:{en:"Platform: one sign-in, a database per clinic",fa:"پلتفرم: یک ورود، یک دیتابیس برای هر کلینیک"}},{id:"security",title:{en:"Security and access",fa:"امنیت و دسترسی"}},{id:"clinic",title:{en:"The clinic's day",fa:"روز کاری کلینیک"}},{id:"billing",title:{en:"OHIP billing and money",fa:"صورت‌حساب OHIP و پول"}},{id:"integrations",title:{en:"Orders and results (FHIR)",fa:"درخواست‌ها و جواب‌ها (FHIR)"}},{id:"frontend",title:{en:"Frontend (React)",fa:"فرانت‌اند (React)"}},{id:"data",title:{en:"Data (SQL Server, EF Core)",fa:"داده (SQL Server، EF Core)"}}],pages:[{id:"run",group:"start",title:{en:"Run it on the PC",fa:"اجرا روی PC"},heads:{fa:["دو پروسه، یک origin","فقط یک SQL Server لازم است","کلینیک‌های دمو موقع شروع"],en:["Two processes, one origin","A SQL Server and nothing else","Demo clinics on start"]}},{id:"tests",group:"start",title:{en:"Tests against a real SQL Server",fa:"تست روی SQL Server واقعی"},heads:{fa:["دیتابیس‌های یک‌بارمصرف، نه یک بدل در حافظه","بعد از خودش تمیز می‌کند","ورود، همان‌طور که صفحه وارد می‌شود","بدل برنامه‌های دیگر"],en:["Throw-away databases, not an in-memory fake","Cleaning up after itself","Signing in like the page does","Stand-ins for the other applications"]}},{id:"startup",group:"platform",title:{en:"Program.cs: start-up and the pipeline",fa:"Program.cs: شروع و pipeline"},heads:{fa:["endpointهای خودش","secretها به شکل فایل","همه‌ی کلینیک‌ها قبل از اولین درخواست به‌روز می‌شوند","middlewareها با ترتیب حساب‌شده","«اول کلینیک را انتخاب کن» به شکل 409"],en:["Endpoints of its own","Secrets as files","Every clinic upgraded before the first request","Middleware in a deliberate order",'"Choose a clinic first" as a 409']}},{id:"clinic-db",group:"platform",title:{en:"Which database serves the request",fa:"کدام دیتابیس به درخواست جواب می‌دهد"},heads:{fa:["هر کلینیک یک دیتابیس","از claim کلینیک تا DbContext","connection stringها cache می‌شوند و اگر خاص باشند رمز می‌شوند","باز کردن بدون await، بعد از اعتبارسنجی"],en:["One database per clinic","From the clinic claim to a DbContext","Connection strings cached, and encrypted when they are special","Opened without awaiting, already validated"]}},{id:"provisioning",group:"platform",title:{en:"Opening a clinic",fa:"باز کردن یک کلینیک"},heads:{fa:["endpointها (مدیران پلتفرم)","هر چیزی که کلینیک تازه لازم دارد، با یک فراخوانی","slugی که در اسم دیتابیس امن باشد","مجوزهای تازه بدون پاک کردن انتخاب‌های کلینیک","همان کد در هر شروع"],en:["Endpoints (platform administrators)","Everything a new clinic needs, in one call","A slug that is safe in a database name","New permissions without overwriting a clinic's choices","The same code on every start"]}},{id:"sign-in",group:"security",title:{en:"Signing in",fa:"ورود"},heads:{fa:["endpointها","پنج رمز اشتباه، پانزده دقیقه","همان کار برای اسم کاربری‌ای که وجود ندارد","کد بخشی از همان درخواست است","مستقیم به تنها کلینیک"],en:["Endpoints","Five wrong passwords, fifteen minutes","The same work for a user name that does not exist","The code is part of the same request","Straight into the only clinic"]}},{id:"session",group:"security",title:{en:"The session cookie and the CSRF header",fa:"کوکی نشست و هدر CSRF"},heads:{fa:["کوکی کوچک که در هر درخواست دوباره خوانده می‌شود","هر آدم در یک کلینیک چه کاری می‌تواند بکند","واردشده، مگر endpoint چیز دیگری بگوید","کوکی Lax، به‌علاوه‌ی یک هدر"],en:["A small cookie, read again on every request","What a person may do in one clinic","Signed in unless an endpoint says otherwise","Lax cookie, plus a header"]}},{id:"two-factor",group:"security",title:{en:"Two-factor sign-in (TOTP)",fa:"ورود دومرحله‌ای (TOTP)"},heads:{fa:["RFC 6238 در یک کلاس کوچک","خطای ساعت قبول، هر کد فقط یک بار","secret رمزشده، اجباری از طریق نقش‌ها","روشن و خاموش کردن"],en:["RFC 6238 in one small class","Clock drift allowed, a code used once","Encrypted secret, enforced by roles","Turning it on and off"]}},{id:"permissions",group:"security",title:{en:"Permissions and roles",fa:"مجوزها و نقش‌ها"},heads:{fa:["endpointها (آدم‌ها و نقش‌ها)","endpointها مجوز را چک می‌کنند، هیچ‌وقت اسم نقش را","هر permission یک policy است","مجوزهای برنامه‌های دیگر هم همین‌جاست","نقش‌هایی که هر کلینیک با آن‌ها شروع می‌کند","کسی باید کلیدها را نگه دارد"],en:["Endpoints (people and roles)","Endpoints check permissions, never role names","Every permission is a policy","Other applications' permissions live here too","The roles a clinic starts with","Someone must keep the keys"]}},{id:"logs",group:"security",title:{en:"The security log and the PHIPA access log",fa:"لاگ امنیتی و لاگ دسترسی PHIPA"},heads:{fa:["endpointها","دو لاگ، در دو جا","کنار خود کار نوشته می‌شود","خواندن آن‌ها، کلینیک به کلینیک","جدول‌ها"],en:["Endpoints","Two logs, in two places","Written next to the work","Reading them, clinic by clinic","The tables"]}},{id:"sso",group:"security",title:{en:"ClinicHub as an OpenID Connect provider",fa:"ClinicHub به‌عنوان OpenID Connect provider"},heads:{fa:["endpointها","Authorize: فوراً برمی‌گردد یا از صفحه‌های ClinicHub رد می‌شود","هر refresh آدم را دوباره می‌خواند","برنامه‌ها از طرف خودشان"],en:["Endpoints","Authorize: back at once, or through ClinicHub's pages","A refresh reads the person again","Applications on their own behalf"]}},{id:"frontdesk",group:"clinic",title:{en:"Front desk: the day board and check-in",fa:"پذیرش: تابلوی روز و پذیرش بیمار"},heads:{fa:["endpointها","نوبت فقط رو به جلو می‌رود","پذیرش ویزیت را باز می‌کند","هر اتاق یک بیمار؛ دو منشی نمی‌توانند هر دو برنده شوند","بیمار walk-in به کوتاه‌ترین صف می‌رود"],en:["Endpoints","An appointment moves only forward","Check-in opens the visit","A room holds one patient; two clerks cannot both win","Walk-ins go to the shortest queue"]}},{id:"health-card",group:"clinic",title:{en:"The Ontario health card and HCV",fa:"کارت سلامت انتاریو و HCV"},heads:{fa:["ده رقم، رقم آخر check digit به روش Luhn","هنگام ثبت‌نام: مرتب کردن، بعد بررسی","Health Card Validation، شبیه‌سازی‌شده","دیتابیس هم چکش می‌کند"],en:["Ten digits, the last one a Luhn check digit","At registration: tidy, then check","Health Card Validation, simulated","The database checks it too"]}},{id:"patients",group:"clinic",title:{en:"Patients: one person, one record",fa:"بیماران: یک آدم، یک پرونده"},heads:{fa:["endpointها","دو پرونده چقدر شبیه‌اند","دو آستانه","ادغام همه‌چیز را به پرونده‌ی باقی‌مانده منتقل می‌کند","ادغام را می‌شود برگرداند"],en:["Endpoints","How alike two records are","Two thresholds","Merging moves everything to the survivor","A merge can be undone"]}},{id:"consent",group:"clinic",title:{en:"PHIPA consent directives (the lockbox)",fa:"consent directiveهای PHIPA (lockbox)"},heads:{fa:["endpointها","سه چیزی که بیمار می‌تواند پنهان کند","یک تصمیم، که همه‌جا استفاده می‌شود","آنچه به صفحه گفته می‌شود","override اضطراری: یک ساعت، یک دلیل، یک ثبت","پس گرفته می‌شود، هرگز پاک نمی‌شود"],en:["Endpoints","Three things a patient can withhold","One decision, used everywhere","What the page is told","Emergency override: an hour, a reason, a record","Withdrawn, never deleted"]}},{id:"visits",group:"clinic",title:{en:"The visit: note, signing, addenda",fa:"ویزیت: یادداشت، امضا، addendum"},heads:{fa:["endpointها","یادداشت SOAP که هم‌زمان با تایپ ذخیره می‌شود","فقط پزشک معالج امضا می‌کند","صورت‌حساب از امضا شروع می‌شود","یادداشت امضاشده هیچ‌وقت عوض نمی‌شود"],en:["Endpoints","A SOAP note saved as you type","Only the treating provider signs","Signing is where the bill starts","A signed note never changes"]}},{id:"claims",group:"billing",title:{en:"OHIP claims: the MC EDT file",fa:"claimهای OHIP: فایل MC EDT"},heads:{fa:["endpointها","رکوردهای fixed-width با ۷۹ کاراکتر","سرآیند، claimها، قلم‌ها، پایان‌نما","یک فایل برای هر شماره‌ی billing"],en:["Endpoints","Fixed-width records of 79 characters","Header, claims, items, trailer","One file per billing number"]}},{id:"remittance",group:"billing",title:{en:"The remittance advice and reconciliation",fa:"remittance advice و تطبیق"},heads:{fa:["تطبیق خط به خط","هر فایل فقط یک بار import می‌شود","طلب هر پزشک","claim ردشده به Ready برمی‌گردد"],en:["Matched line by line","A file is imported once","What each physician is owed","A refused claim goes back to Ready"]}},{id:"finance",group:"billing",title:{en:"Money to the group's accounting",fa:"پول به حسابداری گروه"},heads:{fa:["سندهای مالی، بدون اطلاعات سلامت","هر سند یک بار فرستاده می‌شود"],en:["Financial documents, no health information","Each document sent once"]}},{id:"orders",group:"integrations",title:{en:"Orders: FHIR Bundles through an outbox",fa:"درخواست‌ها: Bundleهای FHIR از طریق outbox"},heads:{fa:["endpointها","درخواست و پیامش در یک تراکنش","تلاش دوباره با مکث‌های بلندتر","لغوی که رد شود جواب است، نه خطا","tokenهایی که ClinicHub برای خودش امضا می‌کند"],en:["Endpoints","The order and its message, in one transaction","Retried with growing pauses","A refused cancellation is an answer, not an error","Tokens ClinicHub signs for itself"]}},{id:"results",group:"integrations",title:{en:"Results coming back",fa:"جواب‌هایی که برمی‌گردند"},heads:{fa:["endpointها","فقط برنامه‌ها می‌توانند به /fhir بفرستند","هر گزارش درخواستش را نام می‌برد و هر درخواست فرستنده‌اش را","گزارش اصلاح‌شده باید دوباره خوانده شود","صندوق جواب‌ها هم consent را رعایت می‌کند"],en:["Endpoints","Only applications may post to /fhir","Each report names its order, and the order its sender","A corrected report must be read again","The inbox respects consent too"]}},{id:"fe-shell",group:"frontend",title:{en:"Routes, the top bar and the API client",fa:"routeها، نوار بالا و API client"},heads:{fa:["routeها","سه صفحه پیش از shell","هر کس از جایی شروع می‌کند که کارش آن‌جاست","منو همان مجوزهاست","عوض کردن کلینیک"],en:["Routes","Three screens before the shell","Everyone starts where their work is","The menu is the permissions","Switching clinic"]}},{id:"fe-autosave",group:"frontend",title:{en:"The visit page: saving as you type",fa:"صفحه‌ی ویزیت: ذخیره هم‌زمان با تایپ"},heads:{fa:["۸۰۰ میلی‌ثانیه بعد از آخرین کلید","هر بار فقط یک save","ترک صفحه ذخیره می‌کند","پیش از امضا ذخیره، بعد از آن رد"],en:["800 ms after the last key","One save at a time","Leaving the page saves","Saved before signing, refused after"]}},{id:"data-catalog",group:"data",title:{en:"The catalog database",fa:"دیتابیس catalog"},heads:{fa:["خوانده‌شده از migrationها","کلینیک‌ها، حساب‌ها، نقش‌ها","قاعده‌هایی که catalog نگه می‌دارد","جدول‌های سرور ورود هم این‌جاست","دیتابیس کلینیک migrate می‌شود و بعد فهرست‌هایش را می‌گیرد"],en:["Read from the migrations","Clinics, accounts, roles","The rules the catalog keeps","The sign-in server's tables too","A clinic database is migrated, then given its lists"]}},{id:"data-care",group:"data",title:{en:"A clinic's database: people, schedule, care",fa:"دیتابیس کلینیک: آدم‌ها، برنامه، مراقبت"},heads:{fa:["schemaها بر اساس موضوع","convention به‌جای attribute در همه‌جا","قاعده‌هایی که دیتابیس تکرار می‌کند","بیماران و consent","کلینیک و برنامه‌اش","ویزیت"],en:["Schemas by concern","Conventions instead of attributes everywhere","Rules the database repeats","Patients and consent","The clinic and its schedule","The visit"]}},{id:"data-orders",group:"data",title:{en:"A clinic's database: orders, billing, reference",fa:"دیتابیس کلینیک: درخواست‌ها، صورت‌حساب، مرجع"},heads:{fa:["درخواست‌ها، نسخه‌ها و outbox","claimها، remittanceها، فاکتورها","فهرست‌های مرجع و نسخه‌ی کارکنان"],en:["Orders, prescriptions and the outbox","Claims, remittances, invoices","Reference lists and the staff copy"]}}]},{project:"clinicreport",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"templates",title:{en:"Templates: the form is data",fa:"قالب‌ها: فرم، داده است"}},{id:"reports",title:{en:"Writing a report",fa:"نوشتن گزارش"}},{id:"security",title:{en:"Accounts and security",fa:"حساب‌ها و امنیت"}},{id:"clinichub",title:{en:"With ClinicHub: sign-in, orders, results",fa:"با ClinicHub: ورود، درخواست‌ها، جواب‌ها"}},{id:"frontend",title:{en:"Frontend (React)",fa:"فرانت‌اند (React)"}},{id:"data",title:{en:"Data (SQLite)",fa:"داده (SQLite)"}}],pages:[{id:"run",group:"start",title:{en:"Run it: Docker or the PC",fa:"اجرا: Docker یا PC"},heads:{fa:["یک container، یک volume","روی PC، سه profile","موقع بالا آمدن چه می‌شود","روی سرور، دو بار"],en:["One container, one volume","On the PC, three profiles","What happens at start","On the server, twice"]}},{id:"tests",group:"start",title:{en:"Tests and CI",fa:"تست‌ها و CI"},heads:{fa:["API واقعی روی یک دیتابیس دورریختنی","دو نفر هم‌زمان تایپ می‌کنند","ClinicHub، با بازی تست","CI با image تمام می‌شود"],en:["The real API on a throwaway database","Two people typing at once","ClinicHub, played by the test","CI ends with the image"]}},{id:"template-model",group:"templates",title:{en:"A template: sections, fields, phrases",fa:"یک قالب: بخش‌ها، فیلدها، جمله‌ها"},heads:{fa:["جواب، جمله‌اش را با خودش دارد","شش نوع فیلد","محدوده‌ی نرمال بر اساس جنس","غلط تایپی با صدای بلند خطا می‌دهد"],en:["The answer carries the sentence","Six field types","Normal ranges by sex","A typo fails loudly"]}},{id:"formula",group:"templates",title:{en:"Calculated fields: a small, safe language",fa:"فیلدهای محاسبه‌ای: یک زبان کوچک و امن"},heads:{fa:["حساب، و هیچ چیز دیگر","یک متد برای هر سطح اولویت","نبودن یعنی null، نه خطا"],en:["Arithmetic, and nothing else","One method per precedence level","Missing is null, not an error"]}},{id:"renderer",group:"templates",title:{en:"From answers to a written report",fa:"از جواب‌ها به گزارش نوشته‌شده"},heads:{fa:["چهار چیز از یک دور","جمله‌ی یک فیلد","جواب پنهان چیزی نمی‌گوید","H و L"],en:["Four things out of one pass","The sentence of a field","Hidden answers say nothing","H and L"]}},{id:"designer",group:"templates",title:{en:"Designing, checking and publishing",fa:"طراحی، بررسی و انتشار"},heads:{fa:["endpointها","یک پیش‌نویس، بعد نسخه‌ی یخ‌زده","validator چه چیزهایی را می‌گیرد","قالب‌های همراه","OHIP چقدر می‌پردازد"],en:["Endpoints","A draft, then a frozen version","What the validator catches","Bundled templates","What OHIP pays"]}},{id:"report-service",group:"reports",title:{en:"Every change through one service",fa:"هر تغییر از یک سرویس"},heads:{fa:["endpointها","یک جا برای قانون‌ها","دو نفر، بدون جواب گم‌شده","جواب‌ها باید با قالب جور باشند","امضا آن را یخ می‌زند","جدول‌ها"],en:["Endpoints","One place for the rules","Two people, no lost answers","Answers must fit the template","Signing freezes it","Tables"]}},{id:"live",group:"reports",title:{en:"Live co-editing (SignalR)",fa:"ویرایش هم‌زمان زنده (SignalR)"},heads:{fa:["تغییرها از REST، خبرها از hub","حضور، در حافظه","صفحه پژواک خودش را نادیده می‌گیرد","تایپ هیچ‌وقت رونویسی نمی‌شود"],en:["Changes over REST, news over the hub","Presence, in memory","The page ignores its own echo","Typing is never overwritten"]}},{id:"patients",group:"reports",title:{en:"Patients",fa:"بیمارها"},heads:{fa:["یک فهرست حداقلی","یک بیمار چه چیزهایی باید داشته باشد","در حالت متصل، اطلاعات ClinicHub برنده است","دو پرونده یکی می‌شوند","جدول"],en:["A minimal register","What a patient must have","Connected, ClinicHub's details win","Two records become one","Table"]}},{id:"accounts",group:"security",title:{en:"Standalone accounts and sign-in",fa:"حساب‌های مستقل و ورود"},heads:{fa:["endpointها","کوکی‌ای که تقریباً هیچ چیز ندارد","در برابر حدس زدن","اولین ورود","جدول"],en:["Endpoints","A cookie that holds almost nothing","Against guessing","The first sign-in","Table"]}},{id:"totp",group:"security",title:{en:"Two-factor sign-in (TOTP)",fa:"ورود دومرحله‌ای (TOTP)"},heads:{fa:["RFC 6238، در ۸۰ خط","یک کد یک بار کار می‌کند","secret رمز شده است","فقط بعد از یک کد درست روشن می‌شود"],en:["RFC 6238, in 80 lines","A code works once","The secret is encrypted","Turned on only after one good code"]}},{id:"permissions",group:"security",title:{en:"Permissions, roles and services",fa:"مجوزها، نقش‌ها و سرویس‌ها"},heads:{fa:["هشت مجوز، و نقش‌هایی ساخته از آن‌ها","یک policy برای هر مجوز","محدود به بعضی سرویس‌ها","endpointها، و آخرین admin","جدول‌ها"],en:["Eight permissions, roles built from them","One policy per permission","Limited to some services","Endpoints, and the last administrator","Tables"]}},{id:"audit",group:"security",title:{en:"The audit log, and CSRF",fa:"audit log، و CSRF"},heads:{fa:["دو رد","باز کردن گزارش، یک بار ثبت می‌شود","خواندنش","CSRF: هدری که مرورگر نمی‌تواند جعل کند","جدول"],en:["Two trails","Opening a report, logged once","Reading it","CSRF: a header a browser cannot forge","Table"]}},{id:"clinichub-signin",group:"clinichub",title:{en:"Signing in through ClinicHub",fa:"ورود از طریق ClinicHub"},heads:{fa:["یک تنظیم روشنش می‌کند","client OpenID Connect","آدمِ ClinicHub، یک کاربر محلی","حرف آخر را ClinicHub می‌زند","یک فایل SQLite برای هر کلینیک"],en:["One setting switches it on","The OpenID Connect client","ClinicHub's person, a local user","ClinicHub has the last word","One SQLite file per clinic"]}},{id:"orders",group:"clinichub",title:{en:"Orders arriving over FHIR",fa:"درخواست‌هایی که با FHIR می‌رسند"},heads:{fa:["endpointها","یک endpoint، سه پیام","معاینه، key یک قالب است","دو بار فرستاده، یک بار ذخیره","شروع معاینه","جدول"],en:["Endpoints","One endpoint, three messages","The exam is a template key","Sent twice, saved once","Starting the exam","Table"]}},{id:"restricted",group:"clinichub",title:{en:"Restricted items: breaking the glass",fa:"موارد محدودشده: شکستن شیشه"},heads:{fa:["برچسب با درخواست می‌آید","بسته، تا کسی بگوید چرا","در فهرست هست، ولی نه این‌که مال کیست","پرسیدن در خود صفحه"],en:["The label comes with the order","Closed until someone says why","Listed, but not who it is for","Asking on the page"]}},{id:"results-out",group:"clinichub",title:{en:"Results back, and the accounting",fa:"جواب‌ها برمی‌گردند، و حسابداری"},heads:{fa:["همراه امضا، در صف","DiagnosticReportی که درخواست را نام می‌برد","رساندن و تلاش دوباره","به حسابداری، بدون اطلاعات سلامت","جدول‌ها"],en:["Queued with the signature","A DiagnosticReport that names the order","Delivery and retries","To the accounting, without health information","Tables"]}},{id:"fe-app",group:"frontend",title:{en:"The pages and the API client",fa:"صفحه‌ها و API client"},heads:{fa:["routeها","قبل از هر صفحه","یک client با type","نشستی که هر جا ممکن است تمام شود","اول تیره، تصمیم‌گرفته قبل از اولین رسم"],en:["Routes","Before any page","One typed client","A session that ends anywhere","Dark first, decided before the first paint"]}},{id:"data-sqlite",group:"data",title:{en:"SQLite, migrations and the demo",fa:"SQLite، migrationها و دمو"},heads:{fa:["چرا SQLite","migrationهای EF Core، موقع بالا آمدن","نام کاربری با هر حروفی","دمو هر روز از نو شروع می‌شود","secretها و کلیدها در container","جدول‌های قالب"],en:["Why SQLite","EF Core migrations, applied at start","User names in any case","The demo starts over every day","Secrets and keys in the container","The template tables"]}}]},{project:"controlpanel",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"backend",title:{en:"Backend: core-api (NestJS)",fa:"بک‌اند: core-api (NestJS)"}},{id:"adapters",title:{en:"Adapters (Express)",fa:"Adapterها (Express)"}},{id:"frontend",title:{en:"Frontend (Angular)",fa:"فرانت‌اند (Angular)"}},{id:"data",title:{en:"Data (SQL Server)",fa:"داده (SQL Server)"}},{id:"deploy",title:{en:"Deploy",fa:"استقرار"}}],pages:[{id:"run",group:"start",title:{en:"Run it on the PC",fa:"اجرا روی PC"},heads:{fa:["با Docker","اول چه چیزی بالا می‌آید","چیزهایی که .env تعیین می‌کند","بدون Docker"],en:["With Docker","What starts first","What .env decides","Without Docker"]}},{id:"tests",group:"start",title:{en:"Tests",fa:"تست‌ها"},heads:{fa:["سه مجموعه تست","چرا تست کردن کد ساده است","تست‌هایی که قاعده‌های امنیتی را ثابت نگه می‌دارند"],en:["Three suites","Why the code is easy to test","Tests that pin the security rules"]}},{id:"bootstrap",group:"backend",title:{en:"Startup: main.ts and AppModule",fa:"راه‌اندازی: main.ts و AppModule"},heads:{fa:["main.ts","AppModule"],en:["main.ts","AppModule"]}},{id:"database",group:"backend",title:{en:"Database access",fa:"دسترسی به دیتابیس"},heads:{fa:["یک connection pool برای کل اپ","SQL ساده، همیشه پارامتری"],en:["One connection pool for the whole app","Plain SQL, always parameterized"]}},{id:"auth-tokens",group:"backend",title:{en:"Auth: login and tokens",fa:"احراز هویت: ورود و توکن‌ها"},heads:{fa:["Endpointها","دو توکن، دو secret","Refresh کاربر را دوباره می‌خواند","هیچ secret پیش‌فرضی نیست"],en:["Endpoints","Two tokens, two secrets","Refresh re-reads the user","No default secrets"]}},{id:"auth-guards",group:"backend",title:{en:"Auth: guards and roles",fa:"احراز هویت: guardها و نقش‌ها"},heads:{fa:["JwtAuthGuard: چه کسی صدا می‌زند","@Roles و RolesGuard: چه کاری اجازه دارند","ترتیب guardها مهم است","401 و 403 دو معنی متفاوت دارند"],en:["JwtAuthGuard: who is calling","@Roles and RolesGuard: what they may do","The order of the guards matters","401 and 403 mean different things"]}},{id:"projects-status",group:"backend",title:{en:"Projects: registry and live status",fa:"پروژه‌ها: فهرست و وضعیت زنده"},heads:{fa:["Endpointها","یک قرارداد برای همه‌ی پروژه‌ها","همه‌ی adapterها با هم، هیچ‌کدام نمی‌تواند بقیه را نگه دارد","رجیستری بدون وضعیت","به‌روزرسانی جزئی"],en:["Endpoints","One contract for every project","All adapters at once, none can block","The registry without the status","Partial update"]}},{id:"projects-allowlist",group:"backend",title:{en:"Projects: the SSRF allowlist",fa:"پروژه‌ها: فهرست مجاز در برابر SSRF"},heads:{fa:["چرا فهرست پروژه‌ها خطرناک است","قاعده‌ها","موقع نوشتن چک می‌شود، و دوباره موقع استفاده"],en:["Why the registry is dangerous","The rules","Checked when written and again when used"]}},{id:"services-api",group:"backend",title:{en:"Services: start, stop, audit",fa:"سرویس‌ها: روشن، خاموش، audit"},heads:{fa:["Endpointها","خود API می‌خواهد نام دوباره تایپ شود","در هر لحظه یک کار، و audit برای هر تلاش","خواندن audit log","اختیاری با تنظیمات"],en:["Endpoints","The API itself wants the name typed back","One action at a time, and every attempt audited","Reading the audit log","Optional by configuration"]}},{id:"services-docker",group:"backend",title:{en:"Services: Docker through a proxy",fa:"سرویس‌ها: Docker از پشت پراکسی"},heads:{fa:["یک interface، نه Docker همه‌جا","هیچ‌وقت خود سوکت Docker","فقط کانتینرهای برچسب‌دار، id فقط از خود Docker","جواب‌های Docker، ترجمه‌شده"],en:["An interface, not Docker everywhere","Never the Docker socket itself","Only labelled containers, ids only from Docker","Docker's answers, translated"]}},{id:"services-logs",group:"backend",title:{en:"Services: reading logs safely",fa:"سرویس‌ها: خواندن امن لاگ‌ها"},heads:{fa:["قالب لاگ Docker","secretها قبل از بیرون رفتن پوشانده می‌شوند"],en:["Docker's log format","Secrets masked before they leave"]}},{id:"assistant-loop",group:"backend",title:{en:"Assistant: the tool loop",fa:"دستیار: حلقه‌ی ابزارها"},heads:{fa:["Endpoint","پرسیدن، صدا زدن ابزار، جواب","System prompt","محدودیت‌ها"],en:["Endpoint","Ask, call tools, answer","The system prompt","Limits"]}},{id:"assistant-tools",group:"backend",title:{en:"Assistant: read-only tools",fa:"دستیار: ابزارهای فقط‌خواندنی"},heads:{fa:["سه ابزار، هیچ‌کدام چیزی نمی‌نویسد","اجرای یک فراخوانی","مسیرهای adapter روی یک فهرست ثابت"],en:["Three tools, nothing that writes","Running a call","Adapter paths on a fixed list"]}},{id:"health-seed",group:"backend",title:{en:"Health check and seed users",fa:"Health check و ساختن کاربرها"},heads:{fa:["Endpoint","فقط زنده بودن","دو حساب"],en:["Endpoint","Liveness only","The two accounts"]}},{id:"wutility-adapter",group:"adapters",title:{en:"wutility-adapter: the proxy pattern",fa:"wutility-adapter: الگوی پراکسی"},heads:{fa:["Endpoint","صدا زدن APIی که از قبل هست","بدون کلید، بالا نمی‌آید","گزینه‌ها با مقدار پیش‌فرض، برای تست‌ها"],en:["Endpoint","Calling an API that already exists","No key, no start","Options with defaults, for the tests"]}},{id:"hisplus-adapter",group:"adapters",title:{en:"hisplus-adapter: reading the database",fa:"hisplus-adapter: خواندن از دیتابیس"},heads:{fa:["Endpoint","وقتی پروژه API ندارد","SUM روی هیچ، NULL است"],en:["Endpoint","When the project has no API","SUM over nothing is NULL"]}},{id:"ledgerdash-adapter",group:"adapters",title:{en:"ledgerdash-adapter: views and insights",fa:"ledgerdash-adapter: viewها و تحلیل‌ها"},heads:{fa:["Endpointها","از طریق viewها، با loginی که جدول‌ها را نمی‌بیند","سه فهرست اضافه برای دستیار"],en:["Endpoints","Through the views, with a login that cannot see the tables","Three extra lists for the assistant"]}},{id:"fe-routes",group:"frontend",title:{en:"Routes, guards and the /api proxy",fa:"مسیرها، guardها و پراکسی /api"},heads:{fa:["مسیرها","Guardها برای کاربرند، نه برای امنیت","یک origin، بدون CORS"],en:["Routes","Guards are for the user, not for security","One origin, no CORS"]}},{id:"fe-auth",group:"frontend",title:{en:"Session: tokens and automatic refresh",fa:"نشست: توکن‌ها و refresh خودکار"},heads:{fa:["Interceptor","یک refresh برای چند درخواست شکست‌خورده","توکن‌ها کجا نگه داشته می‌شوند","logout همیشه session را این‌جا تمام می‌کند"],en:["The interceptor","One refresh for many failed requests","Where the tokens live","Logout always ends the session here"]}},{id:"fe-dashboard",group:"frontend",title:{en:"Page: Dashboard",fa:"صفحه: داشبورد"},heads:{fa:["یک درخواست، دسته‌بندی‌شده","یک کارت"],en:["One request, grouped by category","A card"]}},{id:"fe-login",group:"frontend",title:{en:"Page: Login",fa:"صفحه: ورود"},heads:{fa:["برای هر علت یک پیام خطا","ورود"],en:["An error message for each cause","Signing in"]}},{id:"fe-manage-ports",group:"frontend",title:{en:"Page: Manage ports",fa:"صفحه: Manage ports"},heads:{fa:["فهرست پروژه‌ها، قابل ویرایش","سرور دلیل رد کردن را می‌گوید"],en:["The registry, editable","The server explains the refusal"]}},{id:"fe-services",group:"frontend",title:{en:"Page: Services",fa:"صفحه: Services"},heads:{fa:["زنده، هر ۵ ثانیه","برای خاموش کردن، نام را تایپ کنید","Viewer چه می‌بیند","توضیح خود API"],en:["Live, every 5 seconds","Type the name to stop","What a Viewer sees","The API's own explanation"]}},{id:"fe-assistant",group:"frontend",title:{en:"Component: the assistant panel",fa:"کامپوننت: پنل دستیار"},heads:{fa:["در هر لحظه یک سؤال","متن ساده، با جهت خودش"],en:["One question at a time","Plain text, in its own direction"]}},{id:"data-setup",group:"data",title:{en:"Databases, login and init",fa:"دیتابیس‌ها، login و راه‌اندازی"},heads:{fa:["دو دیتابیس","یک login فقط با چیزی که لازم دارد","Docker چطور اجرایشان می‌کند"],en:["Two databases","A login with only what it needs","How Docker runs them"]}},{id:"data-tables",group:"data",title:{en:"Tables: Users, Projects, AuditLog",fa:"جدول‌ها: Users، Projects، AuditLog"},heads:{fa:["جدول‌ها","قاعده‌ها در دیتابیس، نه فقط در کد","migrationی که دو بار اجرا شدنش ایرادی ندارد","جدول auditی که کسی نمی‌تواند بازنویسی‌اش کند"],en:["The tables","Rules in the database, not only in the code","A migration that can run twice","An audit log nobody can rewrite"]}},{id:"data-seed",group:"data",title:{en:"Seed data and the HIS+ demo",fa:"داده‌ی اولیه و دموی HIS+"},heads:{fa:["فهرست پروژه‌ها: چیزی که نیست اضافه شود، به بقیه دست نخورد","جدول دموی HIS+"],en:["The registry: insert what is missing, touch nothing else","The HIS+ demo table"]}},{id:"deploy-compose",group:"deploy",title:{en:"Docker Compose",fa:"Docker Compose"},heads:{fa:["دو فایل","پراکسی سوکت روی شبکه‌ی خودش","برچسب‌ها تعیین می‌کنند پنل چه چیزی را کنترل کند","هیچ secretی مقدار پیش‌فرض ندارد"],en:["Two files","The socket proxy on its own network","Labels decide what the panel controls","No secret has a default"]}},{id:"deploy-vps",group:"deploy",title:{en:"On the VPS",fa:"روی VPS"},heads:{fa:["یک لایه‌ی روی هم، نه یک کپی","پشت Caddy","فرستادن"],en:["An overlay, not a copy","Behind Caddy","Shipping"]}}]},{project:"edge",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"https",title:{en:"HTTPS and headers",fa:"HTTPS و هدرها"}},{id:"sites",title:{en:"The sites",fa:"سایت‌ها"}},{id:"private",title:{en:"Private sites",fa:"سایت‌های خصوصی"}},{id:"clinic",title:{en:"The clinic platform",fa:"پلتفرم کلینیک"}},{id:"operate",title:{en:"Running it",fa:"نگه‌داری"}}],pages:[{id:"role",group:"start",title:{en:"What Caddy does here",fa:"Caddy این‌جا چه می‌کند"},heads:{fa:["تنها در ورودی سرور","فایل‌هایش","آخر از همه روشن می‌شود، خودش دوباره بالا می‌آید"],en:["The one door to the server","Its files","Started last, restarted on its own"]}},{id:"firewall",group:"start",title:{en:"Only 80 and 443",fa:"فقط 80 و 443"},heads:{fa:["فایروال","هیچ پورت باز دیگری","یک پورت فقط روی loopback"],en:["The firewall","No other published port","One port on loopback only"]}},{id:"certs",group:"https",title:{en:"Automatic HTTPS",fa:"HTTPS خودکار"},heads:{fa:["گواهی بدون هیچ کدی برای گواهی","اول DNS","مقدار جاافتاده compose را متوقف می‌کند"],en:["Certificates with no certificate code","DNS first","Missing values stop compose"]}},{id:"common",group:"https",title:{en:"Common: compression, headers, logs",fa:"common: فشرده‌سازی، هدرها، لاگ"},heads:{fa:["یک snippet که همه‌ی سایت‌ها import می‌کنند","چرا دو بلوک header"],en:["One snippet, imported by every site","Why two header blocks"]}},{id:"certwatch",group:"https",title:{en:"Watching the certificates",fa:"زیر نظر داشتن گواهی‌ها"},heads:{fa:["کمتر از ۱۴ روز یعنی تمدید شکست می‌خورد","یکی از چند چک"],en:["Under 14 days means renewal is failing","One of several checks"]}},{id:"public",group:"sites",title:{en:"The public sites",fa:"سایت‌های عمومی"},heads:{fa:["یک دامنه، یک کانتینر","WebSocket چیز اضافه‌ای نمی‌خواهد","اسم‌های compose، نه پورت‌های روی سرور"],en:["A domain, a container","WebSockets need nothing extra","Compose names, not ports on the server"]}},{id:"lessons",group:"sites",title:{en:"One app, two sites: english and ctx",fa:"یک اپ، دو سایت: english و ctx"},heads:{fa:["مسیرها به کانتینرهای مختلف","همان اپ، خصوصی، با یک فایل"],en:["Paths to different containers","The same app, private, with a file"]}},{id:"basicauth",group:"private",title:{en:"Basic auth for the owner's sites",fa:"basic auth برای سایت‌های مالک"},heads:{fa:["snippet دوم","چرا LabFlow لازمش دارد"],en:["A second snippet","Why LabFlow needs it"]}},{id:"password",group:"private",title:{en:"Changing the password",fa:"عوض کردن رمز"},heads:{fa:["دو بار تایپ، hash به دست Caddy","اجرا روی SSH با ترمینال"],en:["Typed twice, hashed by Caddy","Run over SSH with a terminal"]}},{id:"clinicsites",group:"clinic",title:{en:"The clinic platform's names",fa:"اسم‌های پلتفرم کلینیک"},heads:{fa:["یک رکورد DNS، هفت گواهی","API و صفحه زیر یک آدرس","سایت‌هایی که تقسیم لازم ندارند"],en:["One DNS record, seven certificates","API and page under one address","Sites that need no split"]}},{id:"layers",group:"clinic",title:{en:"Sites added by compose layers",fa:"سایت‌هایی که لایه‌های compose اضافه می‌کنند"},heads:{fa:["Caddyfile یک پوشه را import می‌کند","جایگزین کردن یک سایت با mount روی آن"],en:["The Caddyfile imports a folder","Replacing a site by mounting over it"]}},{id:"aliases",group:"clinic",title:{en:"The same address inside and out",fa:"یک آدرس، از داخل و بیرون"},heads:{fa:["کانتینرها با اسم‌های عمومی به Caddy می‌رسند","TLS در Caddy تمام می‌شود"],en:["Containers reach Caddy under the public names","Caddy terminates TLS"]}},{id:"reload",group:"operate",title:{en:"When the Caddyfile changes",fa:"وقتی Caddyfile عوض می‌شود"},heads:{fa:["فایل pull‌شده‌ای که کانتینر نمی‌بیند","هر بار یک deploy"],en:["A pulled file the container doesn't see","One deploy at a time"]}},{id:"smoke",group:"operate",title:{en:"Smoke tests: 200 or 401",fa:"تست دود: 200 یا 401"},heads:{fa:["هر سایت همان‌طور که باید جواب می‌دهد","چک ناموفق release را با صدای بلند متوقف می‌کند"],en:["Every site answers as it should","A failed check stops the release loudly"]}}]},{project:"financepowerapp",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"origin",title:{en:"From a Power App to an ERP",fa:"از یک Power App تا یک ERP"}},{id:"access",title:{en:"Sign-in and who may send",fa:"ورود و این‌که چه کسی می‌تواند بفرستد"}},{id:"books",title:{en:"The books",fa:"دفاتر"}},{id:"inbox",title:{en:"Documents from the applications",fa:"سندهای اپ‌ها"}},{id:"items",title:{en:"Receivables, payables and HST",fa:"مطالبات، بدهی‌ها و HST"}},{id:"reports",title:{en:"Reports and the web app",fa:"گزارش‌ها و اپ وب"}}],pages:[{id:"run",group:"start",title:{en:"Run it: the database, the API, the web app",fa:"اجرا: دیتابیس، API، اپ وب"},heads:{fa:["اسکریپت‌ها صاحب schema هستند","API و اپ وب"],en:["The scripts own the schema","The API and the web app"]}},{id:"tests",group:"start",title:{en:"Tests on a real SQL Server",fa:"تست روی یک SQL Server واقعی"},heads:{fa:["دیتابیسی ساخته‌شده از همان اسکریپت‌ها","تست‌هایی که مثل دفاتر خوانده می‌شوند","production بدون ClinicHub"],en:["A database built from the same scripts","Tests that read like the books","Production without ClinicHub"]}},{id:"powerapp",group:"origin",title:{en:"The Power App keeps working",fa:"Power App کار می‌کند"},heads:{fa:["schema‌ی آن، دست‌نخورده","trigger آن تصمیم می‌گیرد dbo.Expenses چطور نوشته شود","هزینه‌های تأییدشده به دفتر"],en:["Its schema, untouched","Its trigger decides how dbo.Expenses is written","Approved expenses into the ledger"]}},{id:"signin",group:"access",title:{en:"People sign in through ClinicHub",fa:"افراد از طریق ClinicHub وارد می‌شوند"},heads:{fa:["بدون کاربرهای خودش","هر پنج دقیقه دوباره چک می‌شود"],en:["No users of its own","Re-checked every five minutes"]}},{id:"csrf",group:"access",title:{en:"A cookie, and the X-Finance header",fa:"یک کوکی، و هدر X-Finance"},heads:{fa:["چرا یک هدر","خود کوکی","اپ‌ها لازمش ندارند"],en:["Why a header","The cookie itself","The applications don't need it"]}},{id:"senders",group:"access",title:{en:"Which applications may send documents",fa:"کدام اپ‌ها می‌توانند سند بفرستند"},heads:{fa:["یک token از ClinicHub برای finance","token می‌گوید چه کسی فرستاده"],en:["A ClinicHub token for finance","The token says who sent it"]}},{id:"businesses",group:"books",title:{en:"Businesses and parties",fa:"کسب‌وکارها و طرف‌حساب‌ها"},heads:{fa:["چند دفتر در یک دیتابیس","این سند مال کیست؟","بیمارها یک طرف‌حساب‌اند"],en:["Several sets of books in one database","Whose document is this?","Patients are one party"]}},{id:"accounts",group:"books",title:{en:"Chart of accounts and tax codes",fa:"سرفصل حساب‌ها و کدهای مالیاتی"},heads:{fa:["حساب‌هایی برای یک گروه کلینیک در انتاریو","حسابی که ثبت دارد نوعش را نگه می‌دارد","چهار کد مالیاتی"],en:["Accounts for an Ontario clinic group","An account with postings keeps its type","Four tax codes"]}},{id:"journal",group:"books",title:{en:"The journal: double entry, never edited",fa:"دفتر روزنامه: دوطرفه، هرگز ویرایش‌نشده"},heads:{fa:["هر سند تراز است","اصلاح با یک تصویر آینه‌ای","endpointهای دفتر"],en:["Every entry balances","Corrected by a mirror image","The ledger's endpoints"]}},{id:"periods",group:"books",title:{en:"Months: closing and late postings",fa:"ماه‌ها: بستن و ثبت دیرهنگام"},heads:{fa:["بستن یک ماه","سندی برای یک ماه بسته"],en:["Closing a month","A document for a closed month"]}},{id:"documents",group:"inbox",title:{en:"What the applications send",fa:"اپ‌ها چه می‌فرستند"},heads:{fa:["با کلمه‌های خودشان، هرگز حساب","دو بار فرستاده، یک بار حساب‌شده","قبل از ذخیره‌ی هر چیز چک می‌شود"],en:["In their own words, never accounts","Sent twice, counted once","Checked before anything is stored"]}},{id:"posting",group:"inbox",title:{en:"The posting engine",fa:"موتور ثبت"},heads:{fa:["یک تابع خالص","ثبت دوطرفه برای هر نوع","سه نوع map"],en:["A pure function","Double entry for each kind","Three kinds of maps"]}},{id:"waiting",group:"inbox",title:{en:"Waiting for a mapping, and reversals",fa:"منتظر map، و برگشت‌ها"},heads:{fa:["کلمه‌ی تازه منتظر می‌ماند، رد نمی‌شود","در یک تست","Reversal یک سند قبلی را برمی‌گرداند"],en:["A new word waits, it isn't refused","In a test","A Reversal undoes an earlier document"]}},{id:"openitems",group:"items",title:{en:"Receivables and payables as open items",fa:"مطالبات و بدهی‌ها به‌صورت قلم باز"},heads:{fa:["claim‌ی OHIP تا تسویه نشود باز می‌ماند","یک remittance، سطر به سطر","سن‌بندی"],en:["An OHIP claim stays open until it's settled","A remittance, line by line","Aging"]}},{id:"hst",group:"items",title:{en:"HST and the GST34 return",fa:"HST و اظهارنامه‌ی GST34"},heads:{fa:["مالیات یک سطر","سطرهای اظهارنامه","خوانده از حساب‌ها، نه از سندها"],en:["The tax on a line","The return's lines","Read from the accounts, not from the documents"]}},{id:"statements",group:"reports",title:{en:"Statements and CSV",fa:"صورت‌های مالی و CSV"},heads:{fa:["از دفتر ثبت‌شده","سودی که هنوز بسته نشده","برای spreadsheet حسابدار"],en:["From the posted ledger","Earnings not yet closed","For the accountant's spreadsheet"]}},{id:"analytics",group:"reports",title:{en:"Analytics' read-only login",fa:"login فقط‌خواندنی Analytics"},heads:{fa:["SELECT، و نه همه‌ی ستون‌ها","viewها دورش می‌زدند","هر قلم کی پرداخت شد"],en:["SELECT, and not every column","Views would get around it","When each item was paid"]}},{id:"web",group:"reports",title:{en:"The web app (React)",fa:"اپ وب (React)"},heads:{fa:["پنج صفحه","دفاتر چه کسی","واردشده، و مجاز"],en:["Five pages","Whose books","Signed in, and allowed"]}}]},{project:"integrationhub",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"relay",title:{en:"The relay",fa:"relay"}},{id:"log",title:{en:"The message log",fa:"لاگ پیام‌ها"}},{id:"events",title:{en:"Event feed for Analytics",fa:"فید رویداد برای Analytics"}},{id:"hl7",title:{en:"HL7 v2 over MLLP",fa:"HL7 v2 روی MLLP"}},{id:"admin",title:{en:"Operations and admin API",fa:"عملیات و API مدیریت"}},{id:"web",title:{en:"Admin web (React)",fa:"وب مدیریت (React)"}}],pages:[{id:"overview",group:"start",title:{en:"What IntegrationHub is",fa:"IntegrationHub چیست"},heads:{fa:["موتور ارتباطات پلتفرم","یک relay، نه مالک تازه"],en:["The interface engine of the platform","A relay, not a new owner"]}},{id:"run",group:"start",title:{en:"Run it",fa:"اجرا"},heads:{fa:["دیتابیس، broker، API","routeها پیکربندی‌اند","هر چیز پرخطر به‌طور پیش‌فرض خاموش است"],en:["Database, broker, API","Routes are configuration","Everything risky is off by default"]}},{id:"tests",group:"start",title:{en:"Tests",fa:"تست‌ها"},heads:{fa:["PostgreSQL و RabbitMQ واقعی، upstreamهای WireMock","گشتن دنبال نشانه‌های کارگذاشته","CI"],en:["Real PostgreSQL and RabbitMQ, WireMock upstreams","Looking for planted markers","CI"]}},{id:"relay",group:"relay",title:{en:"One call through the relay",fa:"یک فراخوانی از درون relay"},heads:{fa:["ترتیب بررسی‌ها","token یا کلید","ردشده‌ها هم لاگ می‌شوند"],en:["The order of the checks","Token or key","Refusals are logged too"]}},{id:"tokens",group:"relay",title:{en:"Checking the sender's token",fa:"بررسی token فرستنده"},heads:{fa:["امضا، issuer، انقضا","scope و audience هر route","بررسی‌شده، نه تغییرکرده"],en:["Signature, issuer, expiry","The route's scope and audience","Checked, not changed"]}},{id:"forward",group:"relay",title:{en:"Forwarding and answering",fa:"فرستادن و جواب دادن"},heads:{fa:["چه چیزی فرستاده می‌شود","۵۰۲، ۵۰۴، و هیچ چیز دیگری از خودش","query string لغو","یک HTTP client برای هر route"],en:["What is forwarded","502, 504, and nothing else of its own","The cancel's query string","One HTTP client per route"]}},{id:"message-log",group:"log",title:{en:"One row per call, metadata only",fa:"یک ردیف برای هر فراخوانی، فقط metadata"},heads:{fa:["یک ردیف چه دارد","ردیف، شناسه‌ها و رویدادهایش با هم","metricها در کنار لاگ"],en:["What a row holds","The row, its identifiers and its events together","Metrics beside the log"]}},{id:"search",group:"log",title:{en:"Searching the log",fa:"جستجو در لاگ"},heads:{fa:["بر اساس شناسه","فیلترهای دیگر، صفحه‌بندی و timeline","چه کسی می‌تواند جستجو کند و چه برمی‌گردد"],en:["By identifier","Other filters, paging and the timeline","Who may search, and what comes back"]}},{id:"event-factory",group:"events",title:{en:"Which calls make which events",fa:"کدام فراخوانی کدام رویداد را می‌سازد"},heads:{fa:["رویدادها درباره‌ی جواب‌ها هستند","دو شکل لغو","شناسه‌ها از محتوا"],en:["Events are about answers","Two shapes of cancel","Ids from the content"]}},{id:"pseudonym",group:"events",title:{en:"Pseudonyms and remembered orders",fa:"pseudonymها و درخواست‌های به‌خاطرسپرده"},heads:{fa:["یک HMAC از کلینیک و MRN","جواب‌ها بیمار را با خود ندارند","ادغام، pseudonym را جابه‌جا می‌کند"],en:["An HMAC of clinic and MRN","Results do not carry the patient","Merges move the pseudonym"]}},{id:"outbox",group:"events",title:{en:"The outbox and the publisher",fa:"outbox و منتشرکننده"},heads:{fa:["همراه ردیف لاگ نوشته می‌شود","منتشر کن، تأیید بگیر، علامت بزن","صفی که منتظر Analytics می‌ماند"],en:["Written with the log row","Publish, confirm, mark","A queue that waits for Analytics"]}},{id:"mllp",group:"hl7",title:{en:"MLLP: frames on a socket",fa:"MLLP: قاب‌ها روی socket"},heads:{fa:["VT، پیام، FS CR","یک virtual thread برای هر اتصال","هر تلاش یک ردیف لاگ است"],en:["VT, the message, FS CR","One virtual thread per connection","Every attempt is a log row"]}},{id:"oru",group:"hl7",title:{en:"ORU^R01 to FHIR",fa:"از ORU^R01 تا FHIR"},heads:{fa:["segment به segment","جواب به کدام درخواست است","PID هرگز خوانده نمی‌شود"],en:["Segment by segment","Which order a result answers","PID is never read"]}},{id:"store-forward",group:"hl7",title:{en:"Store and forward, and the ACK",fa:"ذخیره و ارسال، و ACK"},heads:{fa:["AA، AE، AR","کدام جواب‌ها دوباره تلاش می‌شوند","رمزشده تا وقتی منتظر است"],en:["AA, AE, AR","Which answers are retried","Encrypted while it waits"]}},{id:"orders-out",group:"hl7",title:{en:"Orders to an external lab (ORM^O01)",fa:"درخواست به آزمایشگاه بیرونی (ORM^O01)"},heads:{fa:["routeی بدون upstream از نوع HTTP","خواندن ACK","این‌جا بیمار واقعاً بیرون می‌رود"],en:["A route without an HTTP upstream","Reading the ACK","Here the patient does go out"]}},{id:"admin-access",group:"admin",title:{en:"Who may read the log",fa:"چه کسی می‌تواند لاگ را بخواند"},heads:{fa:["filterی که یک authority می‌دهد","دو اجازه، دو املا","دسترسی محلی در توسعه","CORS فقط برای وب مدیریت"],en:["A filter that grants an authority","Two permissions, two spellings","Local access in development","CORS for the admin web only"]}},{id:"health",group:"admin",title:{en:"Route health and alerts",fa:"سلامت routeها و هشدارها"},heads:{fa:["از لاگ خوانده می‌شود، نه با probe","باز کن، ببند، خبر بده"],en:["Read from the log, not probed","Open, resolve, tell"]}},{id:"dead-letters",group:"admin",title:{en:"Dead letters and replay",fa:"نامه‌های مرده و replay"},heads:{fa:["نگه‌داری برای یک بازه‌ی replay","بازگشت به PENDING","یک هشدار تا وقتی رسیدگی شود"],en:["Kept for a replay window","Back to PENDING","An alert until it is dealt with"]}},{id:"web",group:"web",title:{en:"The admin web",fa:"وب مدیریت"},heads:{fa:["ورود در ClinicHub، بعد پرسیدن از hub","صفحه‌ها","replay پشت کلیک دوم","فقط API از proxy می‌گذرد"],en:["Signed in at ClinicHub, then asked the hub","Pages","Replay behind a second click","Only the API is proxied"]}}]},{project:"labflow",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"access",title:{en:"Sign-in and access",fa:"ورود و دسترسی"}},{id:"booking",title:{en:"Online booking",fa:"نوبت آنلاین"}},{id:"lab",title:{en:"Reception and results",fa:"پذیرش و جواب‌ها"}},{id:"clinichub",title:{en:"With ClinicHub: orders, results, money",fa:"با ClinicHub: درخواست‌ها، جواب‌ها، پول"}},{id:"frontend",title:{en:"Frontend (React)",fa:"فرانت‌اند (React)"}},{id:"data",title:{en:"Data (SQL scripts)",fa:"داده (اسکریپت‌های SQL)"}},{id:"warehouse",title:{en:"Warehouse and reporting",fa:"انبار داده و گزارش"}}],pages:[{id:"run",group:"start",title:{en:"Run it on the PC",fa:"اجرا روی PC"},heads:{fa:["اول دیتابیس، از اسکریپت‌های شماره‌دار","API و صفحه","launch profileها برای حالت‌های متصل"],en:["The database first, from numbered scripts","API and page","Launch profiles for the connected modes"]}},{id:"tests",group:"start",title:{en:"Tests",fa:"تست‌ها"},heads:{fa:["تست دیتابیس فقط جایی که دیتابیس هست","بدل ClinicHub","ClinicHub در هر چک تصمیم می‌گیرد"],en:["Database tests only where there is a database","ClinicHub as a stand-in","ClinicHub decides at each check"]}},{id:"sign-in",group:"access",title:{en:"Two ways to sign in, two policies",fa:"دو راه ورود، دو policy"},heads:{fa:["endpointهای Program.cs","ورود دمو که به production نمی‌رسد","مجوزها، در هر دو حالت یکی","اولین چیزی که صفحه می‌پرسد"],en:["Endpoints of Program.cs","A demo sign-in that cannot reach production","Permissions, the same either way","What the page asks first"]}},{id:"clinichub",group:"access",title:{en:"Signing in through ClinicHub",fa:"ورود از طریق ClinicHub"},heads:{fa:["OpenID Connect، code flow با PKCE","نشست هر چند دقیقه دوباره چک می‌شود","کوکی Lax و هدر CSRF"],en:["OpenID Connect, code flow with PKCE","The session re-checked every few minutes","Lax cookie and a CSRF header"]}},{id:"databases",group:"access",title:{en:"One lab database, or one per clinic",fa:"یک دیتابیس آزمایشگاه، یا یکی برای هر کلینیک"},heads:{fa:["یک تنظیم، نه یک نسخه‌ی جدا","درخواست مال کدام کلینیک است","با همان اسکریپت‌ها در اولین ورود ساخته می‌شود"],en:["A setting, not a fork","Which clinic a request is for","Built from the same scripts at first sign-in"]}},{id:"restricted",group:"access",title:{en:"Restricted items: breaking the glass",fa:"موارد محدود: شکستن شیشه"},heads:{fa:["یک برچسب از ClinicHub","باز شدن برای یک نفر، با دلیل، برای یک ساعت","روی صفحه"],en:["A label from ClinicHub","Opened by one person, with a reason, for an hour","On the page"]}},{id:"audit",group:"access",title:{en:"The PHIPA access log",fa:"لاگ دسترسی PHIPA"},heads:{fa:["در همان تراکنش ثبت می‌شود","فقط اضافه کردن، که دیتابیس اجبارش می‌کند","یک ردیف چه می‌گوید","جدول"],en:["Logged in the same transaction","Append-only, enforced by the database","What a row says","The table"]}},{id:"slots",group:"booking",title:{en:"Slots from opening hours",fa:"نوبت‌ها از ساعت کاری"},heads:{fa:["ساعت کاری به وقت تورنتو، نوبت‌ها به UTC","ساعت تابستانی","ورودی‌ها از کجا می‌آیند","جدول‌ها"],en:["Hours in Toronto time, appointments in UTC","Daylight saving time","Where the inputs come from","The tables"]}},{id:"booking",group:"booking",title:{en:"Booking without an account",fa:"نوبت‌گیری بدون حساب کاربری"},heads:{fa:["endpointها (عمومی)","دو نفر، یک جای آخر","کارت سلامت باید با بیمار ثبت‌شده جور باشد","تأیید فقط به آدرس ثبت‌شده"],en:["Endpoints (public)","Two people, one last place","A health card must match the patient on file","Confirmation to the address on file only"]}},{id:"reception",group:"lab",title:{en:"Reception: the requisition",fa:"پذیرش: requisition"},heads:{fa:["endpointها","چیزهایی که requisition نمی‌تواند داشته باشد","پیدا کردن بیمار","تست‌های بدون بیمه فاکتور می‌سازند","کدام لوله‌ها گرفته شوند"],en:["Endpoints","What a requisition may not contain","Finding the patient","Uninsured tests make an invoice","Which tubes to draw"]}},{id:"results",group:"lab",title:{en:"Results: flags, release, corrections",fa:"جواب‌ها: flag، انتشار، اصلاح"},heads:{fa:["endpointها","محدوده‌ی مرجع، کپی‌شده روی جواب","flagها مطابق جدول 0078 در HL7","انتشار یک نسخه‌ی گزارش می‌سازد","جدول‌ها"],en:["Endpoints","The reference range, copied onto the result","Flags as in HL7 table 0078","Release issues a report version","The tables"]}},{id:"orders-in",group:"clinichub",title:{en:"Electronic orders arriving over FHIR",fa:"درخواست‌های الکترونیکی که با FHIR می‌رسند"},heads:{fa:["endpointها","یک endpoint، سه نوع Bundle","LOINC، یا کد خود LabFlow برای پنل‌ها","یک بار قبول می‌شود، حتی اگر دو بار فرستاده شود","جدول‌ها"],en:["Endpoints","One endpoint, three kinds of Bundle","LOINC, or LabFlow's own code for panels","Accepted once, even when sent twice","The tables"]}},{id:"cancel",group:"clinichub",title:{en:"Withdrawing a test",fa:"پس گرفتن یک تست"},heads:{fa:["همان ServiceRequest، این بار revoked","نه بعد از ثبت جواب","همه یا هیچ"],en:["The ServiceRequest again, as revoked","Not once results are entered","All or nothing"]}},{id:"results-out",group:"clinichub",title:{en:"Results back to ClinicHub",fa:"جواب‌ها به ClinicHub برمی‌گردند"},heads:{fa:["در لحظه‌ی انتشار، در همان save، در صف","یک DiagnosticReport برای هر تست درخواست‌شده","رساندن و تلاش دوباره","پول آزمایشگاه هم همین‌طور"],en:["Queued at release, in the same save","One DiagnosticReport per ordered test","Delivery and retries","The lab's money, the same way"]}},{id:"fe-app",group:"frontend",title:{en:"The pages and the API client",fa:"صفحه‌ها و API client"},heads:{fa:["routeها","چه کسی می‌تواند از صفحه استفاده کند، در هر دو حالت","ورود در نوار بالا","هدرها در هر درخواست","کلینیک برای نوبت‌گیری عمومی","یک نوع خطا"],en:["Routes","Who may use a page, in either mode","The sign-in in the top bar","Headers on every call","The clinic for public booking","One error type"]}},{id:"scripts",group:"data",title:{en:"Numbered scripts and their conventions",fa:"اسکریپت‌های شماره‌دار و قراردادهایشان"},heads:{fa:["بالای فایل نوشته شده","یک schema برای هر موضوع","از 050 به بعد: اجرای دوباره امن است","تاریخچه‌ای که SQL Server نگه می‌دارد"],en:["Written down at the top","A schema per concern","From 050 on: safe to run again","History kept by SQL Server"]}},{id:"data-catalog",group:"data",title:{en:"The test catalog",fa:"کاتالوگ تست‌ها"},heads:{fa:["تست‌ها، پنل‌ها و محدوده‌های مرجع","جدول‌ها"],en:["Tests, panels and reference ranges","The tables"]}},{id:"data-people",group:"data",title:{en:"Patients, practitioners, users",fa:"بیماران، پزشکان، کاربران"},heads:{fa:["یک پرونده‌ی زنده برای هر کارت سلامت","رقم کنترلی، در C#","جدول‌ها"],en:["One live record per health card","The check digit, in C#","The tables"]}},{id:"data-lab",group:"data",title:{en:"Requisitions, specimens, billing",fa:"requisitionها، نمونه‌ها، صورت‌حساب"},heads:{fa:["کار آزمایشگاه","پول و اعلان‌ها"],en:["The lab's work","Money and notifications"]}},{id:"etl",group:"warehouse",title:{en:"ETL from the legacy lab system (SSIS)",fa:"ETL از سیستم آزمایشگاه قدیمی (SSIS)"},heads:{fa:["جواب‌های قدیمی به یک star schema","بی‌نام‌سازی قبل از بیرون رفتن","تاریخ‌های شمسی","اجراها و ردشده‌ها"],en:["Legacy results into a star schema","De-identified before it leaves","Jalali dates","Runs and rejects"]}},{id:"dw",group:"warehouse",title:{en:"The warehouse, Analytics and Power BI",fa:"انبار داده، Analytics و Power BI"},heads:{fa:["star schema","فقط جمع‌ها بیرون می‌روند، برای Analytics"],en:["The star schema","Only totals leave, for Analytics"]}}]},{project:"languagelessondesigner",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"lessons",title:{en:"Lessons",fa:"درس‌ها"}},{id:"review",title:{en:"Daily review",fa:"مرور روزانه"}},{id:"sync",title:{en:"Syncing devices",fa:"همگام‌سازی دستگاه‌ها"}},{id:"proverbs",title:{en:"Proverbs",fa:"ضرب‌المثل‌ها"}},{id:"context",title:{en:"Context (private)",fa:"کانتکست (خصوصی)"}}],pages:[{id:"about",group:"start",title:{en:"What it is",fa:"این پروژه چیست"},heads:{fa:["درس انگلیسی، مرور، ضرب‌المثل، کانتکست","بدون دیتابیس","یک build، دو سایت"],en:["English lessons, review, proverbs, context","No database","One build, two sites"]}},{id:"run",group:"start",title:{en:"How to run it",fa:"اجرا کردن"},heads:{fa:["npm run dev","build","سرور sync و watcher"],en:["npm run dev","Building","The sync server and the watcher"]}},{id:"tests",group:"start",title:{en:"Tests",fa:"تست‌ها"},heads:{fa:["node --test","چه چیزی تست می‌شود","چرا همین‌ها"],en:["node --test","What is tested","Why these"]}},{id:"routes",group:"start",title:{en:"The router",fa:"router"},heads:{fa:["hash history و بخش‌های lazy","meta.section","باز شدن روی کانتکست"],en:["Hash history and lazy sections","meta.section","Opening on Context"]}},{id:"unit",group:"lessons",title:{en:"A lesson as JSON",fa:"درس به‌صورت JSON"},heads:{fa:["type مربوط به Unit","بسته‌بندی با import.meta.glob","مشترک با موتور PDF"],en:["The Unit type","Bundled with import.meta.glob","Shared with the PDF engine"]}},{id:"drafts",group:"lessons",title:{en:"Drafts in the browser",fa:"draft در مرورگر"},heads:{fa:["localStorage، با احتیاط","draft برنده است","درس جدید"],en:["localStorage, carefully","The draft wins","A new lesson"]}},{id:"render",group:"lessons",title:{en:"The lesson page",fa:"صفحه‌ی درس"},heads:{fa:["یک component برای هر بخش","یک رنگ برای هر درس","علامت‌های داخل متن و v-html"],en:["One component per section","A colour per lesson","Inline marks and v-html"]}},{id:"edit",group:"lessons",title:{en:"The edit form",fa:"فرم ویرایش"},heads:{fa:["فرمی روی یک کپی","draft کهنه","انتشار، برگشت، دانلود"],en:["A form over a copy","A stale draft","Publish, reset, download"]}},{id:"publish",group:"lessons",title:{en:"Saving a lesson and its PDF",fa:"ذخیره‌ی درس و PDF آن"},heads:{fa:["API ذخیره","فقط صفحه‌ی خودش می‌تواند صدایش بزند","ساختن PDF"],en:["The save API","Only its own page may call it","Making the PDF"]}},{id:"cards",group:"review",title:{en:"Cards from the lessons",fa:"کارت‌ها از درس‌ها"},heads:{fa:["پنج نوع کارت","شناسه از روی متن","کدام کارت‌ها حساب می‌شوند"],en:["Five kinds of card","Ids from the text","Which cards count"]}},{id:"srs",group:"review",title:{en:"Spaced repetition",fa:"spaced repetition"},heads:{fa:["وضعیت هر کارت","نمره دادن: نسخه‌ای از SM-2","برنامه‌ی امروز"],en:["A card's state","Grading: an SM-2 variant","Today's plan"]}},{id:"session",group:"review",title:{en:"A review session",fa:"یک جلسه‌ی مرور"},heads:{fa:["نمره با اولین جواب","کارت چطور می‌پرسد","خواندن با صدا"],en:["Graded by the first answer","How a card asks","Read aloud"]}},{id:"progress",group:"review",title:{en:"Streak, forecast, reminder",fa:"رکورد، پیش‌بینی، یادآوری"},heads:{fa:["رکورد روزهای پشت سر هم","آن‌چه در راه است","یادآوری بدون سرور push"],en:["The streak","What is coming","A reminder without a push server"]}},{id:"syncserver",group:"sync",title:{en:"The sync server",fa:"سرور همگام‌سازی"},heads:{fa:["یک صاحب، یک سند","کلید","محدودیت‌ها و ذخیره‌ی امن"],en:["One owner, one document","The key","Limits and a safe save"]}},{id:"merge",group:"sync",title:{en:"The merge rules",fa:"قانون‌های merge"},heads:{fa:["ترتیب مهم نیست","دستگاه عقب از reset؛ ورودی تمیز","همان قانون‌ها در مرورگر"],en:["Order does not matter","A device behind the reset; clean input","The same rules in the browser"]}},{id:"syncclient",group:"sync",title:{en:"Syncing from the browser",fa:"همگام‌سازی از مرورگر"},heads:{fa:["وصل کردن یک دستگاه","کی همگام می‌شود","ترک کردن اپ"],en:["Connecting a device","When it syncs","Leaving the app"]}},{id:"proverbs",group:"proverbs",title:{en:"Proverbs",fa:"ضرب‌المثل‌ها"},heads:{fa:["bundle‌شده، اما lazy","جست‌وجوی فارسی","فیلترها در URL"],en:["Bundled, but lazily","Searching Persian","Filters in the URL"]}},{id:"context",group:"context",title:{en:"Private data: Context",fa:"داده‌ی خصوصی: کانتکست"},heads:{fa:["هرگز در build","محافظت از خواندن در dev","CtxGate"],en:["Never in a build","Guarding the dev read","CtxGate"]}},{id:"tags",group:"context",title:{en:"Tags and jump links",fa:"برچسب‌ها و لینک پرش"},heads:{fa:["یک برچسب، چند شکل","?at= و jumpTo"],en:["One tag, many forms","?at= and jumpTo"]}}]},{project:"ledgerdashboard",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"security",title:{en:"Security and data safety",fa:"امنیت و سلامت داده"}},{id:"ledger",title:{en:"Applications and the pipeline",fa:"درخواست‌ها و pipeline"}},{id:"ai",title:{en:"With Claude: scoring, building, asking",fa:"با Claude: امتیاز، ساخت، پرسش"}},{id:"truth",title:{en:"The truth bank and its health",fa:"بانک حقیقت و سلامتش"}},{id:"frontend",title:{en:"Frontend (React)",fa:"فرانت‌اند (React)"}},{id:"data",title:{en:"Data: CSV or SQL Server",fa:"داده: CSV یا SQL Server"}}],pages:[{id:"run",group:"start",title:{en:"Run it: on the PC or in Docker",fa:"اجرا: روی PC یا در Docker"},heads:{fa:["یک process، یک پورت","image","روی سرور"],en:["One process, one port","The image","On the server"]}},{id:"tests",group:"start",title:{en:"Tests, CI and releases",fa:"تست‌ها، CI و releaseها"},heads:{fa:["اپ واقعی، یک کپی از داده","یک پوشه‌ی داده‌ی دورریختنی و یک Claude جعلی","CI با یک SQL Server واقعی","یک tag یعنی یک release"],en:["The real app, a copy of the data","A throwaway data folder and a fake Claude","CI with a real SQL Server","A tag is a release"]}},{id:"login",group:"security",title:{en:"Two modes: local, or a password",fa:"دو حالت: محلی، یا با رمز"},heads:{fa:["تنها routeهایی که بدون session باز هستند","تنظیمات قبل از اجرای هر چیز چک می‌شوند","کوکی امضاشده، هیچ چیز در حافظه","در برابر حدس زدن","اسکریپت‌ها: یک bearer token"],en:["The only routes open without a session","Settings checked before anything runs","A signed cookie, nothing in memory","Against guessing","Scripts: a bearer token"]}},{id:"origin",group:"security",title:{en:"No website may call the API",fa:"هیچ سایتی API را صدا نمی‌زند"},heads:{fa:["خواندن هم، نه فقط نوشتن","چه کسی اجازه دارد"],en:["Reads too, not only writes","Who may"]}},{id:"safety",group:"security",title:{en:"Files that can't be damaged",fa:"فایل‌هایی که خراب نمی‌شوند"},heads:{fa:["هر پوشه داخل applications/ resolve می‌شود","نوشتن اتمیک، و Excel","Python و LibreOffice با timeout","خطاها با status درست"],en:["Every folder resolved inside applications/","Atomic writes, and Excel","Python and LibreOffice with timeouts","Errors with the right status"]}},{id:"applications",group:"ledger",title:{en:"Applications, by folder",fa:"درخواست‌ها، با پوشه"},heads:{fa:["endpointها","چه چیزی ویرایش می‌شود","حذف یک پیش‌نویس","فایل‌ها، فقط با اسمی که در فهرست هست"],en:["Endpoints","What may be edited","Deleting a draft","Files, only by their listed name"]}},{id:"pipeline",group:"ledger",title:{en:"The pipeline: append-only stages, follow-ups",fa:"pipeline: مرحله‌های فقط‌افزودنی، پیگیری‌ها"},heads:{fa:["endpointها","آخرین رویداد همان مرحله است","هفت روز سکوت","تاریخ‌ها به وقت محلی","برگرداندن، ولی هیچ‌وقت پیش‌نویس"],en:["Endpoints","The last event is the stage","Seven silent days","Dates in local time","Undo, but never the draft"]}},{id:"contact",group:"ledger",title:{en:"The hiring contact: published or verified only",fa:"مخاطب استخدام: فقط منتشرشده یا تأییدشده"},heads:{fa:["هیچ آدرس حدسی","دو بار رد می‌شود","ایمیل پیگیری"],en:["No guessed addresses","Refused twice","The follow-up email"]}},{id:"boards",group:"ledger",title:{en:"Funnel, rejections, recruiters, evaluation",fa:"قیف، ردشده‌ها، recruiterها، ارزیابی"},heads:{fa:["endpointها","قیف و یک پیش‌بینی","آنچه اجرای شبانه رد کرد","recruiterها با سرعت لینکدین","امتیاز به درد می‌خورد؟"],en:["Endpoints","The funnel and a forecast","What the nightly run turned down","Recruiters at LinkedIn's pace","Is the score any good?"]}},{id:"analyze",group:"ai",title:{en:"Analyze: a cheap first call",fa:"Analyze: یک صدا زدن ارزان اول"},heads:{fa:["دو مرحله، و تو وسطشان","یک tool سخت‌گیر، و باز هم چک","gapهای بسته، این‌جا اجبار می‌شوند","fact bank، cache‌شده"],en:["Two stages, with you in between","A strict tool, then checks anyway","Closed gaps, enforced here","The fact bank, cached"]}},{id:"build",group:"ai",title:{en:"Build: why the AI can't invent claims",fa:"Build: چرا AI نمی‌تواند ادعا بسازد"},heads:{fa:["هر bullet یک fact واقعی را نام می‌برد","نگهبان، قبل از نوشتن هر چیز","باز هم رد: ساخته می‌شود، با هشدار","یک build برای هر پوشه"],en:["Every bullet names a real fact","The guardian, before anything is written","Still rejected: built, with warnings","One build per folder"]}},{id:"assistant",group:"ai",title:{en:"The assistant: ask the ledger",fa:"دستیار: از ledger بپرس"},heads:{fa:["فقط‌خواندنی، از یک snapshot","جواب با یک شکل ثابت","پرسش‌های بعدی بدون حافظه‌ی سرور","پوشه‌ی ساختگی حذف می‌شود"],en:["Read-only, from a snapshot","An answer in a fixed shape","Follow-ups without server memory","A folder it made up is dropped"]}},{id:"costs",group:"ai",title:{en:"What each call cost, and a spending brake",fa:"هزینه‌ی هر صدا زدن، و ترمز خرج"},heads:{fa:["همراه بسته ثبت می‌شود","قیمت یک صدا زدن","فقط کلیک پول خرج می‌کند"],en:["Filed with the package","The price of a call","Only a click spends money"]}},{id:"truth-bank",group:"truth",title:{en:"Editing the truth bank safely",fa:"ویرایش امن بانک حقیقت"},heads:{fa:["endpointها","فقط خطوط همان fact عوض می‌شوند","قبل از نوشتن دوباره خوانده می‌شود","هر ذخیره یک commit است"],en:["Endpoints","Only that fact's lines change","Parsed back before it's written","Every save is a commit"]}},{id:"health",group:"truth",title:{en:"Gaps, résumés and Health",fa:"gapها، رزومه‌ها و Health"},heads:{fa:["endpointها","وضعیت gap در کلمات خودش است","هر چک یک بار اشتباهی واقعی بوده","کهنه، دقیقاً"],en:["Endpoints","A gap's status is in its own words","Every check was a real mistake once","Stale, exactly"]}},{id:"fe-app",group:"frontend",title:{en:"The pages and the API client",fa:"صفحه‌ها و API client"},heads:{fa:["routeها","ورود، فقط وقتی هست","سرو شده به دست خود API"],en:["Routes","The login, only when there is one","Served by the API itself"]}},{id:"stores",group:"data",title:{en:"Two stores, one interface",fa:"دو store، یک interface"},heads:{fa:["فایل‌های CSV یا SQL Server","شکلی که هر دو store برمی‌گردانند","store از نوع CSV","store از نوع SQL"],en:["CSV files or SQL Server","The shape both stores return","The CSV store","The SQL store"]}},{id:"schema",group:"data",title:{en:"The SQL Server schema",fa:"schema در SQL Server"},heads:{fa:["اسکریپت‌های شماره‌دار و idempotent","قانون‌های سرور، دوباره در دیتابیس","از CSV، در یک transaction","جدول‌ها"],en:["Numbered, idempotent scripts","The server's rules, again in the database","From CSV, in one transaction","Tables"]}},{id:"reporting",group:"data",title:{en:"Views for other systems, and Power BI",fa:"viewها برای سیستم‌های دیگر، و Power BI"},heads:{fa:["عددهای داشبورد، در SQL","loginی که فقط viewها را می‌بیند","schema rpt و گزارش Power BI"],en:["The dashboard's numbers, in SQL","A login that sees only the views","The rpt schema and the Power BI report"]}}]},{project:"pharmaflow",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"data",title:{en:"The database and the catalog",fa:"دیتابیس و کاتالوگ"}},{id:"people",title:{en:"Patients and prescribers",fa:"بیماران و تجویزکنندگان"}},{id:"reception",title:{en:"Reception",fa:"پذیرش نسخه"}},{id:"stock",title:{en:"Stock, dispensing and money",fa:"موجودی، تحویل و پول"}},{id:"access",title:{en:"Sign-in and permissions",fa:"ورود و مجوزها"}},{id:"erx",title:{en:"Electronic prescriptions from ClinicHub",fa:"نسخه‌ی الکترونیکی از ClinicHub"}},{id:"web",title:{en:"The web app",fa:"اپ وب"}}],pages:[{id:"overview",group:"start",title:{en:"What PharmaFlow is",fa:"PharmaFlow چیست"},heads:{fa:["یک داروخانه‌ی محلی برای یک گروه کلینیک در Ontario","نسخه‌ی Ontario یک داروخانه‌ی بیمارستانی"],en:["A community pharmacy for an Ontario clinic group","The Ontario version of a hospital pharmacy"]}},{id:"run",group:"start",title:{en:"Run it: the database, the API, the web app",fa:"اجرا: دیتابیس، API، اپ وب"},heads:{fa:["چهار دستور، و اسکریپت‌ها صاحب schema هستند","API بدون یک ورود واقعی بالا نمی‌آید"],en:["Four commands, and the scripts own the schema","The API refuses to start without a real sign-in"]}},{id:"tests",group:"start",title:{en:"Tests: xUnit on a real SQL Server, Vitest for the web",fa:"تست‌ها: xUnit روی یک SQL Server واقعی، Vitest برای وب"},heads:{fa:["یک دیتابیس یک‌بارمصرف از همان اسکریپت‌ها","تابع‌های خالص، سناریوها، و مجوزها"],en:["A throwaway database from the same scripts","Pure functions, stories, and permissions"]}},{id:"schema",group:"data",title:{en:"Six schemas, written in SQL",fa:"شش schema، نوشته‌شده با SQL"},heads:{fa:["یک schema برای هر نوع داده","EF Core map می‌کند، اسکریپت‌ها تصمیم می‌گیرند","خوانده‌شده از خود اسکریپت‌ها"],en:["One schema per kind of data","EF Core maps, the scripts decide","Read from the scripts"]}},{id:"refdefs",group:"data",title:{en:"Base definitions: schedules, SIG codes, ingredients, plans",fa:"تعریف‌های پایه: schedule، کد SIG، ماده‌ی مؤثره، بیمه"},heads:{fa:["چیزی که هر داروخانه‌ی Ontario با آن کار می‌کند","هر تداخل یک بار ذخیره می‌شود","یک خواندن برای همه‌ی فهرست‌ها، مدیرها برای بقیه"],en:["What every Ontario pharmacy works from","An interaction is stored once","One read for every list, administrators for the rest"]}},{id:"drugs",group:"data",title:{en:"The drug catalog: one product per DIN",fa:"کاتالوگ دارو: یک محصول برای هر DIN"},heads:{fa:["یک DIN، یک ماده‌ی مؤثره، یک قدرت و یک شکل","API قبل از دیتابیس بررسی می‌کند","جدول‌ها"],en:["A DIN, an ingredient, a strength and a form","The API checks before the database does","The tables"]}},{id:"patients",group:"people",title:{en:"Patients, allergies and prescribers",fa:"بیماران، آلرژی‌ها و تجویزکنندگان"},heads:{fa:["کارت سلامت Ontario، بررسی‌شده با رقم آخرش","آلرژی یک ماده‌ی مؤثره، یک خانواده، یا حرف خود بیمار را نام می‌برد","تجویزکنندگان بر اساس کالج، و endpointها","جدول‌ها"],en:["An Ontario health card, checked by its last digit","An allergy names an ingredient, a family, or what the patient said","Prescribers by college, and the endpoints","The tables"]}},{id:"audit",group:"people",title:{en:"The access log (PHIPA)",fa:"log‌ی دسترسی (PHIPA)"},heads:{fa:["چه کسی پرونده‌ی کدام بیمار را باز کرد، و چرا","نه فقط آدم‌ها"],en:["Who opened which patient, and why","Not only people"]}},{id:"receive",group:"reception",title:{en:"Receiving a prescription, drug by drug",fa:"پذیرش نسخه، دارو به دارو"},heads:{fa:["یک نسخه و قلم‌هایش","آماده‌ی پیچیدن فقط بعد از بررسی","endpointهای پذیرش","جدول‌ها"],en:["A prescription and its items","Ready to fill only after review","The reception endpoints","The tables"]}},{id:"sig",group:"reception",title:{en:'SIG codes: from "1 TAB PO BID" to a label',fa:'کدهای SIG: از "1 TAB PO BID" تا برچسب'},heads:{fa:["کلمه به کلمه، با کدهای خود داروخانه","تعداد روزهای مصرف، فقط وقتی قابل دانستن است"],en:["Word by word, with the pharmacy's codes","Days' supply, only when it can be known"]}},{id:"checks",group:"reception",title:{en:"The safety checks at reception",fa:"بررسی‌های ایمنی در پذیرش"},heads:{fa:["هفت یافته، برای هر دارو","هشدار می‌دهد؛ داروساز تصمیم می‌گیرد"],en:["Seven findings, checked for every drug","It warns; the pharmacist decides"]}},{id:"purchases",group:"stock",title:{en:"Supplier invoices into lots",fa:"فاکتورهای تأمین‌کننده به lotها"},heads:{fa:["یک فاکتور، lotهایش، و HST‌ی لوازم","یک فاکتور دو بار پذیرفته نمی‌شود","endpointها"],en:["An invoice, its lots, and the HST on supplies","Twice the same invoice is refused","The endpoints"]}},{id:"dispense",group:"stock",title:{en:"Dispensing and refills: first to expire, first out",fa:"تحویل و تکرار: اول آن‌که زودتر منقضی می‌شود"},heads:{fa:["از lotهایی که زودتر منقضی می‌شوند","تکرار، و قیمتی که دیتابیس بررسی می‌کند","جدول‌ها","endpoint"],en:["From the lots that expire first","Refills, and a price the database checks","The tables","The endpoint"]}},{id:"pricing",group:"stock",title:{en:"Pricing: cost, mark-up, fee, and who pays",fa:"قیمت‌گذاری: هزینه، سود، خدمت، و چه کسی می‌پردازد"},heads:{fa:["یک فرمول برای هر بیمه","دو فاکتور که سطر به سطر جورند"],en:["One formula for every plan","Two invoices that add up line by line"]}},{id:"finance",group:"stock",title:{en:"The money to FinancePowerApp",fa:"پول به FinancePowerApp"},heads:{fa:["سندهایی ساخته‌شده از چیزی که رخ داده","یک بار فرستاده، تا پذیرش دوباره امتحان می‌شود"],en:["Documents built from what happened","Sent once, retried until accepted"]}},{id:"permissions",group:"access",title:{en:"Four permissions, and reads versus writes",fa:"چهار مجوز، و خواندن در برابر نوشتن"},heads:{fa:["reception، dispense، stock، admin","خواندن با هر مجوز، نوشتن با مجوز درست"],en:["reception, dispense, stock, admin","Read with any, write with the right one"]}},{id:"signin",group:"access",title:{en:"Sign-in through ClinicHub",fa:"ورود از طریق ClinicHub"},heads:{fa:["OpenID Connect، و بعد یک cookie‌ی مال خود PharmaFlow","هر پنج دقیقه دوباره بررسی می‌شود","هدری که صفحه‌ی مهاجم نمی‌تواند بفرستد"],en:["OpenID Connect, then a cookie of PharmaFlow's own","Checked again every five minutes","A header the attacker's page cannot send"]}},{id:"fhir",group:"erx",title:{en:"Electronic prescriptions: a FHIR Bundle to /fhir",fa:"نسخه‌ی الکترونیکی: یک FHIR Bundle به /fhir"},heads:{fa:["چه کسی می‌تواند بفرستد، و چه چیزی","ارسال دوباره همان نسخه است"],en:["Who may send, and what they may send","A resend is the same prescription"]}},{id:"withdraw",group:"erx",title:{en:"Withdrawals and patient merges from the clinic",fa:"لغو و ادغام بیمار از طرف کلینیک"},heads:{fa:["تا وقتی پیچیده نشده، نه بعد از آن","ادغام در کلینیک دنبال می‌شود، نه کپی"],en:["Until it is filled, and not after","A merge at the clinic is followed, not copied"]}},{id:"restricted",group:"erx",title:{en:"Restricted prescriptions: breaking the glass",fa:"نسخه‌های محدودشده: شکستن شیشه"},heads:{fa:["برچسبی از دستور رضایت بیمار","یک کاربر، یک نسخه، یک ساعت، با دلیل"],en:["A label from the patient's consent directive","One user, one prescription, one hour, with a reason"]}},{id:"web",group:"web",title:{en:"The React app",fa:"اپ React"},heads:{fa:["واردشده، مجاز، بارشده، بعد صفحه‌ها","یک کلاینت typed، و بررسی هنگام تایپ"],en:["Signed in, allowed, loaded, then the pages","One typed client, and checks while typing"]}}]},{project:"programminglessondesigner",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"lessons",title:{en:"How a lesson is made",fa:"یک درس چطور ساخته می‌شود"}},{id:"examples",title:{en:"The tested examples",fa:"مثال‌های تست‌شده"}},{id:"reading",title:{en:"Reading, printing, reviewing",fa:"خواندن، چاپ، مرور"}},{id:"projects",title:{en:"The Projects tab",fa:"تب پروژه‌ها"}},{id:"styling",title:{en:"Colours that stay readable",fa:"رنگ‌هایی که خوانا می‌مانند"}},{id:"deploy",title:{en:"Build and deploy",fa:"build و استقرار"}}],pages:[{id:"run",group:"start",title:{en:"Run it: the commands",fa:"اجرا: دستورها"},heads:{fa:["یک اپ Vue و چند اسکریپت","build برای دو آدرس"],en:["One Vue app, a handful of scripts","Built for two addresses"]}},{id:"shell",group:"start",title:{en:"Three tabs and the router",fa:"سه تب و router"},heads:{fa:["درس‌ها، مرور، پروژه‌ها","hash history"],en:["Lessons, review, projects","Hash history"]}},{id:"shape",group:"lessons",title:{en:"The shape of a lesson",fa:"شکل یک درس"},heads:{fa:["یک فایل JSON، همیشه به یک ترتیب","یک مفهوم، چند زبان"],en:["One JSON file, always in the same order","One concept, several languages"]}},{id:"samples",group:"lessons",title:{en:"Code samples: tested, real, port",fa:"نمونه‌کدها: تست‌شده، واقعی، ترجمه"},heads:{fa:["نمونه از کجا آمده","region، نه شماره‌ی خط"],en:["Where a sample comes from","Regions, not line numbers"]}},{id:"checks",group:"lessons",title:{en:"The lesson check",fa:"چک درس‌ها"},heads:{fa:["همه‌ی زبان‌ها، همه‌ی regionها","ارجاع به پروژه‌های واقعی"],en:["Every language, every region","References into the real projects"]}},{id:"backend",group:"examples",title:{en:"Four backends, one API",fa:"چهار بک‌اند، یک API"},heads:{fa:["یک سرویس، چهار بار نوشته‌شده","تست‌شده در زبان خودشان","یک job برای هر زبان"],en:["The same service, written four times","Tested in their own language","One job per language"]}},{id:"frontend",group:"examples",title:{en:"Frontend: Angular, React, Vue, Blazor",fa:"فرانت‌اند: Angular، React، Vue، Blazor"},heads:{fa:["یک wrapper برای fetch زیر سه فریم‌ورک","guard به شکل داده"],en:["One fetch wrapper under three frameworks","A guard as data"]}},{id:"docker",group:"examples",title:{en:"Docker: the four services together",fa:"Docker: چهار سرویس با هم"},heads:{fa:["بدون secret پیش‌فرض","اثبات‌شده در CI"],en:["No default secrets","Proved in CI"]}},{id:"ops",group:"examples",title:{en:"Ops scripts in three languages",fa:"اسکریپت‌های عملیات در سه زبان"},heads:{fa:["یک Ubuntu مثل VPS","یک چک برای همه‌ی زبان‌ها"],en:["An Ubuntu like the VPS","One check for every language"]}},{id:"page",group:"reading",title:{en:"The lesson page",fa:"صفحه‌ی درس"},heads:{fa:["یک کامپوننت برای صفحه و برای کاغذ","تب‌هایی که می‌گویند کد از کجاست"],en:["One component for the screen and for paper","Tabs that say where the code is from"]}},{id:"booklets",group:"reading",title:{en:"Booklets and PDFs",fa:"جزوه‌ها و PDFها"},heads:{fa:["جزوه یک صفحه است","چاپ‌شده در CI","PDFها کجا هستند"],en:["A booklet is a page","Printed by CI","Where the PDFs are"]}},{id:"review",group:"reading",title:{en:"Review cards",fa:"کارت‌های مرور"},heads:{fa:["کارت‌هایی که از درس‌ها ساخته می‌شوند","جعبه‌های لایتنر","نگه‌داشته در همین مرورگر"],en:["Cards made from the lessons","Leitner boxes","Kept in this browser"]}},{id:"offline",group:"reading",title:{en:"Installable and offline",fa:"نصب‌شدنی و آفلاین"},heads:{fa:["اول شبکه، بعد آخرین کپی","یک cache، و جانشینی سریع"],en:["Network first, then the last copy","One cache, and a quick takeover"]}},{id:"map",group:"projects",title:{en:"The system map, read from compose",fa:"نقشه‌ی سیستم، خوانده از compose"},heads:{fa:["خوانده از فایل‌هایی که پورتفولیو را اجرا می‌کنند","چه کسی با چه کسی حرف می‌زند","کهنه بودن یعنی خطا"],en:["Read from the files that run the portfolio","Who talks to whom","Out of date is a failure"]}},{id:"topics",group:"projects",title:{en:"Topics and code snapshots",fa:"تاپیک‌ها و snapshotهای کد"},heads:{fa:["یک پروژه به شکل تاپیک‌ها","پیدا شده با متن، بعد snapshot"],en:["A project as topics","Found by text, then snapshotted"]}},{id:"scanners",group:"projects",title:{en:"Tables read from the code",fa:"جدول‌هایی که از کد خوانده می‌شوند"},heads:{fa:["endpointها، جدول‌ها، routeها","routeهای خود همین سایت"],en:["Endpoints, tables, routes","This site's own routes"]}},{id:"bilingual",group:"projects",title:{en:"Two languages, kept in step",fa:"دو زبان، هم‌گام"},heads:{fa:["کامپایلر رشته‌ی جاافتاده را رد می‌کند","همان بخش‌ها در هر دو","کد و پررنگ، و نه چیز دیگر"],en:["The compiler refuses a missing string","The same sections in both","Code and bold, nothing else"]}},{id:"docs",group:"projects",title:{en:"The docs shell and the map drawing",fa:"قاب مستندات و رسم نقشه"},heads:{fa:["صفحه‌ها به ترتیبی که بازدیدکننده می‌بیند","نوار کناری‌ای که جمع می‌شود","چیدمان بدون کتابخانه"],en:["Pages in the order a visitor meets them","A sidebar that folds","A layout without a library"]}},{id:"contrast",group:"styling",title:{en:"A build that refuses unreadable colours",fa:"buildی که رنگ ناخوانا را رد می‌کند"},heads:{fa:["هر رنگ یک اسم دارد","contrast موقع build چک می‌شود"],en:["Every colour has a name","Contrast checked at build time"]}},{id:"ci",group:"deploy",title:{en:"Verify, then deploy",fa:"اول تأیید، بعد استقرار"},heads:{fa:["اگر تستی شکست بخورد چیزی منتشر نمی‌شود","منتشر در gh-pages"],en:["Nothing is published if a test fails","Published to gh-pages"]}},{id:"vps",group:"deploy",title:{en:"On the VPS: code.arashkeshtgar.ca",fa:"روی VPS: ‏code.arashkeshtgar.ca"},heads:{fa:["build شده به دست کنترل پنل","چرا nginx ساده کافی است"],en:["Built by Control Panel","Why plain nginx is enough"]}}]},{project:"rebiomed",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"security",title:{en:"Accounts, admins and files",fa:"حساب‌ها، adminها و فایل‌ها"}},{id:"sellers",title:{en:"Sellers and verification",fa:"فروشنده‌ها و احراز"}},{id:"listings",title:{en:"Medical listings",fa:"آگهی‌های تجهیزات پزشکی"}},{id:"money",title:{en:"Checkout, escrow and payouts",fa:"پرداخت، امانت و تسویه"}},{id:"trust",title:{en:"Offers and inspections",fa:"پیشنهاد قیمت و بازرسی"}},{id:"frontend",title:{en:"Frontend (React)",fa:"فرانت‌اند (React)"}},{id:"data",title:{en:"Data (MongoDB)",fa:"داده (MongoDB)"}}],pages:[{id:"run",group:"start",title:{en:"Run it: locally, in Docker, on the server",fa:"اجرا: محلی، در Docker، روی سرور"},heads:{fa:["دو process در حالت توسعه","پیش‌فرض‌های امن، و دمو قبل از Stripe","یک سرویس در production","روی سرور"],en:["Two processes in development","Safe defaults, and a demo before Stripe","One service in production","On the server"]}},{id:"tests",group:"start",title:{en:"Tests and CI",fa:"تست‌ها و CI"},heads:{fa:["MongoDB واقعی، Stripe جعلی","stubهایی که می‌شمارند و عمداً شکست می‌خورند","CI"],en:["A real MongoDB, a fake Stripe","Stubs that count and fail on purpose","CI"]}},{id:"auth",group:"security",title:{en:"Sign-in with JWT",fa:"ورود با JWT"},heads:{fa:["یک token برای هفت روز","middleware ورود"],en:["A token for seven days","The auth middleware"]}},{id:"admin",group:"security",title:{en:"Admins: checked in the database",fa:"adminها: چک در دیتابیس"},heads:{fa:["اعتماد نکردن به ادعای token","router مربوط به admin چه می‌کند","هیچ API نمی‌تواند admin بسازد"],en:["Not trusting the token's claim","What the admin router does","No API can make an admin"]}},{id:"files",group:"security",title:{en:"Private documents",fa:"مدارک خصوصی"},heads:{fa:["بیرون از پوشه‌ی عمومی","شناسایی با بایت‌ها","چه کسی می‌تواند دانلود کند"],en:["Outside the public folder","Identified by their bytes","Who may download"]}},{id:"organizations",group:"sellers",title:{en:"Organizations",fa:"سازمان‌ها"},heads:{fa:["فروش از طرف یک کلینیک","صاحب چه چیزی را می‌تواند عوض کند","مشخصات تازه، بررسی تازه"],en:["Selling on behalf of a clinic","What the owner may change","New details, new review"]}},{id:"verification",group:"sellers",title:{en:"Verification by an admin",fa:"احراز توسط admin"},heads:{fa:["درخواست بررسی","یک جا که وضعیت عوض می‌شود"],en:["Asking for review","One place where the status changes"]}},{id:"listings",group:"listings",title:{en:"Listing equipment",fa:"ثبت آگهی تجهیزات"},heads:{fa:["یک آگهی پزشکی چه چیزی دارد","چه کسی چه کلاسی را می‌تواند ثبت کند","تاریخچه‌ی سرویس"],en:["What a medical listing carries","Who may list which class","The service history"]}},{id:"browse",group:"listings",title:{en:"Browsing and filters",fa:"مرور و فیلترها"},heads:{fa:["فیلترها با فهرست‌ها چک می‌شوند","آگهی معلق ناپدید است"],en:["Filters checked against the lists","Suspended listings are gone"]}},{id:"checkout",group:"money",title:{en:"Checkout: priced on the server",fa:"checkout: قیمت‌گذاری روی سرور"},heads:{fa:["client می‌گوید چه چیزی، نه چقدر","یک بخش برای هر فروشنده","یک سفارش pending و PaymentIntent آن"],en:["The client says what, never how much","One part per seller","A pending order and its PaymentIntent"]}},{id:"paid",group:"money",title:{en:"When is an order paid?",fa:"سفارش کی پرداخت‌شده است؟"},heads:{fa:["دو راه ورود، یک نتیجه","فقط یکی‌شان به موجودی دست می‌زند","تمام شدن موجودی وسط پرداخت","webhook"],en:["Two ways in, one result","Only one of them touches stock","Sold out while paying","The webhook"]}},{id:"escrow",group:"money",title:{en:"Escrow: held until delivery",fa:"امانت: نگه‌داری تا تحویل"},heads:{fa:["بخش هر فروشنده زندگی خودش را دارد","هر قدم یک update شرطی است","انتقال"],en:["Each seller's part has its own life","Every step is one conditional update","The transfer"]}},{id:"disputes",group:"money",title:{en:"Cancellations and disputes",fa:"لغو و اختلاف"},heads:{fa:["فروشنده نمی‌تواند ارسال کند","خریدار مشکلی گزارش می‌کند","admin تصمیم می‌گیرد"],en:["The seller can't ship","The buyer reports a problem","The admin decides"]}},{id:"connect",group:"money",title:{en:"Seller payouts with Stripe Connect",fa:"تسویه با فروشنده‌ها با Stripe Connect"},heads:{fa:["onboarding خود Stripe","کی می‌شود به فروشنده پول داد","تسویه‌هایی که منتظر ماندند"],en:["Stripe's own onboarding","When a seller can be paid","Payouts that waited"]}},{id:"offers",group:"trust",title:{en:"Offers and counter-offers",fa:"پیشنهاد و پیشنهاد متقابل"},heads:{fa:["قانون‌های یک چانه‌زنی","یک پیشنهاد باز، حتی در race","انقضا بدون job پس‌زمینه","یک بار مصرف، موقع پرداخت"],en:["The rules of a negotiation","One open offer, even in a race","Expired without a background job","Used once, at payment"]}},{id:"inspections",group:"trust",title:{en:"Independent inspections",fa:"بازرسی مستقل"},heads:{fa:["چه کسی می‌تواند بازرسی کند","یک گزارش ساختاریافته","نتیجه باید با بررسی‌ها بخواند","تاریخ‌ها در کانادا","منتشر می‌شود، نتیجه هر چه باشد"],en:["Who may inspect","A structured report","The outcome has to match the checks","Dates in Canada","Published whatever the result"]}},{id:"pages",group:"frontend",title:{en:"Pages, Redux and the token",fa:"صفحه‌ها، Redux و token"},heads:{fa:["صفحه‌ها","token بعد از reload","صفحه‌های admin فقط یک راحتی‌اند"],en:["The pages","The token after a reload","The admin pages are only a convenience"]}},{id:"cart",group:"frontend",title:{en:"Cart, checkout and animation",fa:"سبد، checkout و انیمیشن"},heads:{fa:["سبدی که از reload جان سالم به در می‌برد","پرداخت","framer-motion"],en:["A cart that survives a reload","Paying","framer-motion"]}},{id:"sellers-data",group:"data",title:{en:"Collections: sellers and listings",fa:"collectionها: فروشنده‌ها و آگهی‌ها"},heads:{fa:["سند، نه ردیف","ارجاع‌ها، و آنچه یکتاست","یک کپی برای مرور"],en:["Documents, not rows","References, and what is unique","A copy for browsing"]}},{id:"orders-data",group:"data",title:{en:"Collections: orders, offers, inspections",fa:"collectionها: سفارش، پیشنهاد، بازرسی"},heads:{fa:["ماشین حالت داخل سند","openKey"],en:["State machines in documents","openKey"]}}]},{project:"shared",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"logins",title:{en:"Databases and logins",fa:"دیتابیس‌ها و loginها"}},{id:"connect",title:{en:"How apps connect",fa:"اتصال اپ‌ها"}},{id:"backup",title:{en:"Backups",fa:"backup"}},{id:"restore",title:{en:"Restore",fa:"restore"}}],pages:[{id:"role",group:"start",title:{en:"One SQL Server for the portfolio",fa:"یک SQL Server برای کل پورتفولیو"},heads:{fa:["یک کانتینر، چند دیتابیس","چه چیزی در آن است","سالم، نه فقط روشن"],en:["One container, many databases","What it holds","Healthy, not just started"]}},{id:"vps",group:"start",title:{en:"On the VPS",fa:"روی VPS"},heads:{fa:["بدون پورت منتشرشده","Express، با سقف حافظه","پوشه‌ی backup، و x86-64"],en:["No published port","Express, with a memory cap","The backup folder, and x86-64"]}},{id:"init",group:"logins",title:{en:"Creating the databases",fa:"ساختن دیتابیس‌ها"},heads:{fa:["یک سرویس یک‌باره","همه‌ی اسکریپت‌ها، به ترتیب","اجرای دوباره بی‌خطر است"],en:["A one-shot service","Every script, in order","Safe to run again"]}},{id:"logins",group:"logins",title:{en:"Least-privilege logins",fa:"loginهای با کمترین دسترسی"},heads:{fa:["controlpanel_svc","DENY از role قوی‌تر است","رمزهای ساخته‌شده"],en:["controlpanel_svc","DENY beats a role","Generated passwords"]}},{id:"applogins",group:"logins",title:{en:"Logins of the other apps",fa:"loginهای اپ‌های دیگر"},heads:{fa:["labflow_svc","audit فقط افزودنی","پلتفرم کلینیک"],en:["labflow_svc","Append-only audit","The clinic platform"]}},{id:"migrate",group:"logins",title:{en:"Schemas on every release",fa:"schema در هر انتشار"},heads:{fa:["اسکریپت‌های idempotent","اسکریپت میزبان، اجرا در داخل","اسکریپت‌های شماره‌دار، هر کدام یک بار"],en:["Idempotent scripts","A host script, run inside","Numbered scripts, once each"]}},{id:"connect",group:"connect",title:{en:"How apps connect",fa:"اپ‌ها چطور وصل می‌شوند"},heads:{fa:["سرویس‌های Node: چهار متغیر",".NET: یک connection string","connection string به‌صورت فایل"],en:["Node services: four variables",".NET: one connection string","Connection strings as files"]}},{id:"pcvps",group:"connect",title:{en:"PC and VPS differ",fa:"تفاوت PC و VPS"},heads:{fa:["روی PC: SQL Server میزبان","روی VPS: کانتینر","یک توصیف برای هر سرویس"],en:["On the PC: the host's SQL Server","On the VPS: the container","One description per service"]}},{id:"nightly",group:"backup",title:{en:"The nightly backup",fa:"backup شبانه"},heads:{fa:["هر شب ساعت 03:30","یک دیتابیس در هر بار","شکست دیده می‌شود"],en:["Every night at 03:30","One database at a time","Failures are visible"]}},{id:"offsite",group:"backup",title:{en:"Off the server",fa:"بیرون از سرور"},heads:{fa:["زنده ماندن بعد از سرور","رمزنگاری، حذف تکرار، کم کردن","هنوز تنظیم نشده"],en:["Surviving the server","Encrypted, deduplicated, thinned","Not configured yet"]}},{id:"restore",group:"restore",title:{en:"Restoring a database",fa:"restore یک دیتابیس"},heads:{fa:["اسم فایل = اسم دیتابیس","جابه‌جا کردن فایل‌ها","userهای یتیم"],en:["File name = database name","Moving the files","Orphaned users"]}},{id:"restoretest",group:"restore",title:{en:"Proving the backups restore",fa:"اثبات این‌که backupها restore می‌شوند"},heads:{fa:["ماهی یک بار","هر دیتابیس، با اسم دیگر","کدام قدم شکست خورد"],en:["Once a month","Every database, under another name","Which step failed"]}},{id:"export",group:"restore",title:{en:"Moving databases from the PC",fa:"انتقال دیتابیس از PC"},heads:{fa:["export، scp، restore","از طریق Public Documents","قبل و بعد"],en:["export, scp, restore","Through Public Documents","Before and after"]}}]},{project:"wutility",groups:[{id:"start",title:{en:"Getting started",fa:"شروع"}},{id:"desktop",title:{en:"The original desktop app",fa:"اپ دسکتاپ اصلی"}},{id:"sync",title:{en:"Schema compare and sync",fa:"مقایسه و همگام‌سازی schema"}},{id:"security",title:{en:"Keys, demo mode and the vault",fa:"کلیدها، حالت دمو و vault"}},{id:"forms",title:{en:"The configuration forms",fa:"فرم‌های تنظیمات"}},{id:"web",title:{en:"Angular and Azure",fa:"Angular و Azure"}}],pages:[{id:"overview",group:"start",title:{en:"What wUtility is",fa:"wUtility چیست"},heads:{fa:["یک ابزار همگام‌سازی schema از استقرار بیمارستان‌ها","wUtility Web: همان کار، از نو نوشته‌شده"],en:["A schema sync tool from hospital deployments","wUtility Web: the same job, rewritten"]}},{id:"run",group:"start",title:{en:"Run it: an API key, the API, the Angular app",fa:"اجرا: یک API key، API، اپ Angular"},heads:{fa:["بدون کلید، بدون شروع","کلید سمت سرور می‌ماند"],en:["No key, no start","The key stays on the server side"]}},{id:"tests",group:"start",title:{en:"How it is tested",fa:"چطور تست می‌شود"},heads:{fa:["روی دیتابیس واقعی، نه mock","یک smoke test بعد از هر استقرار"],en:["Against real databases, not mocks","A smoke test after every deployment"]}},{id:"wpf",group:"desktop",title:{en:"The desktop compare form",fa:"فرم مقایسه‌ی دسکتاپ"},heads:{fa:["همه چیز از metadata","بلافاصله اعمال‌شده"],en:["Everything from metadata","Applied straight away"]}},{id:"legacy-connections",group:"desktop",title:{en:"Connections per module, and the empty service",fa:"اتصال برای هر ماژول، و سرویس خالی"},heads:{fa:["13 ماژول، یک کلید در کد","wService: یک جای خالی"],en:["13 modules, a key in the source","wService: a placeholder"]}},{id:"reader",group:"sync",title:{en:"Reading a schema",fa:"خواندن یک schema"},heads:{fa:["یک query، بعد GroupBy","یک mapper و یک عبارت نوع"],en:["One query, then GroupBy","A mapper and a type expression"]}},{id:"differ",group:"sync",title:{en:"Comparing: source is the truth",fa:"مقایسه: مبدأ حقیقت است"},heads:{fa:["یک جهت، چهار نوع تفاوت","فاصله‌ی نمایشی"],en:["One direction, four kinds of difference","The demo drift"]}},{id:"generator",group:"sync",title:{en:"Generating a script to review",fa:"تولید اسکریپتی برای بررسی"},heads:{fa:["یک اسکریپت، نه یک تغییر بی‌صدا","گشاد کردن، و سپردن سفت کردن به یک آدم"],en:["A script, not a silent change","Widening, and leaving the tightening to a person"]}},{id:"executor",group:"sync",title:{en:"Running the script, batch by batch",fa:"اجرای اسکریپت، دسته به دسته"},heads:{fa:["در اولین شکست بایست، و بگو کجا","دو مسیر: مقایسه، اجرا"],en:["Stop at the first failure, say where","Two routes: compare, execute"]}},{id:"apikey",group:"security",title:{en:"The API key middleware",fa:"middleware‌ی API key"},heads:{fa:["هر مسیر /api، مقایسه‌شده در زمان ثابت","چه چیزی بیرون می‌ماند"],en:["Every /api route, compared in constant time","What stays outside"]}},{id:"demo",group:"security",title:{en:"Demo mode: a public site without an open SQL runner",fa:"حالت دمو: یک سایت عمومی بدون اجراکننده‌ی SQL‌ی باز"},heads:{fa:["قدرت را بگیر، به‌جای اعتماد به مرورگر","بازنشانی، تا بازدیدکننده‌ی بعدی دوباره امتحان کند"],en:["Take the powers away instead of trusting the browser","Reset, so the next visitor can try again"]}},{id:"vault",group:"security",title:{en:"The connection vault",fa:"vault‌ی اتصال"},heads:{fa:["AES-256-GCM، با کلید بیرون از کد","متن رمزنشده هرگز از سرویس بیرون نمی‌رود"],en:["AES-256-GCM, with the key outside the code","The plaintext never leaves the service"]}},{id:"doctors",group:"forms",title:{en:"Doctors and their price groups",fa:"پزشکان و گروه‌های قیمتشان"},heads:{fa:["همان query، با پارامتر","صفحه، و جدول‌ها"],en:["The same query, parameterised","The page, and the tables"]}},{id:"dbconfig",group:"forms",title:{en:"The registry of site databases",fa:"فهرست دیتابیس‌های سایت‌ها"},heads:{fa:["کدام دیتابیس کدام ماژول است، و کجا","13 اسم ماژول، نگه‌داشته"],en:["Which database is which module, where","The 13 module names, kept"]}},{id:"frontend",group:"web",title:{en:"The Angular app",fa:"اپ Angular"},heads:{fa:["کامپوننت‌های standalone، یک پوسته‌ی فارسی راست‌به‌چپ","مقایسه، خواندن، اعمال، مقایسه‌ی دوباره"],en:["Standalone components, a Persian right-to-left shell","Compare, read, apply, compare again"]}},{id:"azure",group:"web",title:{en:"The public demo on Azure",fa:"دموی عمومی روی Azure"},heads:{fa:["یک App Service، چهار دیتابیس رایگان","هیچ رمز SQLی در هیچ جا"],en:["One App Service, four free databases","No SQL password anywhere"]}}]}],Ca=["ControlPanel/docker-compose.yml","ControlPanel/compose.apps.yml","ControlPanel/deploy/vps/compose.vps.yml","ControlPanel/deploy/vps/Caddyfile","ControlPanel/deploy/vps/.env.vps.example"],Ea=[{id:"analytics",name:"Analytics",repo:"Analytics",inCompose:!0,onVps:!1,services:["analytics-api","analytics-consumer","analytics-scheduler","analytics-web"],domains:[]},{id:"clinichub",name:"ClinicHub",repo:"ClinicHub",inCompose:!1,onVps:!1,services:[],domains:[]},{id:"clinicreport",name:"ClinicReport",repo:"ClinicReport",inCompose:!0,onVps:!0,services:["clinicreport"],domains:["report.arashkeshtgar.ca"]},{id:"controlpanel",name:"Control Panel",repo:"ControlPanel",inCompose:!0,onVps:!0,services:["core-api","db-init","frontend","hisplus-adapter","ledgerdash-adapter","seed-users","socket-proxy","wutility-adapter"],domains:["panel.arashkeshtgar.ca"]},{id:"edge",name:"Caddy",repo:"ControlPanel",inCompose:!0,onVps:!0,services:["caddy"],domains:[]},{id:"financepowerapp",name:"FinancePowerApp",repo:"FinancePowerApp",inCompose:!1,onVps:!1,services:[],domains:[]},{id:"integrationhub",name:"IntegrationHub",repo:"IntegrationHub",inCompose:!0,onVps:!1,services:["integrationhub","integrationhub-db","integrationhub-mq","integrationhub-web"],domains:[]},{id:"labflow",name:"LabFlow",repo:"LabFlow",inCompose:!0,onVps:!0,services:["labflow-api","labflow-web"],domains:[]},{id:"languagelessondesigner",name:"English lessons",repo:"LanguageLessonDesigner",inCompose:!0,onVps:!0,services:["lessons-sync","lessons-web"],domains:["ctx.arashkeshtgar.ca","english.arashkeshtgar.ca"]},{id:"ledgerdashboard",name:"LedgerDashboard",repo:"LedgerDashboard",inCompose:!0,onVps:!0,services:["ledgerdashboard"],domains:["ledger.arashkeshtgar.ca"]},{id:"pharmaflow",name:"PharmaFlow",repo:"PharmaFlow",inCompose:!1,onVps:!1,services:[],domains:[]},{id:"programminglessondesigner",name:"Programming lessons",repo:"ProgrammingLessonDesigner",inCompose:!0,onVps:!0,services:["programming-web"],domains:["code.arashkeshtgar.ca"]},{id:"rebiomed",name:"ReBiomed",repo:"Rebiomed",inCompose:!0,onVps:!0,services:["rebiomed-api","rebiomed-mongo","rebiomed-seed","rebiomed-web"],domains:["rebiomed.arashkeshtgar.ca"]},{id:"shared",name:"SQL Server",repo:"ControlPanel",inCompose:!0,onVps:!0,services:["sqlserver"],domains:[]},{id:"wutility",name:"wUtility Web",repo:"wUtility",inCompose:!1,onVps:!1,services:[],domains:[]}],Oa=[{from:"analytics",to:"clinichub",via:["analytics-api","analytics-consumer","analytics-scheduler"]},{from:"controlpanel",to:"ledgerdashboard",via:["ledgerdash-adapter → LedgerDashboard database"]},{from:"controlpanel",to:"shared",via:["core-api → sqlserver","db-init → sqlserver","hisplus-adapter → sqlserver","ledgerdash-adapter → sqlserver","seed-users → sqlserver"]},{from:"controlpanel",to:"wutility",via:["wutility-adapter"]},{from:"edge",to:"clinicreport",via:["caddy → clinicreport"]},{from:"edge",to:"controlpanel",via:["caddy → frontend"]},{from:"edge",to:"labflow",via:["caddy → labflow-web"]},{from:"edge",to:"languagelessondesigner",via:["caddy → lessons-sync","caddy → lessons-web"]},{from:"edge",to:"ledgerdashboard",via:["caddy → ledgerdashboard"]},{from:"edge",to:"programminglessondesigner",via:["caddy → programming-web"]},{from:"edge",to:"rebiomed",via:["caddy → rebiomed-web"]},{from:"integrationhub",to:"clinichub",via:["integrationhub"]},{from:"integrationhub",to:"clinicreport",via:["integrationhub"]},{from:"integrationhub",to:"financepowerapp",via:["integrationhub"]},{from:"integrationhub",to:"labflow",via:["integrationhub"]},{from:"integrationhub",to:"pharmaflow",via:["integrationhub"]},{from:"labflow",to:"shared",via:["labflow-api → sqlserver"]},{from:"ledgerdashboard",to:"shared",via:["ledgerdashboard → sqlserver"]}],Ra=[{id:"analytics-api",project:"analytics",kind:"service",vps:!1,profiles:["local-only"],managed:"Analytics API"},{id:"analytics-consumer",project:"analytics",kind:"service",vps:!1,profiles:["local-only"],managed:"Analytics events"},{id:"analytics-scheduler",project:"analytics",kind:"service",vps:!1,profiles:["local-only"],managed:"Analytics scheduler"},{id:"analytics-web",project:"analytics",kind:"web",vps:!1,profiles:["local-only"],managed:"Analytics web"},{id:"caddy",project:"edge",kind:"proxy",vps:!0},{id:"clinicreport",project:"clinicreport",kind:"service",vps:!0,managed:"ClinicReport"},{id:"core-api",project:"controlpanel",kind:"service",vps:!0},{id:"db-init",project:"controlpanel",kind:"database",vps:!0},{id:"frontend",project:"controlpanel",kind:"web",vps:!0},{id:"hisplus-adapter",project:"controlpanel",kind:"service",vps:!0,managed:"HIS+ adapter"},{id:"integrationhub",project:"integrationhub",kind:"service",vps:!1,profiles:["local-only"],managed:"IntegrationHub"},{id:"integrationhub-db",project:"integrationhub",kind:"database",vps:!1,profiles:["local-only"],managed:"IntegrationHub database"},{id:"integrationhub-mq",project:"integrationhub",kind:"queue",vps:!1,profiles:["local-only"],managed:"IntegrationHub RabbitMQ"},{id:"integrationhub-web",project:"integrationhub",kind:"web",vps:!1,profiles:["local-only"],managed:"IntegrationHub web"},{id:"labflow-api",project:"labflow",kind:"service",vps:!0,managed:"LabFlow API"},{id:"labflow-web",project:"labflow",kind:"web",vps:!0,managed:"LabFlow web"},{id:"ledgerdash-adapter",project:"controlpanel",kind:"service",vps:!0,managed:"LedgerDashboard adapter"},{id:"ledgerdashboard",project:"ledgerdashboard",kind:"service",vps:!0,managed:"LedgerDashboard"},{id:"lessons-sync",project:"languagelessondesigner",kind:"service",vps:!0,managed:"English lessons sync"},{id:"lessons-web",project:"languagelessondesigner",kind:"web",vps:!0,managed:"English lessons"},{id:"programming-web",project:"programminglessondesigner",kind:"web",vps:!0,managed:"Programming lessons"},{id:"rebiomed-api",project:"rebiomed",kind:"service",vps:!0,managed:"ReBiomed API"},{id:"rebiomed-mongo",project:"rebiomed",kind:"database",vps:!0},{id:"rebiomed-seed",project:"rebiomed",kind:"job",vps:!1,profiles:["seed"]},{id:"rebiomed-web",project:"rebiomed",kind:"web",vps:!0,managed:"ReBiomed web"},{id:"seed-users",project:"controlpanel",kind:"job",vps:!0},{id:"socket-proxy",project:"controlpanel",kind:"proxy",vps:!0},{id:"sqlserver",project:"shared",kind:"database",vps:!0},{id:"wutility-adapter",project:"controlpanel",kind:"service",vps:!0,managed:"wUtility adapter"}],Ia=[{from:"analytics-api",to:"project:clinichub",labels:["ANALYTICS_OIDC_JWKS_URI"]},{from:"analytics-consumer",to:"analytics-api"},{from:"analytics-consumer",to:"project:clinichub",labels:["ANALYTICS_OIDC_JWKS_URI"]},{from:"analytics-scheduler",to:"analytics-api"},{from:"analytics-scheduler",to:"project:clinichub",labels:["ANALYTICS_OIDC_JWKS_URI"]},{from:"analytics-web",to:"analytics-api"},{from:"caddy",to:"clinicreport",labels:["report.arashkeshtgar.ca"]},{from:"caddy",to:"frontend",labels:["panel.arashkeshtgar.ca"]},{from:"caddy",to:"labflow-web"},{from:"caddy",to:"ledgerdashboard",labels:["ledger.arashkeshtgar.ca"]},{from:"caddy",to:"lessons-sync",labels:["ctx.arashkeshtgar.ca","english.arashkeshtgar.ca"]},{from:"caddy",to:"lessons-web",labels:["ctx.arashkeshtgar.ca","english.arashkeshtgar.ca"]},{from:"caddy",to:"programming-web",labels:["code.arashkeshtgar.ca"]},{from:"caddy",to:"rebiomed-web",labels:["rebiomed.arashkeshtgar.ca"]},{from:"core-api",to:"hisplus-adapter",labels:["ADAPTER_ALLOWED_HOSTS"]},{from:"core-api",to:"ledgerdash-adapter",labels:["ADAPTER_ALLOWED_HOSTS"]},{from:"core-api",to:"seed-users"},{from:"core-api",to:"socket-proxy",labels:["DOCKER_PROXY_URL"]},{from:"core-api",to:"sqlserver",labels:["ControlPanelDb"]},{from:"core-api",to:"wutility-adapter",labels:["ADAPTER_ALLOWED_HOSTS"]},{from:"db-init",to:"hisplus-adapter",labels:["HISPLUS_ADAPTER"]},{from:"db-init",to:"ledgerdash-adapter",labels:["LEDGERDASH_ADAPTER"]},{from:"db-init",to:"sqlserver"},{from:"db-init",to:"wutility-adapter",labels:["WUTILITY_ADAPTER"]},{from:"frontend",to:"core-api"},{from:"hisplus-adapter",to:"db-init"},{from:"hisplus-adapter",to:"sqlserver",labels:["HisPlusDemo"]},{from:"integrationhub",to:"integrationhub-db",labels:["integrationhub"]},{from:"integrationhub",to:"integrationhub-mq",labels:["HUB_RABBITMQ_HOST"]},{from:"integrationhub",to:"project:clinichub",labels:["HUB_AUTH_JWKS_URI","HUB_ROUTE_CLINICHUB_UPSTREAM"]},{from:"integrationhub",to:"project:clinicreport",labels:["HUB_ROUTE_CLINICREPORT_UPSTREAM"]},{from:"integrationhub",to:"project:financepowerapp",labels:["HUB_ROUTE_FINANCE_UPSTREAM"]},{from:"integrationhub",to:"project:labflow",labels:["HUB_ROUTE_LABFLOW_UPSTREAM"]},{from:"integrationhub",to:"project:pharmaflow",labels:["HUB_ROUTE_PHARMAFLOW_UPSTREAM"]},{from:"integrationhub-db",to:"integrationhub",labels:["POSTGRES_DB","POSTGRES_PASSWORD","POSTGRES_USER"]},{from:"integrationhub-web",to:"integrationhub"},{from:"labflow-api",to:"sqlserver",labels:["LabFlow"]},{from:"labflow-web",to:"labflow-api"},{from:"ledgerdash-adapter",to:"sqlserver",labels:["LedgerDashboard"]},{from:"ledgerdashboard",to:"sqlserver"},{from:"rebiomed-api",to:"rebiomed-mongo",labels:["rebiomed"]},{from:"rebiomed-seed",to:"rebiomed-mongo",labels:["rebiomed"]},{from:"rebiomed-web",to:"rebiomed-api"},{from:"seed-users",to:"db-init"},{from:"seed-users",to:"sqlserver"},{from:"wutility-adapter",to:"project:wutility",labels:["WUTILITY_API_BASE"]}],La=[{domain:"code.arashkeshtgar.ca",services:["programming-web"],private:!1},{domain:"ctx.arashkeshtgar.ca",services:["lessons-sync","lessons-web"],private:!0,files:!0},{domain:"english.arashkeshtgar.ca",services:["lessons-sync","lessons-web"],private:!1},{domain:"ledger.arashkeshtgar.ca",services:["ledgerdashboard"],private:!0},{domain:"panel.arashkeshtgar.ca",services:["frontend"],private:!1},{domain:"rebiomed.arashkeshtgar.ca",services:["rebiomed-web"],private:!1},{domain:"report.arashkeshtgar.ca",services:["clinicreport"],private:!1}],Da={sources:Ca,projects:Ea,links:Oa,services:Ra,edges:Ia,sites:La},M=Da,Ha=Object.assign({"../data/projects/analytics.json":Jt,"../data/projects/clinichub.json":Xt,"../data/projects/clinicreport.json":ea,"../data/projects/controlpanel.json":ta,"../data/projects/edge.json":sa,"../data/projects/financepowerapp.json":ia,"../data/projects/integrationhub.json":la,"../data/projects/labflow.json":ca,"../data/projects/languagelessondesigner.json":ua,"../data/projects/ledgerdashboard.json":fa,"../data/projects/overview.json":ga,"../data/projects/pharmaflow.json":va,"../data/projects/programminglessondesigner.json":wa,"../data/projects/rebiomed.json":_a,"../data/projects/shared.json":$a,"../data/projects/styling.json":Sa,"../data/projects/wutility.json":Pa}),Wa=Object.fromEntries(Object.values(Ha).map(e=>[e.default.id,e.default])),re=e=>Wa[e],bn=Object.fromEntries(ja.map(e=>[e.project,e])),Y=e=>bn[e],Fa=Object.assign({"../data/topics/analytics.json":()=>C(()=>import("./analytics-CCmLFsZv.js"),[]).then(e=>e.default),"../data/topics/clinichub.json":()=>C(()=>import("./clinichub-MnajvHxG.js"),[]).then(e=>e.default),"../data/topics/clinicreport.json":()=>C(()=>import("./clinicreport-CTX-YuJr.js"),[]).then(e=>e.default),"../data/topics/controlpanel.json":()=>C(()=>import("./controlpanel-8ja8v24q.js"),[]).then(e=>e.default),"../data/topics/edge.json":()=>C(()=>import("./edge-DZ3EE8hX.js"),[]).then(e=>e.default),"../data/topics/financepowerapp.json":()=>C(()=>import("./financepowerapp-gNPws5yE.js"),[]).then(e=>e.default),"../data/topics/integrationhub.json":()=>C(()=>import("./integrationhub-C_B0KDOq.js"),[]).then(e=>e.default),"../data/topics/labflow.json":()=>C(()=>import("./labflow-k_2SiR4K.js"),[]).then(e=>e.default),"../data/topics/languagelessondesigner.json":()=>C(()=>import("./languagelessondesigner-CV3D42qr.js"),[]).then(e=>e.default),"../data/topics/ledgerdashboard.json":()=>C(()=>import("./ledgerdashboard-CTsqeF3x.js"),[]).then(e=>e.default),"../data/topics/pharmaflow.json":()=>C(()=>import("./pharmaflow-LNRp3GhY.js"),[]).then(e=>e.default),"../data/topics/programminglessondesigner.json":()=>C(()=>import("./programminglessondesigner-B300nhbN.js"),[]).then(e=>e.default),"../data/topics/rebiomed.json":()=>C(()=>import("./rebiomed-DuESxmyM.js"),[]).then(e=>e.default),"../data/topics/shared.json":()=>C(()=>import("./shared-qO0u6T_K.js"),[]).then(e=>e.default),"../data/topics/wutility.json":()=>C(()=>import("./wutility-Bo6YfZQ4.js"),[]).then(e=>e.default)}),ae=Object.assign({"../data/topics/analytics.code.json":()=>C(()=>import("./analytics.code-BiqpoM_l.js"),[]).then(e=>e.default),"../data/topics/clinichub.code.json":()=>C(()=>import("./clinichub.code-IEC_Fbzg.js"),[]).then(e=>e.default),"../data/topics/clinicreport.code.json":()=>C(()=>import("./clinicreport.code-BfJGl4ze.js"),[]).then(e=>e.default),"../data/topics/controlpanel.code.json":()=>C(()=>import("./controlpanel.code-DPUv1uSK.js"),[]).then(e=>e.default),"../data/topics/edge.code.json":()=>C(()=>import("./edge.code-DXLCmzBe.js"),[]).then(e=>e.default),"../data/topics/financepowerapp.code.json":()=>C(()=>import("./financepowerapp.code-Dh59SQbz.js"),[]).then(e=>e.default),"../data/topics/integrationhub.code.json":()=>C(()=>import("./integrationhub.code-BuNrPR7y.js"),[]).then(e=>e.default),"../data/topics/labflow.code.json":()=>C(()=>import("./labflow.code-DYT1-8sB.js"),[]).then(e=>e.default),"../data/topics/languagelessondesigner.code.json":()=>C(()=>import("./languagelessondesigner.code-Dv4rgcsn.js"),[]).then(e=>e.default),"../data/topics/ledgerdashboard.code.json":()=>C(()=>import("./ledgerdashboard.code-Pg2e442C.js"),[]).then(e=>e.default),"../data/topics/pharmaflow.code.json":()=>C(()=>import("./pharmaflow.code-BiM26Y01.js"),[]).then(e=>e.default),"../data/topics/programminglessondesigner.code.json":()=>C(()=>import("./programminglessondesigner.code-CGuhwb24.js"),[]).then(e=>e.default),"../data/topics/rebiomed.code.json":()=>C(()=>import("./rebiomed.code-dH4lMKR0.js"),[]).then(e=>e.default),"../data/topics/shared.code.json":()=>C(()=>import("./shared.code-c_I56BbU.js"),[]).then(e=>e.default),"../data/topics/wutility.code.json":()=>C(()=>import("./wutility.code-BT5XOfxL.js"),[]).then(e=>e.default)}),vn=$n({}),ne={},Ma=e=>vn[e];function za(e){return ne[e]??(ne[e]=(async()=>{var c;const[i,s]=await Promise.all([Fa[`../data/topics/${e}.json`](),(c=ae[`../data/topics/${e}.code.json`])==null?void 0:c.call(ae)]);return vn[e]={topics:i,code:s}})().catch(i=>{throw delete ne[e],i}))}function Va(e,i){return Object.fromEntries(Object.entries(e.examples??{}).map(([s,c])=>{const l=i==null?void 0:i.examples[`${e.id}/${s}`],w=l&&l.start!==l.end?`${l.start}-${l.end}`:l==null?void 0:l.start;return[s,{title:c.title,lang:c.lang,code:(l==null?void 0:l.code)??`// missing snapshot: ${c.file}`,source:`${i==null?void 0:i.repo}/${c.file}${w?`:${w}`:""}`}]}))}const ce=["controlpanel","ledgerdashboard","rebiomed","labflow","clinicreport"],pe=e=>{const i=ce.indexOf(e.id);return i<0?ce.length+100-e.services.length:i};function qa(e){return e.id==="edge"||e.id==="shared"?"infra":e.inCompose?e.onVps?"server":"pc":"external"}const N=[{id:"overview",group:"overview"},...["server","pc","external","infra"].flatMap(e=>M.projects.filter(i=>qa(i)===e).sort((i,s)=>pe(i)-pe(s)||i.name.localeCompare(s.name)).flatMap(i=>{var s;return[{id:i.id,group:e,project:i},...(((s=bn[i.id])==null?void 0:s.pages)??[]).map(c=>({id:`${i.id}/${c.id}`,group:e,project:i,topic:c}))]})),{id:"styling",group:"about"}],ue=e=>N.find(i=>i.id===e),X=e=>M.projects.find(i=>i.id===e),oe=e=>M.services.find(i=>i.id===e),yn=e=>e.startsWith("project:")?e.slice(8):oe(e).project,Ba=e=>M.links.filter(i=>i.from===e),Na=e=>M.links.filter(i=>i.to===e),he=e=>M.sites.filter(i=>i.services.some(s=>e.services.includes(s))),Qa=["aria-label"],Ua={class:"legend-arrow"},Ga={class:"legend-pc"},Ka={class:"legend-external"},Ja={class:"doc-table-wrap"},Ya={class:"doc-table"},Xa={dir:"ltr"},Za=["href"],es={class:"doc-refs"},ns={dir:"ltr"},ts=q({__name:"OverviewDoc",props:{lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]),c=re("overview"),l=b(()=>M.projects.map(h=>{const r=h.inCompose?h.onVps?"vps":"pc":"external";return{id:h.id,label:h.name,sub:r==="vps"?s.value.counts(h.services.length):r==="pc"?s.value.groupPc:s.value.groupExternal,project:h.id,where:r,to:`/projects/${i.lang}/${h.id}`}})),w=b(()=>M.links.map(h=>({from:h.from,to:h.to,title:`${X(h.from).name} → ${X(h.to).name}
${h.via.join(`
`)}`}))),d=b(()=>M.sites.map(h=>({...h,project:X(yn(h.services[0]))})));return(h,r)=>(a(),o("article",null,[n("h1",null,t(s.value.overview),1),y(c)?(a(),L(te,{key:0,sections:y(c)[e.lang]??[],lang:e.lang},null,8,["sections","lang"])):S("",!0),F(be,{nodes:l.value,arrows:w.value,label:s.value.overview},null,8,["nodes","arrows","label"]),n("ul",{class:"map-legend","aria-label":s.value.legend},[n("li",Ua,t(s.value.legendArrow),1),n("li",Ga,t(s.value.legendPc),1),n("li",Ka,t(s.value.legendExternal),1)],8,Qa),n("h2",null,t(s.value.sites),1),n("div",Ja,[n("table",Ya,[n("thead",null,[n("tr",null,[n("th",null,t(s.value.domain),1),n("th",null,t(s.value.project),1),n("th",null,t(s.value.access),1)])]),n("tbody",null,[(a(!0),o(v,null,A(d.value,f=>(a(),o("tr",{key:f.domain},[n("td",Xa,[n("a",{href:`https://${f.domain}/`,rel:"noopener"},t(f.domain),9,Za)]),n("td",null,[F(y(H),{to:`/projects/${e.lang}/${f.project.id}`},{default:D(()=>[O(t(f.project.name),1)]),_:2},1032,["to"])]),n("td",null,[n("span",{class:I(["access",f.private?"is-private":"is-public"])},t(f.private?s.value.private:s.value.public),3)])]))),128))])])]),n("h2",null,t(s.value.mapHow),1),n("p",null,t(s.value.mapHowBody),1),n("p",null,t(s.value.sources)+":",1),n("ul",es,[(a(!0),o(v,null,A(y(M).sources,f=>(a(),o("li",{key:f},[n("code",ns,t(f),1)]))),128)),r[0]||(r[0]=n("li",null,[n("code",{dir:"ltr"},"scripts/project-map.mjs")],-1))])]))}}),wn="projects-read";function as(){try{const e=JSON.parse(localStorage.getItem(wn)??"[]");return new Set(Array.isArray(e)?e.filter(i=>typeof i=="string"):[])}catch{return new Set}}const Z=An(as()),G=e=>Z.has(e);function fe(e,i){i?Z.add(e):Z.delete(e);try{localStorage.setItem(wn,JSON.stringify([...Z]))}catch{}}const ie=(e,i)=>i.filter(s=>Z.has(`${e}/${s.id}`)).length,ss={class:"project-title"},os={key:0,class:"project-summary"},is={class:"glance"},rs={dir:"ltr"},ls=["href"],ds={class:"doc-table-wrap"},cs={class:"doc-table"},ps={dir:"ltr"},us={key:0},hs={key:1},fs={dir:"ltr"},ms={class:"connections"},gs={key:0},bs={key:1,class:"muted"},vs={key:0},ys={key:1,class:"muted"},ws={class:"doc-progress"},ks=["value","max"],_s=["title"],Ts={key:4,class:"doc-note"},$s=q({__name:"ProjectDoc",props:{project:{},lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]),c=b(()=>re(i.project.id)),l=b(()=>Y(i.project.id)),w=b(()=>i.project.inCompose?i.project.onVps?s.value.runsVps:s.value.runsPc:s.value.runsExternal),d=b(()=>i.project.services.map(T=>oe(T))),h=b(()=>Ba(i.project.id)),r=b(()=>Na(i.project.id)),f=b(()=>M.edges.filter(T=>i.project.services.includes(T.from)||i.project.services.includes(T.to))),m=b(()=>[...new Set([...i.project.services,...f.value.flatMap(j=>[j.from,j.to])])].map(j=>{const g=X(yn(j)),x=g.id===i.project.id,u=oe(j);return{id:j,label:u?j:g.name,sub:x?s.value.kinds[u.kind]:g.name,project:g.id,where:u?u.vps?"vps":"pc":"external",to:x?void 0:`/projects/${i.lang}/${g.id}`}})),k=b(()=>f.value.map(T=>{var j;return{from:T.from,to:T.to,title:((j=T.labels)==null?void 0:j.join(", "))??""}})),p=T=>X(T).name;return(T,j)=>{var g,x;return a(),o("article",{class:I(`accent-${e.project.id}`)},[n("h1",ss,t(e.project.name),1),(g=c.value)!=null&&g.summary?(a(),o("p",os,t(c.value.summary[e.lang]),1)):S("",!0),n("h2",null,t(s.value.atGlance),1),n("dl",is,[n("dt",null,t(s.value.repo),1),n("dd",null,[n("code",rs,t(e.project.repo),1)]),n("dt",null,t(s.value.runs),1),n("dd",null,t(w.value),1),y(he)(e.project).length?(a(),o(v,{key:0},[n("dt",null,t(s.value.domains),1),n("dd",null,[(a(!0),o(v,null,A(y(he)(e.project),u=>(a(),o("span",{key:u.domain,class:"site"},[n("a",{href:`https://${u.domain}/`,dir:"ltr",rel:"noopener"},t(u.domain),9,ls),n("span",{class:I(["access",u.private?"is-private":"is-public"])},t(u.private?s.value.private:s.value.public),3)]))),128))])],64)):S("",!0)]),d.value.length?(a(),o(v,{key:1},[n("h2",null,t(s.value.services),1),n("div",ds,[n("table",cs,[n("thead",null,[n("tr",null,[n("th",null,t(s.value.service),1),n("th",null,t(s.value.kind),1),n("th",null,t(s.value.notes),1)])]),n("tbody",null,[(a(!0),o(v,null,A(d.value,u=>(a(),o("tr",{key:u.id},[n("td",ps,[n("code",null,t(u.id),1)]),n("td",null,t(s.value.kinds[u.kind]),1),n("td",null,[u.managed?(a(),o("span",us,t(s.value.managed)+" «"+t(u.managed)+"»",1)):S("",!0),u.profiles?(a(),o("span",hs,[O(t(s.value.profile)+": ",1),n("code",fs,t(u.profiles.join(", ")),1)])):S("",!0)])]))),128))])])])],64)):S("",!0),n("h2",null,t(s.value.connections),1),n("div",ms,[n("section",null,[n("h3",null,t(s.value.talksTo),1),h.value.length?(a(),o("ul",gs,[(a(!0),o(v,null,A(h.value,u=>(a(),o("li",{key:u.to},[F(y(H),{to:`/projects/${e.lang}/${u.to}`},{default:D(()=>[O(t(p(u.to)),1)]),_:2},1032,["to"]),n("small",null,[O(t(s.value.via)+" ",1),(a(!0),o(v,null,A(u.via,E=>(a(),o("code",{key:E,dir:"ltr"},t(E),1))),128))])]))),128))])):(a(),o("p",bs,t(s.value.none),1))]),n("section",null,[n("h3",null,t(s.value.usedBy),1),r.value.length?(a(),o("ul",vs,[(a(!0),o(v,null,A(r.value,u=>(a(),o("li",{key:u.from},[F(y(H),{to:`/projects/${e.lang}/${u.from}`},{default:D(()=>[O(t(p(u.from)),1)]),_:2},1032,["to"]),n("small",null,[O(t(s.value.via)+" ",1),(a(!0),o(v,null,A(u.via,E=>(a(),o("code",{key:E,dir:"ltr"},t(E),1))),128))])]))),128))])):(a(),o("p",ys,t(s.value.none),1))])]),m.value.length>1?(a(),o(v,{key:2},[n("h2",null,t(s.value.diagram),1),F(be,{nodes:m.value,arrows:k.value,label:`${e.project.name}: ${s.value.diagram}`},null,8,["nodes","arrows","label"])],64)):S("",!0),l.value?(a(),o(v,{key:3},[n("h2",null,t(s.value.contents),1),n("p",null,t(s.value.contentsIntro),1),n("p",ws,[n("progress",{value:y(ie)(e.project.id,l.value.pages),max:l.value.pages.length},null,8,ks),O(" "+t(s.value.readOf(y(ie)(e.project.id,l.value.pages),l.value.pages.length)),1)]),(a(!0),o(v,null,A(l.value.groups,u=>(a(),o("section",{key:u.id,class:"contents-group"},[n("h3",null,t(u.title[e.lang]),1),n("ol",null,[(a(!0),o(v,null,A(l.value.pages.filter(E=>E.group===u.id),E=>(a(),o("li",{key:E.id},[F(y(H),{to:`/projects/${e.lang}/${e.project.id}/${E.id}`},{default:D(()=>[O(t(E.title[e.lang]),1)]),_:2},1032,["to"]),y(G)(`${e.project.id}/${E.id}`)?(a(),o("span",{key:0,class:"read-mark",title:s.value.isRead},"✓",8,_s)):S("",!0)]))),128))])]))),128))],64)):(x=c.value)!=null&&x[e.lang]?S("",!0):(a(),o("p",Ts,t(s.value.noWriteup),1)),c.value?(a(),L(te,{key:5,sections:c.value[e.lang]??[],examples:c.value.examples,refs:c.value.refs,lang:e.lang},null,8,["sections","examples","refs","lang"])):S("",!0)],2)}}}),As={key:0,class:"project-summary"},Ss=q({__name:"StylingDoc",props:{lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]),c=re("styling");return(l,w)=>(a(),o("article",null,[n("h1",null,t(s.value.styling),1),y(c).summary?(a(),o("p",As,t(y(c).summary[e.lang]),1)):S("",!0),F(te,{sections:y(c)[e.lang]??[],examples:y(c).examples,lang:e.lang},null,8,["sections","examples","lang"])]))}}),xs=["aria-label"],Ps={class:"muted"},js=["innerHTML"],Cs=["aria-label"],Es=["aria-pressed","disabled","onClick","innerHTML"],Os=["innerHTML"],Rs={key:0,class:"quiz-score"},Is=q({__name:"TopicQuiz",props:{quiz:{},lang:{}},emits:["done"],setup(e,{emit:i}){const s=e,c=i,l=b(()=>V[s.lang]),w=Q(s.quiz.map(()=>[])),d=k=>w.value[k].includes(s.quiz[k].answer),h=b(()=>s.quiz.every((k,p)=>d(p))),r=b(()=>s.quiz.filter((k,p)=>w.value[p][0]===k.answer).length);function f(k,p){d(k)||w.value[k].includes(p)||(w.value[k].push(p),h.value&&c("done"))}const m=()=>w.value=s.quiz.map(()=>[]);return(k,p)=>(a(),o("section",{class:"quiz","aria-label":l.value.quiz},[n("h2",null,t(l.value.quiz),1),n("p",Ps,t(l.value.quizIntro),1),n("ol",null,[(a(!0),o(v,null,A(e.quiz,(T,j)=>(a(),o("li",{key:j,class:"quiz-q"},[n("p",{class:"quiz-text",innerHTML:y(J)(T.q[e.lang])},null,8,js),n("div",{class:"quiz-options",role:"group","aria-label":T.q[e.lang]},[(a(!0),o(v,null,A(T.options[e.lang],(g,x)=>(a(),o("button",{key:x,type:"button",class:I({right:w.value[j].includes(x)&&x===T.answer,wrong:w.value[j].includes(x)&&x!==T.answer}),"aria-pressed":w.value[j].includes(x),disabled:d(j)&&x!==T.answer,onClick:u=>f(j,x),innerHTML:y(J)(g)},null,10,Es))),128))],8,Cs),w.value[j].length?(a(),o("p",{key:0,class:I(["quiz-why",d(j)?"right":"wrong"]),"aria-live":"polite"},[n("strong",null,t(d(j)?l.value.right:l.value.wrong),1),d(j)?(a(),o("span",{key:0,innerHTML:" "+y(J)(T.why[e.lang])},null,8,Os)):S("",!0)],2)):S("",!0)]))),128))]),h.value?(a(),o("p",Rs,[O(t(l.value.score(r.value,e.quiz.length))+" ",1),n("button",{type:"button",class:"quiz-again",onClick:m},t(l.value.quizAgain),1)])):S("",!0)],8,xs))}}),Ls={class:"breadcrumb"},Ds={class:"project-title"},Hs={key:0,class:"topic-files"},Ws={dir:"ltr"},Fs={key:0,class:"muted"},Ms={class:"topic-done"},zs=["aria-pressed"],Vs={key:1,class:"doc-note"},qs={key:2,class:"muted","aria-live":"polite"},Bs=q({__name:"TopicDoc",props:{project:{},topic:{},lang:{}},setup(e){const i=e,s=b(()=>V[i.lang]),c=b(()=>{var k;return(k=Y(i.project.id))==null?void 0:k.groups.find(p=>p.id===i.topic.group)}),l=Q(!1),w=()=>{l.value=!1,za(i.project.id).catch(()=>l.value=!0)};K(()=>i.project.id,w,{immediate:!0});const d=b(()=>Ma(i.project.id)),h=b(()=>{var k;return(k=d.value)==null?void 0:k.topics.pages.find(p=>p.id===i.topic.id)}),r=b(()=>{var k;return(k=d.value)==null?void 0:k.code}),f=b(()=>h.value?Va(h.value,r.value):{}),m=b(()=>`${i.project.id}/${i.topic.id}`);return(k,p)=>{var T,j,g;return a(),o("article",{class:I(`accent-${e.project.id}`)},[n("p",Ls,[F(y(H),{to:`/projects/${e.lang}/${e.project.id}`},{default:D(()=>[O(t(e.project.name),1)]),_:1},8,["to"]),p[2]||(p[2]=n("span",{"aria-hidden":"true"}," › ",-1)),n("span",null,t((T=c.value)==null?void 0:T.title[e.lang]),1)]),n("h1",Ds,t(e.topic.title[e.lang]),1),h.value?(a(),o(v,{key:0},[(j=h.value.files)!=null&&j.length?(a(),o("div",Hs,[n("b",null,t(s.value.files),1),n("ul",null,[(a(!0),o(v,null,A(h.value.files,x=>{var u;return a(),o("li",{key:x},[n("code",Ws,t(x),1),(u=r.value)!=null&&u.files[x]?(a(),o("small",Fs,t(s.value.lines(r.value.files[x])),1)):S("",!0)])}),128))])])):S("",!0),F(te,{sections:h.value[e.lang],examples:f.value,code:r.value,lang:e.lang},null,8,["sections","examples","code","lang"]),(g=h.value.quiz)!=null&&g.length?(a(),L(Is,{key:m.value,quiz:h.value.quiz,lang:e.lang,onDone:p[0]||(p[0]=x=>y(fe)(m.value,!0))},null,8,["quiz","lang"])):S("",!0),n("p",Ms,[n("button",{type:"button",class:I({on:y(G)(m.value)}),"aria-pressed":y(G)(m.value),onClick:p[1]||(p[1]=x=>y(fe)(m.value,!y(G)(m.value)))},t(y(G)(m.value)?s.value.isRead:s.value.markRead),11,zs)])],64)):l.value?(a(),o("p",Vs,[O(t(s.value.loadFailed)+" ",1),n("button",{type:"button",class:"quiz-again",onClick:w},t(s.value.retry),1)])):(a(),o("p",qs,t(s.value.loading),1))],2)}}}),me=e=>e.toLowerCase().replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/[‌‏‎]/g,"").replace(/\s+/g," ");function Ns(e,i,s=30){var h;const c=me(e).trim().split(" ").filter(Boolean);if(!c.length)return[];const l=r=>{const f=me(r);return c.every(m=>f.includes(m))},w=[],d=[];for(const r of N){if(!r.project)continue;const f=r.topic?r.topic.title[i]:r.project.name;if(l(r.topic?`${f} ${r.project.name}`:f))w.push({page:r});else{const m=(h=r.topic)==null?void 0:h.heads[i].find(l);m&&d.push({page:r,head:m})}}return[...w,...d].slice(0,s)}const Qs=["dir","lang"],Us={class:"docs-head"},Gs=["aria-expanded"],Ks={class:"docs-title"},Js={class:"lang-switch","aria-label":"Language"},Ys={class:"docs-body"},Xs=["aria-label"],Zs={class:"docs-search",role:"search"},eo=["placeholder","aria-label"],no={key:0,id:"docs-hits",class:"docs-hits","aria-live":"polite"},to={key:0},ao={key:0,class:"muted"},so={key:0,class:"side-progress"},oo=["title"],io={class:"docs-main"},ro={class:"docs-pager"},lo={class:"docs-pager"},po=q({__name:"ProjectsView",setup(e){const i=On(),s=ge(),c=b(()=>i.params.lang),l=b(()=>V[c.value]),w=b(()=>{const{page:_,topic:$}=i.params;return _?$?`${_}/${$}`:String(_):"overview"}),d=b(()=>ue(w.value)??N[0]);K(c,Rn,{immediate:!0});const h=[{group:"server",label:"groupServer"},{group:"pc",label:"groupPc"},{group:"external",label:"groupExternal"},{group:"infra",label:"groupInfra"}],r=b(()=>h.map(_=>({..._,pages:N.filter($=>$.group===_.group&&!$.topic)}))),f=b(()=>{var P;const _=(P=d.value.project)==null?void 0:P.id,$=_?Y(_):void 0;return $?$.groups.map(R=>({...R,pages:$.pages.filter(B=>B.group===R.id)})):[]}),m=Q(null);K(()=>{var _;return(_=d.value.project)==null?void 0:_.id},_=>_!==m.value&&(m.value=null));const k=_=>{var $;return _===(($=d.value.project)==null?void 0:$.id)&&_!==m.value},p=_=>{var $;_===(($=d.value.project)==null?void 0:$.id)&&(m.value=m.value===_?null:_)},T=_=>{const $=ue(_);return $.topic?$.topic.title[c.value]:$.project?$.project.name:_==="styling"?l.value.styling:l.value.overview};Sn(()=>document.title=`${T(d.value.id)} · ${l.value.title} · Programming Lessons`);const j=b(()=>N.indexOf(d.value)),g=b(()=>N[j.value-1]),x=b(()=>N[j.value+1]),u=(_,$=c.value)=>_==="overview"?`/projects/${$}`:`/projects/${$}/${_}`,E=Q(!1);K(()=>i.fullPath,()=>E.value=!1);const W=Q(""),z=b(()=>Ns(W.value,c.value));K(()=>i.fullPath,()=>W.value="");const ee=Q(),kn=()=>z.value[0]&&s.push(u(z.value[0].page.id)),le=_=>{var P;const $=_.target;_.key!=="/"||_.ctrlKey||_.metaKey||_.altKey||$.closest("input, textarea, [contenteditable]")||(_.preventDefault(),E.value=!0,(P=ee.value)==null||P.focus())};xn(()=>document.addEventListener("keydown",le)),Pn(()=>document.removeEventListener("keydown",le));const de=_=>{var R;const $=(R=Y(_))==null?void 0:R.pages,P=B=>B.toLocaleString(c.value==="fa"?"fa-IR":"en");return $?`${P(ie(_,$))}/${P($.length)}`:""};return(_,$)=>(a(),o("div",{class:"docs",dir:c.value==="fa"?"rtl":"ltr",lang:c.value},[n("header",Us,[n("button",{type:"button",class:"docs-menu","aria-expanded":E.value,"aria-controls":"docs-side",onClick:$[0]||($[0]=P=>E.value=!E.value)},t(l.value.menu),9,Gs),n("div",Ks,[n("strong",null,t(l.value.title),1),n("span",null,t(l.value.tagline),1)]),n("nav",Js,[(a(!0),o(v,null,A(y(jn),P=>(a(),L(y(H),{key:P,to:u(d.value.id,P),class:I({on:P===c.value}),lang:P,hreflang:P},{default:D(()=>[O(t(y(V)[P].langName),1)]),_:2},1032,["to","class","lang","hreflang"]))),128))])]),n("div",Ys,[n("nav",{id:"docs-side",class:I(["docs-side",{open:E.value}]),"aria-label":l.value.title},[n("div",Zs,[Cn(n("input",{ref_key:"searchBox",ref:ee,"onUpdate:modelValue":$[1]||($[1]=P=>W.value=P),type:"search",placeholder:l.value.searchHint,"aria-label":l.value.search,"aria-controls":"docs-hits",onKeydown:[se(kn,["enter"]),$[2]||($[2]=se(P=>W.value="",["esc"]))]},null,40,eo),[[En,W.value]])]),W.value.trim()?(a(),o("div",no,[(a(!0),o(v,null,A(z.value,P=>(a(),L(y(H),{key:P.page.id,to:u(P.page.id),class:I(`accent-${P.page.project.id}`)},{default:D(()=>[O(t(T(P.page.id))+" ",1),P.page.topic?(a(),o("small",to,[O(t(P.page.project.name),1),P.head?(a(),o(v,{key:0},[O(" · "+t(l.value.inHeading)+": "+t(P.head),1)],64)):S("",!0)])):S("",!0)]),_:2},1032,["to","class"]))),128)),z.value.length?S("",!0):(a(),o("p",ao,t(l.value.noResults),1))])):(a(),o(v,{key:1},[F(y(H),{to:u("overview"),class:I({on:d.value.id==="overview"})},{default:D(()=>[O(t(l.value.overview),1)]),_:1},8,["to","class"]),(a(!0),o(v,null,A(r.value,P=>(a(),o(v,{key:P.group},[n("h3",null,t(l.value[P.label]),1),(a(!0),o(v,null,A(P.pages,R=>(a(),o(v,{key:R.id},[F(y(H),{to:u(R.id),class:I([`accent-${R.project.id}`,{on:R.id===d.value.id,open:k(R.project.id)}]),"aria-current":R.id===d.value.id?"page":void 0,"aria-expanded":y(Y)(R.project.id)?k(R.project.id):void 0,onClick:B=>p(R.project.id)},{default:D(()=>[O(t(T(R.id))+" ",1),de(R.project.id)?(a(),o("small",so,t(de(R.project.id)),1)):S("",!0)]),_:2},1032,["to","class","aria-current","aria-expanded","onClick"]),k(R.project.id)&&f.value.length?(a(),o("div",{key:0,class:I(["side-topics",`accent-${R.project.id}`])},[(a(!0),o(v,null,A(f.value,B=>(a(),o(v,{key:B.id},[n("h4",null,t(B.title[c.value]),1),(a(!0),o(v,null,A(B.pages,U=>(a(),L(y(H),{key:U.id,to:u(`${R.id}/${U.id}`),class:I({on:`${R.id}/${U.id}`===d.value.id}),"aria-current":`${R.id}/${U.id}`===d.value.id?"page":void 0},{default:D(()=>[O(t(U.title[c.value])+" ",1),y(G)(`${R.id}/${U.id}`)?(a(),o("span",{key:0,class:"read-mark",title:l.value.isRead},"✓",8,oo)):S("",!0)]),_:2},1032,["to","class","aria-current"]))),128))],64))),128))],2)):S("",!0)],64))),128))],64))),128)),n("h3",null,t(l.value.groupAbout),1),F(y(H),{to:u("styling"),class:I({on:d.value.id==="styling"})},{default:D(()=>[O(t(l.value.styling),1)]),_:1},8,["to","class"])],64))],10,Xs),n("main",io,[n("nav",ro,[g.value?(a(),L(y(H),{key:0,to:u(g.value.id),class:"prev"},{default:D(()=>[O(t(l.value.previous),1)]),_:1},8,["to"])):S("",!0),x.value?(a(),L(y(H),{key:1,to:u(x.value.id),class:"next"},{default:D(()=>[O(t(l.value.next),1)]),_:1},8,["to"])):S("",!0)]),d.value.group==="overview"?(a(),L(ts,{key:0,lang:c.value},null,8,["lang"])):d.value.id==="styling"?(a(),L(Ss,{key:1,lang:c.value},null,8,["lang"])):d.value.topic?(a(),L(Bs,{key:d.value.id,project:d.value.project,topic:d.value.topic,lang:c.value},null,8,["project","topic","lang"])):(a(),L($s,{key:d.value.id,project:d.value.project,lang:c.value},null,8,["project","lang"])),n("nav",lo,[g.value?(a(),L(y(H),{key:0,to:u(g.value.id),class:"prev"},{default:D(()=>[O(t(l.value.previous)+": "+t(T(g.value.id)),1)]),_:1},8,["to"])):S("",!0),x.value?(a(),L(y(H),{key:1,to:u(x.value.id),class:"next"},{default:D(()=>[O(t(l.value.next)+": "+t(T(x.value.id)),1)]),_:1},8,["to"])):S("",!0)])])])],8,Qs))}});export{po as default};
