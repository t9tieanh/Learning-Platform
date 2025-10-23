import fs from 'fs/promises'
import path from 'path'

export async function renderTemplate(templateName: string, data: Record<string, string>) {
  const filePath = path.join(__dirname, '../templates', templateName)
  let content = await fs.readFile(filePath, 'utf-8')

  // Thay thế {{placeholder}} trong file HTML
  for (const key in data) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    content = content.replace(placeholder, data[key])
  }

  return content
}
