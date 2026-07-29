function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const ANCHOR_ICON = '<svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-text-primary">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface px-1.5 py-0.5 text-caption font-mono text-accent-text rounded">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent-text underline underline-offset-2 hover:text-accent-hover transition-colors">$1</a>')
}

function parseTable(block: string): string {
  const rows = block.split('\n').filter((l) => l.startsWith('|'))
  if (rows.length < 2) return ''
  const hasHeader = rows[1]?.includes('---')
  const header = hasHeader ? rows[0] : null
  const data = hasHeader ? rows.slice(2) : rows

  let html = '<div class="overflow-x-auto"><table class="w-full border-collapse text-small sm:text-body">'
  if (header) {
    html += '<thead><tr>'
    header
      .split('|')
      .filter((c) => c.trim())
      .forEach((c) => {
        html += `<th class="text-left font-bold text-text-primary p-2 sm:p-3 border-b-2 border-accent">${parseInline(c.trim())}</th>`
      })
    html += '</tr></thead>'
  }
  html += '<tbody>'
  for (const row of data) {
    html += '<tr class="border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors">'
    row
      .split('|')
      .filter((c) => c.trim())
      .forEach((c) => {
        html += `<td class="p-2 sm:p-3 text-text-muted">${parseInline(c.trim())}</td>`
      })
    html += '</tr>'
  }
  html += '</tbody></table></div>'
  return html
}

function parseChecklist(block: string): string {
  const items = block.split('\n').filter((l) => l.startsWith('- ['))
  const lis = items
    .map((l) => {
      const checked = l.startsWith('- [x]')
      const text = l.slice(5)
      return `<li class="flex items-start gap-3 py-1.5 group"><span class="inline-flex items-center justify-center w-5 h-5 mt-0.5 shrink-0 rounded border-2 ${
        checked
          ? 'bg-accent border-accent'
          : 'border-border group-hover:border-accent/50 transition-colors'
      }">${
        checked
          ? '<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>'
          : ''
      }</span><span class="text-text-muted leading-relaxed">${parseInline(text)}</span></li>`
    })
    .join('')
  return `<ul class="space-y-0.5 not-prose">${lis}</ul>`
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function mdToHtml(md: string): string {
  let headingIndex = 0

  const html = md
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      // Headings with anchor IDs
      if (trimmed.startsWith('### ')) {
        headingIndex++
        const text = trimmed.slice(4)
        const id = generateId(text) || `h-${headingIndex}`
        return `<h3 id="${id}" class="group flex items-center gap-2 text-base font-bold text-text-primary mt-6 mb-2 scroll-mt-20">${parseInline(text)}<a href="#${id}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-fast ml-1" aria-label="Link">${ANCHOR_ICON}</a></h3>`
      }
      if (trimmed.startsWith('## ')) {
        headingIndex++
        const text = trimmed.slice(3)
        const id = generateId(text) || `h-${headingIndex}`
        return `<h2 id="${id}" class="group flex items-center gap-2 text-lg sm:text-xl font-bold text-text-heading mt-8 mb-3 scroll-mt-20">${parseInline(text)}<a href="#${id}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-fast ml-1" aria-label="Link">${ANCHOR_ICON}</a></h2>`
      }
      if (trimmed.startsWith('# ')) {
        headingIndex++
        const text = trimmed.slice(2)
        const id = generateId(text) || `h-${headingIndex}`
        return `<h1 id="${id}" class="group flex items-center gap-2 text-2xl sm:text-3xl font-display font-heading text-text-heading mt-2 mb-6 scroll-mt-20">${parseInline(text)}<a href="#${id}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-fast ml-1" aria-label="Link">${ANCHOR_ICON}</a></h1>`
      }

      // Checklist
      if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        return parseChecklist(trimmed)
      }

      // Unordered list
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li class="text-text-muted leading-relaxed">${parseInline(l.slice(2))}</li>`)
          .join('')
        return `<ul class="list-disc pl-5 space-y-1.5">${items}</ul>`
      }

      // Table
      if (trimmed.startsWith('| ')) return parseTable(trimmed)

      // Horizontal rule
      if (trimmed.startsWith('---')) return '<hr class="my-8 border-border" />'

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const lines = trimmed.split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2))
        const quoteText = lines.join('<br/>')
        return `<blockquote class="border-l-[3px] border-accent pl-4 sm:pl-5 py-3 my-6 bg-accent-muted/30 rounded-r-sm"><p class="text-text-muted italic leading-relaxed">${parseInline(quoteText)}</p></blockquote>`
      }

      // Regular paragraph
      return `<p class="text-text-muted mb-3 leading-relaxed break-words">${parseInline(trimmed)}</p>`
    })
    .join('\n')

  return html
}

/** Extract all headings from markdown for building a table of contents */
export function extractHeadings(md: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = []
  let index = 0
  for (const line of md.split('\n')) {
    const trimmed = line.trim()
    let level = 0
    let text = ''
    if (trimmed.startsWith('### ')) { level = 3; text = trimmed.slice(4) }
    else if (trimmed.startsWith('## ')) { level = 2; text = trimmed.slice(3) }
    else if (trimmed.startsWith('# ')) { level = 1; text = trimmed.slice(2) }
    if (level > 0 && text) {
      index++
      const id = generateId(text) || `h-${index}`
      headings.push({ level, text, id })
    }
  }
  return headings
}
