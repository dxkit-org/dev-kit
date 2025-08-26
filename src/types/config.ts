export type DKProjectType = "node-express" | "vite-react" | "react-native-cli"

export interface DKConfig {
  version: number
  projectType: DKProjectType
}

export const DK_CONFIG_LATEST_VERSION = 1
