import { ui } from "../utils/ui-helpers.js"
import { readConfig } from "../utils/config.js"
import { promises as fs } from "fs"
import path from "path"
import { existsSync } from "fs"

const IMAGE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif",
])

function toCamel(str: string): string {
  return str
    .replace(/[_\s\-\.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (m) => m.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "")
}

function toValidIdentifier(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z0-9_]/g, "_")
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `_${cleaned}`
}

function ensureUnique(name: string, used: Set<string>): string {
  let n = name
  let i = 2
  while (used.has(n)) n = `${name}${i++}`
  used.add(n)
  return n
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase()
      if (IMAGE_EXTS.has(ext) && !(path.basename(full) === "index.ts")) {
        files.push(full)
      }
    }
  }
  return files
}

function setInTree(tree: any, pathParts: string[], leafValue: string): void {
  let node = tree
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i]
    if (!node[part]) node[part] = {}
    node = node[part]
  }
  node[pathParts[pathParts.length - 1]] = leafValue
}

function sortObjectKeysDeep(obj: any): any {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const sorted: any = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeysDeep(obj[key])
    }
    return sorted
  }
  return obj
}

function objectToTS(obj: any, indent = 0): string {
  const pad = "  ".repeat(indent)
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const entries = Object.entries(obj).map(([k, v]) => {
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k)
      return `${"  ".repeat(indent + 1)}${key}: ${objectToTS(v, indent + 1)}`
    })
    return `{\n${entries.join(",\n")}\n${pad}}`
  }
  // leaf is a variable name string
  return obj
}

export const generateImageIndex = async (): Promise<void> => {
  const config = readConfig()

  if (!config) {
    ui.error("Configuration not found", "Please run 'dk init' first")
    process.exit(1)
  }

  // Check if project type supports assets generation
  const supportedTypes = ["vite-react", "react-native-cli", "nextjs"]
  if (!supportedTypes.includes(config.projectType)) {
    ui.error(
      "Unsupported project type",
      `Assets generation is only supported for: ${supportedTypes.join(", ")}`
    )
    process.exit(1)
  }

  // Check if assetsTypeGenerator is configured
  if (!config.assetsTypeGenerator?.imagesDir) {
    ui.warning(
      "Images directory not configured",
      "Please configure 'assetsTypeGenerator.imagesDir' in dk.config.json"
    )
    return
  }

  const imagesDir = path.resolve(config.assetsTypeGenerator.imagesDir)

  if (!existsSync(imagesDir)) {
    ui.error(
      "Images directory not found",
      `Directory ${imagesDir} does not exist`
    )
    process.exit(1)
  }

  ui.section("🎨 Assets Generation", "Generating image index file")

  const spinner = ui.createSpinner("Scanning for images...")
  spinner.start()

  try {
    const allFiles = await walk(imagesDir)

    if (allFiles.length === 0) {
      spinner.stop()
      ui.info("No images found in the specified directory")
      return
    }

    spinner.text = "Processing images..."

    const usedVarNames = new Set<string>()
    const imports: string[] = []
    const tree: any = {}

    for (const abs of allFiles) {
      const relFromImages = path.posix.normalize(
        path.relative(imagesDir, abs).split(path.sep).join(path.posix.sep)
      )

      const dirParts =
        path.posix.dirname(relFromImages) === "."
          ? []
          : path.posix.dirname(relFromImages).split("/")

      const baseNoExt = path.basename(
        relFromImages,
        path.extname(relFromImages)
      )
      const fileKey = toCamel(baseNoExt)
      const dirKeys = dirParts.map(toCamel)

      // Variable name: dir parts + file name joined to avoid collisions
      const varBase = toValidIdentifier(
        [...dirParts, baseNoExt].map(toCamel).filter(Boolean).join("_") ||
          toCamel(baseNoExt)
      )
      const varName = ensureUnique(varBase || "img", usedVarNames)

      // Import path should be relative from index.ts
      const importPath = `./${relFromImages}`
      imports.push(`import ${varName} from ${JSON.stringify(importPath)};`)

      // Place into tree
      const keysPath = [...dirKeys, fileKey || "image"]
      setInTree(tree, keysPath, varName)
    }

    // Stable ordering
    const sortedTree = sortObjectKeysDeep(tree)

    const outputFile = path.join(imagesDir, "index.ts")

    spinner.text = "Generating index file..."

    const header = `/* AUTO-GENERATED FILE. DO NOT EDIT.
   * Run: dk assets gen
   */
`
    const body =
      `${imports.sort().join("\n")}\n\n` +
      `export const ImageAssets = ${objectToTS(sortedTree)} as const;\n`

    await fs.writeFile(outputFile, header + body, "utf8")

    spinner.stop()

    ui.success(
      "Image index generated successfully!",
      `Generated ${path.relative(process.cwd(), outputFile)} with ${allFiles.length} images`
    )

    // Show summary
    ui.table([
      { key: "Images processed", value: allFiles.length.toString() },
      { key: "Output file", value: path.relative(process.cwd(), outputFile) },
      {
        key: "Images directory",
        value: path.relative(process.cwd(), imagesDir),
      },
    ])
  } catch (error) {
    spinner.fail("Failed to generate image index")
    ui.error(
      "Error generating image index",
      error instanceof Error ? error.message : "Unknown error"
    )
    process.exit(1)
  }
}

export const assets = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const subcommand = args[args.indexOf("assets") + 1]

  if (subcommand === "gen" || subcommand === "generate") {
    await generateImageIndex()
  } else {
    ui.error(
      "Invalid subcommand",
      "Available commands: 'dk assets gen' or 'dk assets generate'"
    )
    process.exit(1)
  }
}
