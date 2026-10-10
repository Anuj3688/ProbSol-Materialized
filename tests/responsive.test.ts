import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Mobile Responsive CSS Guardrails', () => {
  const cssPath = resolve(__dirname, '../src/App.css')
  const cssContent = readFileSync(cssPath, 'utf-8')

  it('contains mobile breakpoint queries for phones (<= 768px)', () => {
    expect(cssContent).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)/)
  })

  it('defines mobile bottom navigation (.mobile-bottom-nav) styles', () => {
    expect(cssContent).toContain('.mobile-bottom-nav')
    expect(cssContent).toContain('.mobile-nav-tab')
  })

  it('ensures app main container has safe padding bottom for mobile navigation bar', () => {
    expect(cssContent).toMatch(/calc\(80px\s*\+\s*env\(safe-area-inset-bottom\)\)/)
  })

  it('provides responsive card layout for small screens', () => {
    expect(cssContent).toContain('.timeline-item')
    expect(cssContent).toContain('@media (max-width: 768px)')
  })
})
