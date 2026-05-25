import type { ColorEntry } from '../stores/palette'

export type ExportFormat = 'css' | 'tailwind' | 'json' | 'scss' | 'figma'

function toVarName(c: ColorEntry): string {
  const role = c.roles.length > 0 ? c.roles[0] : 'color'
  const name = c.name ? c.name.toLowerCase().replace(/\s+/g, '-') : role
  return name
}

export function exportCSS(colors: ColorEntry[]): string {
  const vars = colors.map(c => `  --${toVarName(c)}: ${c.hex.toLowerCase()};`).join('\n')
  return `:root {\n${vars}\n}`
}

export function exportSCSS(colors: ColorEntry[]): string {
  return colors.map(c => `$${toVarName(c)}: ${c.hex.toLowerCase()};`).join('\n')
}

export function exportJSON(colors: ColorEntry[]): string {
  const tokens: Record<string, { value: string; role: string[]; name: string }> = {}
  colors.forEach(c => {
    tokens[toVarName(c)] = {
      value: c.hex.toLowerCase(),
      role: c.roles,
      name: c.name || toVarName(c),
    }
  })
  return JSON.stringify(tokens, null, 2)
}

export function exportTailwind(colors: ColorEntry[]): string {
  const entries = colors.map(c => {
    const key = toVarName(c).replace(/-/g, '_')
    return `      '${key}': '${c.hex.toLowerCase()}',`
  }).join('\n')

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      },
    },
  },
}`
}

export function exportFigma(colors: ColorEntry[]): string {
  const tokens = colors.map(c => ({
    name: c.name || toVarName(c),
    value: c.hex.toLowerCase(),
    type: 'color',
    description: c.roles.length > 0 ? `Semantic roles: ${c.roles.join(', ')}` : '',
  }))

  return JSON.stringify({
    version: '1.0',
    metadata: { generator: 'ChromaForge', date: new Date().toISOString() },
    tokens,
  }, null, 2)
}

export function useExport() {
  function generate(colors: ColorEntry[], format: ExportFormat): string {
    switch (format) {
      case 'css': return exportCSS(colors)
      case 'scss': return exportSCSS(colors)
      case 'json': return exportJSON(colors)
      case 'tailwind': return exportTailwind(colors)
      case 'figma': return exportFigma(colors)
      default: return ''
    }
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
  }

  const formatExtensions: Record<ExportFormat, string> = {
    css: 'variables.css',
    scss: 'tokens.scss',
    json: 'tokens.json',
    tailwind: 'tailwind.config.js',
    figma: 'figma-tokens.json',
  }

  return { generate, download, copyToClipboard, formatExtensions }
}
