const fs = require('fs')
const path = require('path')

const hooksDir = path.join(__dirname, 'src', 'hooks')
const srcDir = path.join(__dirname, 'src')

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const folders = fs.readdirSync(hooksDir).filter(f => fs.statSync(path.join(hooksDir, f)).isDirectory())

const mappings = {} // Map old path -> new path and exported members

folders.forEach(folder => {
  const folderPath = path.join(hooksDir, folder)
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.ts'))
  
  if (files.length === 0) return

  const outFileName = `use${capitalize(folder)}.ts`
  const outFilePath = path.join(hooksDir, outFileName)
  
  let allImports = []
  let allCode = []
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(folderPath, file), 'utf-8')
    const lines = content.split('\n')
    
    let isImport = true
    let fileCode = []
    
    lines.forEach(line => {
      if (line.startsWith('import ')) {
        // Adjust relative imports: we are moving one level up, so '../' becomes './'
        let importLine = line.replace(/from\s+['"]\.\.\//g, "from '")
        // If it was '../../lib/apiClient', it's now '../lib/apiClient'
        // Wait, the old path was src/hooks/auth/useLogin.ts -> imports `../../lib/apiClient`
        // New path is src/hooks/useAuth.ts -> imports `../lib/apiClient`
        importLine = importLine.replace(/from\s+['"](\.\.\/\.\.\/)/g, "from '../")
        allImports.push(importLine)
      } else {
        if (line.trim() !== '' || fileCode.length > 0) {
          fileCode.push(line)
        }
      }
    })
    
    allCode.push(fileCode.join('\n'))
  })
  
  // Deduplicate imports
  const uniqueImports = new Map()
  allImports.forEach(imp => {
    const match = imp.match(/import\s+(.*?)\s+from\s+(['"].*?['"])/)
    if (match) {
      const [, members, source] = match
      if (!uniqueImports.has(source)) {
        uniqueImports.set(source, new Set())
      }
      
      // members can be `{ a, b }` or `A` or `type X`
      const cleanedMembers = members.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean)
      cleanedMembers.forEach(m => uniqueImports.get(source).add(m))
    } else {
      // Just keep as is if we can't parse
    }
  })
  
  let finalImports = []
  for (const [source, membersSet] of uniqueImports.entries()) {
    const members = Array.from(membersSet)
    const types = members.filter(m => m.startsWith('type '))
    const values = members.filter(m => !m.startsWith('type '))
    
    if (types.length > 0 && values.length === 0) {
      finalImports.push(`import type { ${types.map(t => t.replace('type ', '')).join(', ')} } from ${source}`)
    } else if (values.length > 0) {
      let importStr = `import { `
      let inner = []
      members.forEach(m => {
        inner.push(m)
      })
      importStr += inner.join(', ') + ` } from ${source}`
      finalImports.push(importStr)
    }
  }
  
  const finalContent = finalImports.join('\n') + '\n\n' + allCode.join('\n\n')
  fs.writeFileSync(outFilePath, finalContent)
  console.log(`Created ${outFileName}`)
  
  // Delete folder
  files.forEach(file => fs.unlinkSync(path.join(folderPath, file)))
  fs.rmdirSync(folderPath)
})

// Update references in all .tsx files
function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file)
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, callback)
    } else {
      callback(filepath)
    }
  })
}

walkSync(srcDir, (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf-8')
    let changed = false
    
    // Replace imports
    // e.g., import { useLogin } from '../../hooks/auth/useLogin'
    // to import { useLogin } from '../../hooks/useAuth'
    
    folders.forEach(folder => {
      const regex = new RegExp(`from\\s+['"](.*?)hooks/${folder}/.*?['"]`, 'g')
      if (regex.test(content)) {
        content = content.replace(regex, `from '$1hooks/use${capitalize(folder)}'`)
        changed = true
      }
    })
    
    // Check if we have multiple imports from the same new path that we can consolidate
    if (changed) {
      const lines = content.split('\n')
      const groupedImports = {}
      const nonImportLines = []
      
      lines.forEach(line => {
        if (line.startsWith('import ') && line.includes('hooks/use')) {
          const match = line.match(/import\s+\{(.*?)\}\s+from\s+(['"].*?['"])/)
          if (match) {
            const [, members, source] = match
            if (!groupedImports[source]) groupedImports[source] = new Set()
            members.split(',').forEach(m => groupedImports[source].add(m.trim()))
          } else {
            nonImportLines.push(line)
          }
        } else {
          nonImportLines.push(line)
        }
      })
      
      let finalContentLines = []
      let importsAdded = false
      
      lines.forEach(line => {
        if (line.startsWith('import ') && line.includes('hooks/use')) {
          if (!importsAdded) {
            for (const [source, membersSet] of Object.entries(groupedImports)) {
              const members = Array.from(membersSet).filter(Boolean)
              if (members.length > 0) {
                 finalContentLines.push(`import { ${members.join(', ')} } from ${source}`)
              }
            }
            importsAdded = true
          }
        } else if (line.startsWith('import ')) {
          finalContentLines.push(line)
        }
      })
      
      const restOfLines = lines.filter(line => !line.startsWith('import '))
      
      const combined = finalContentLines.join('\n') + '\n' + restOfLines.join('\n')
      fs.writeFileSync(filepath, combined)
      console.log(`Updated ${filepath}`)
    }
  }
})
