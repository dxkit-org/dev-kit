import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs"
import { join } from "path"
import {
  DKConfig,
  DKProjectType,
  DK_CONFIG_LATEST_VERSION,
  DatabaseConfig,
  DatabaseType,
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

// Database detection for node-express projects
export function detectDatabaseConfig(
  rootDir: string = process.cwd()
): DatabaseConfig | null {
  const databaseDir = join(rootDir, "database")

  if (!existsSync(databaseDir)) {
    return null
  }

  const config: DatabaseConfig = {}

  try {
    // Check for dumps directory
    const dumpsDir = join(databaseDir, "dumps")
    if (existsSync(dumpsDir)) {
      config.dumpsDir = "database/dumps"
    }

    // Check for migrations directory
    const migrationsDir = join(databaseDir, "migrations")
    if (existsSync(migrationsDir)) {
      config.migrationsDir = "database/migrations"
    }

    // Check for .env file and database URL
    const envPath = join(rootDir, ".env")
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, "utf8")
      const envConfig = parseEnvForDatabase(envContent)
      if (envConfig) {
        Object.assign(config, envConfig)
      }
    }

    return Object.keys(config).length > 0 ? config : null
  } catch (error) {
    return null
  }
}

// Parse .env file for database configuration
function parseEnvForDatabase(
  envContent: string
): Partial<DatabaseConfig> | null {
  const lines = envContent.split("\n")
  const config: Partial<DatabaseConfig> = {}

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith("#")) continue

    const [key, value] = trimmedLine.split("=", 2)
    if (!key || !value) continue

    // Look for database URL patterns
    if (key.includes("DATABASE_URL") && value.includes("://")) {
      config.dbUrlEnvName = key

      try {
        const url = new URL(value)
        const protocol = url.protocol.slice(0, -1) // Remove trailing ':'

        // Extract database type from protocol
        if (protocol === "mysql") {
          config.dbType = "mysql"
        } else if (protocol === "postgres" || protocol === "postgresql") {
          config.dbType = "postgres"
        } else if (protocol === "sqlite") {
          config.dbType = "sqlite"
        } else if (protocol === "mongodb" || protocol === "mongo") {
          config.dbType = "mongodb"
        }

        // Extract database name from pathname
        if (url.pathname && url.pathname.length > 1) {
          const dbName = url.pathname.split("/")[1]?.split("?")[0]
          if (dbName) {
            config.dbName = dbName
          }
        }
      } catch (error) {
        // If URL parsing fails, we'll ask the user later
      }
    }
  }

  return Object.keys(config).length > 0 ? config : null
}
