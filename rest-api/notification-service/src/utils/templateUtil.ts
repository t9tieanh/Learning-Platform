import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'

export async function renderTemplate(templateName: string, data: Record<string, unknown>) {
  const filePath = path.join(__dirname, '../templates', templateName)
  const content = await fs.readFile(filePath, 'utf-8')

  // Compile with Handlebars to support arrays/sections and conditionals
  const template = Handlebars.compile(content)
  return template(data)
}
