function parseInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
}

function parseTable(block: string): string {
  const rows = block.split('\n').filter((l) => l.startsWith('|'))
  if (rows.length < 2) return ''
  const hasHeader = rows[1]?.includes('---')
  const header = hasHeader ? rows[0] : null
  const data = hasHeader ? rows.slice(2) : rows

  let html = '<table class="w-full border-collapse">'
  if (header) {
    html += '<thead><tr>'
    header
      .split('|')
      .filter((c) => c.trim())
      .forEach((c) => {
        html += `<th class="text-left font-bold text-text-primary p-2 border-b border-border">${parseInline(c.trim())}</th>`
      })
    html += '</tr></thead>'
  }
  html += '<tbody>'
  for (const row of data) {
    html += '<tr>'
    row
      .split('|')
      .filter((c) => c.trim())
      .forEach((c) => {
        html += `<td class="p-2 border-b border-border text-text-muted">${parseInline(c.trim())}</td>`
      })
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

export function mdToHtml(md: string): string {
  return md
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      if (trimmed.startsWith('### '))
        return `<h3 class="text-base font-bold text-text-primary mt-5 mb-2">${parseInline(trimmed.slice(4))}</h3>`
      if (trimmed.startsWith('## '))
        return `<h2 class="text-lg font-bold text-text-primary mt-6 mb-3">${parseInline(trimmed.slice(3))}</h2>`
      if (trimmed.startsWith('# '))
        return `<h1 class="text-xl font-bold text-text-primary mt-6 mb-4">${parseInline(trimmed.slice(2))}</h1>`
      if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        const items = trimmed.split('\n').filter((l) => l.startsWith('- ['))
        const lis = items
          .map((l) => {
            const checked = l.startsWith('- [x]')
            const text = l.slice(5)
            return `<li class="flex items-start gap-2 py-1"><input type="checkbox"${checked ? ' checked' : ''} disabled class="mt-1 accent-primary" />${parseInline(text)}</li>`
          })
          .join('')
        return `<ul class="space-y-1">${lis}</ul>`
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li class="py-0.5">${parseInline(l.slice(2))}</li>`)
          .join('')
        return `<ul class="list-disc list-inside space-y-0.5 text-text-muted">${items}</ul>`
      }
      if (trimmed.startsWith('| ')) return parseTable(trimmed)
      if (trimmed.startsWith('---')) return '<hr class="my-6 border-border" />'
      if (trimmed.startsWith('> '))
        return `<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 text-text-muted italic">${parseInline(trimmed.slice(2))}</blockquote>`
      return `<p class="text-text-muted mb-3 leading-relaxed">${parseInline(trimmed)}</p>`
    })
    .join('\n')
}
