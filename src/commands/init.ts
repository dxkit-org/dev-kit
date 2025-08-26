import inquirer from "inquirer"
import { ui } from "../utils/ui-helpers"
import {
  configExists,
  writeConfig,
  detectProjectType,
  detectDatabaseConfig,
} from "../utils/config"
import type {
  DKProjectType,
  DatabaseConfig,
  DatabaseType,
} from "../types/config"

const PROJECT_TYPES: { name: string; value: DKProjectType }[] = [
  { name: "Node.js (Express)", value: "node-express" },
  { name: "Vite + React", value: "vite-react" },
  { name: "React Native CLI", value: "react-native-cli" },
]

export async function init() {
  if (configExists()) {
    ui.info("dk.config.json already exists.", "No changes made.")
    return
  }

  let detected = detectProjectType()
  let projectType: DKProjectType | undefined = detected || undefined

  if (!projectType) {
    ui.warning("Unable to auto-detect project type.")
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "Select your project type:",
      choices: PROJECT_TYPES,
    })
    projectType = type as DKProjectType
  } else {
    ui.success(`Detected project type: ${projectType}`)
  }

  if (projectType) {
    let databaseConfig: DatabaseConfig | undefined

    // If it's a node-express project, detect database configuration
    if (projectType === "node-express") {
      databaseConfig = await detectAndConfigureDatabase()
    }

    const config = {
      projectType,
      ...(databaseConfig && { database: databaseConfig }),
    }
    writeConfig(config)

    ui.success("Created dk.config.json", `Project type: ${projectType}`)
    if (databaseConfig) {
      ui.info("Database configuration detected and added to config.")
    }
  } else {
    ui.error("No project type selected. dk.config.json not created.")
  }
}

async function detectAndConfigureDatabase(): Promise<
  DatabaseConfig | undefined
> {
  const detectedConfig = detectDatabaseConfig()

  if (!detectedConfig) {
    return undefined
  }

  let config = { ...detectedConfig }

  // If database type couldn't be detected from env, ask user
  if (config.dbUrlEnvName && !config.dbType) {
    ui.warning("Found database URL but couldn't determine database type.")

    const { dbType } = await inquirer.prompt({
      type: "list",
      name: "dbType",
      message: "What type of database are you using?",
      choices: [
        { name: "MySQL", value: "mysql" },
        { name: "PostgreSQL", value: "postgres" },
        { name: "SQLite", value: "sqlite" },
        { name: "MongoDB", value: "mongodb" },
      ],
    })

    config.dbType = dbType as DatabaseType
  }

  // If database name couldn't be extracted, ask user
  if (config.dbUrlEnvName && !config.dbName) {
    const { dbName } = await inquirer.prompt({
      type: "input",
      name: "dbName",
      message: "What is your database name?",
      validate: (input: string) =>
        input.trim().length > 0 || "Database name cannot be empty",
    })

    config.dbName = dbName.trim()
  }

  return config
}
