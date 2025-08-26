import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import {
  DKConfig,
  DKProjectType,
  DK_CONFIG_LATEST_VERSION,
} from "../types/config"

const CONFIG_FILE = "dk.config.json"

export function getConfigPath(rootDir: string = process.cwd()): string {
  return join(rootDir, CONFIG_FILE)
}

export function configExists(rootDir: string = process.cwd()): boolean {
  return existsSync(getConfigPath(rootDir))
}

export function readConfig(rootDir: string = process.cwd()): DKConfig | null {
  if (!configExists(rootDir)) return null
  const raw = readFileSync(getConfigPath(rootDir), "utf8")
  return JSON.parse(raw)
}

export function getConfigVersion(config: DKConfig | null): number {
  if (!config || typeof config.version !== "number") return 0
  return config.version
}

export function isConfigOutdated(config: DKConfig | null): boolean {
  return getConfigVersion(config) < DK_CONFIG_LATEST_VERSION
}

export function writeConfig(
  config: Omit<DKConfig, "version"> & { version?: number },
  rootDir: string = process.cwd()
): void {
  const toWrite: DKConfig = {
    version: DK_CONFIG_LATEST_VERSION,
    ...config,
  }
  writeFileSync(
    getConfigPath(rootDir),
    JSON.stringify(toWrite, null, 2) + "\n",
    "utf8"
  )
}

// Heuristic project type detection
export function detectProjectType(
  rootDir: string = process.cwd()
): DKProjectType | null {
  // node-express: look for express in package.json deps
  // vite-react: look for vite and react in package.json deps
  // react-native-cli: look for react-native in package.json deps
  try {
    const pkgPath = join(rootDir, "package.json")
    if (!existsSync(pkgPath)) return null
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    if (deps["express"]) return "node-express"
    if (deps["vite"] && deps["react"]) return "vite-react"
    if (deps["react-native"]) return "react-native-cli"
  } catch {}
  return null
}
