import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'

export const EMAIL_GRADIENTS = {
  brand: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 55%, #047857 100%)',
  vip: 'linear-gradient(135deg, #f59e0b 0%, #d97706 55%, #b45309 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)'
} as const

Handlebars.registerHelper('formatCurrency', function (value: unknown) {
  let num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('vi-VN')
})

let partialsRegistered = false

async function registerPartials(): Promise<void> {
  if (partialsRegistered) return

  const partialsDir = path.join(__dirname, '../templates/partials')
  const files = await fs.readdir(partialsDir)

  await Promise.all(
    files
      .filter((file) => file.endsWith('.html'))
      .map(async (file) => {
        const name = file.replace(/\.html$/, '')
        const content = await fs.readFile(path.join(partialsDir, file), 'utf-8')
        Handlebars.registerPartial(name, content)
      })
  )

  partialsRegistered = true
}

export async function renderTemplate(templateName: string, data: Record<string, unknown>) {
  await registerPartials()

  const filePath = path.join(__dirname, '../templates', templateName)
  const content = await fs.readFile(filePath, 'utf-8')
  const template = Handlebars.compile(content)
  return template(data)
}
