import inquirer from "inquirer"
import { ui } from "../utils/ui-helpers"
import { configExists, writeConfig, detectProjectType } from "../utils/config"
import type { DKProjectType } from "../types/config"

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
    writeConfig({ projectType })
    ui.success("Created dk.config.json", `Project type: ${projectType}`)
  } else {
    ui.error("No project type selected. dk.config.json not created.")
  }
}
