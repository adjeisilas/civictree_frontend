import ExcelJS from 'exceljs'

/**
 * Reads a .csv or .xlsx file the admin picked into rows of plain cell values.
 *
 * Replaces the 'xlsx' package, which has unfixed security advisories. The old .xls
 * format is not supported — the backend rejects it too.
 */
export const readSpreadsheetRows = async (file: File): Promise<string[][]> => {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv')) {
    return parseCsv(await file.text())
  }

  if (name.endsWith('.xls')) {
    throw new Error('The old .xls format is not supported. Please save the file as .xlsx or .csv and try again.')
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const worksheet = workbook.worksheets[0]
  if (!worksheet) return []

  const rows: string[][] = []
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    // row.values is 1-based; index 0 is always empty
    const values = (row.values as unknown[]).slice(1).map(cellToString)
    rows.push(values)
  })

  return rows
}

const cellToString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    const cell = value as { text?: string; result?: unknown; richText?: { text: string }[] }
    if (cell.text !== undefined) return String(cell.text)
    if (cell.result !== undefined) return String(cell.result ?? '')
    if (cell.richText) return cell.richText.map((part) => part.text).join('')
  }
  return String(value)
}

/**
 * Minimal CSV parser: handles quoted fields, escaped quotes, and both line ending styles.
 */
export const parseCsv = (text: string): string[][] => {
  const content = text.replace(/^\uFEFF/, '') // strip byte order mark
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field.trim())
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field.trim())
      if (row.some((cell) => cell !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  row.push(field.trim())
  if (row.some((cell) => cell !== '')) rows.push(row)

  return rows
}
