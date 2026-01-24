import fs from 'fs/promises'
import path from 'path'

export async function renderTemplate(templateName: string, data: Record<string, any>) {
  const filePath = path.join(__dirname, '../templates', templateName)
  let content = await fs.readFile(filePath, 'utf-8')

  // Xử lý {{#each items}} loop
  const eachRegex = /{{#each\s+(\w+)}}(.*?){{\/each}}/gs
  content = content.replace(eachRegex, (match, arrayName, template) => {
    const array = data[arrayName]
    if (!Array.isArray(array)) return ''
    
    return array.map(item => {
      let itemTemplate = template
      // Thay thế các placeholder trong từng item
      for (const key in item) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        itemTemplate = itemTemplate.replace(placeholder, String(item[key]))
      }
      return itemTemplate
    }).join('')
  })

  // Thay thế {{placeholder}} thông thường
  for (const key in data) {
    if (typeof data[key] === 'string' || typeof data[key] === 'number') {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      content = content.replace(placeholder, String(data[key]))
    }
  }

  return content
}
