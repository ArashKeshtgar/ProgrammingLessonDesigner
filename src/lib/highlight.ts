import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import csharp from 'highlight.js/lib/languages/csharp'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import nginx from 'highlight.js/lib/languages/nginx'
import powershell from 'highlight.js/lib/languages/powershell'
import python from 'highlight.js/lib/languages/python'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

// Only the languages the lessons use, so the bundle stays small.
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('java', java)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('python', python)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)

// Returns escaped HTML: highlight.js escapes the source, so it is safe for v-html.
export function highlight(code: string, language: string): string {
  return hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : hljs.highlight(code, { language: 'plaintext' }).value
}
