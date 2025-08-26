export type DKProjectType = "node-express" | "vite-react" | "react-native-cli"

export type DatabaseType = "mysql" | "postgres" | "sqlite" | "mongodb"

export interface DatabaseConfig {
  dumpsDir?: string
  migrationsDir?: string
  dbUrlEnvName?: string
  dbName?: string
  dbType?: DatabaseType
}

export interface DKConfig {
  version: number
  projectType: DKProjectType
  database?: DatabaseConfig
}

export const DK_CONFIG_LATEST_VERSION = 1
