import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import boxen from 'boxen';
import gradientString from 'gradient-string';
import figlet from 'figlet';
import ora from 'ora';
import { clean } from '../src/commands/clean.js';
import { deployDev, deployProd } from '../src/commands/deploy.js';
import { doctor } from '../src/commands/doctor.js';
import { buildAndroidRelease, buildAndroidDebug } from '../src/commands/reactnative.js';
import { ui } from '../src/utils/ui-helpers.js';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Beautiful animated welcome banner
async function showWelcomeBanner() {
  console.clear();
  
  // More compact ASCII Art Title
  const title = figlet.textSync('ADK', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    width: 50
  });
  
  // Show title with rainbow gradient
  console.log(gradientString.rainbow(title));
  
  // Compact welcome box with better styling
  const welcomeMessage = boxen(
    gradientString('cyan', 'blue')('🚀 Advanced Dev Kit') + 
    chalk.gray(' v' + version) + '\n' +
    chalk.cyan('━'.repeat(20)) + '\n' +
    chalk.white('Fast • Beautiful • Modern ⚡'),
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a1e'
    }
  );
  
  console.log(welcomeMessage);
}

// Enhanced command wrapper with loading animation
function createEnhancedCommand(name: string, description: string, action: Function) {
  return {
    name,
    description: chalk.gray(description),
    async execute(...args: any[]) {
      const spinner = ora({
        text: chalk.cyan(`Executing ${name}...`),
        spinner: 'dots12',
        color: 'cyan'
      }).start();
      
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay for UX
        spinner.stop();
        console.log(chalk.green('✓'), chalk.bold(`${name} ready`));
        await action(...args);
      } catch (error: any) {
        spinner.stop();
        
        // Handle user cancellation gracefully
        if (error.name === 'ExitPromptError' || error.message?.includes('SIGINT')) {
          console.log('\n');
          console.log(boxen(
            chalk.yellow('⚠️ ') + chalk.white(`${name} cancelled by user`),
            {
              padding: { top: 0, bottom: 0, left: 1, right: 1 },
              borderStyle: 'round',
              borderColor: 'yellow',
              backgroundColor: '#1a1a00'
            }
          ));
          return;
        }
        
        // Handle other errors
        spinner.fail(chalk.red(`Failed to execute ${name}`));
        console.error(chalk.red('Error:'), error);
        process.exit(1);
      }
    }
  };
}

// Enhanced error handling and beautiful exit
process.on('SIGINT', () => {
  // Only handle SIGINT if we're not in the middle of a prompt
  if (!process.stdin.isTTY || process.stdin.readableEnded) {
    console.log('\n');
    console.log(gradientString('yellow', 'orange')('👋 Thanks for using ADK! See you soon! ✨'));
    process.exit(0);
  }
});

process.on('uncaughtException', (error) => {
  console.log('\n');
  console.log(boxen(
    chalk.red('💥 Error: ') + chalk.white(error.message),
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#1a0000'
    }
  ));
  process.exit(1);
});

// Main execution function
async function main() {
  // Show banner only at the start
  await showWelcomeBanner();
  
  const program = new Command();

    program
    .name(chalk.bold.cyan('adk'))
    .description(chalk.gray('Modern CLI toolkit with style'))
    .version(version, '-v, --version', chalk.gray('Show version'))
    .helpOption('-h, --help', chalk.gray('Show help'))
    .configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => chalk.cyan('  ' + cmd.name()),
      commandUsage: (cmd) => chalk.yellow(cmd.name()) + chalk.gray(' [options]'),
      commandDescription: (cmd) => '  ' + chalk.gray(cmd.description()),
      optionTerm: (option) => chalk.green('  ' + option.flags),
      optionDescription: (option) => '  ' + chalk.gray(option.description)
    });



  program
    .command('clean')
    .alias('c')
    .description(chalk.gray('🧹 Clean temporary files'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('clean', 'Cleaning project', clean);
      await cmd.execute(...args);
    });

  program
    .command('doctor')
    .alias('dr')
    .description(chalk.gray('🩺 System health check'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('doctor', 'Running diagnostics', doctor);
      await cmd.execute(...args);
    });

  // Enhanced Deploy command with beautiful UI
  const deployCommand = program
    .command('deploy')
    .alias('d')
    .description(chalk.gray('🚀 Deploy with confidence'))
    .action(async () => {
      try {
        console.log(boxen(
          gradientString('magenta', 'cyan')('🚀 Deployment Center') + '\n' +
          chalk.gray('Choose your destination'),
          {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: { top: 1, bottom: 1, left: 0, right: 0 },
            borderStyle: 'round',
            borderColor: 'magenta',
            backgroundColor: '#0a0a1a'
          }
        ));

        const { environment } = await inquirer.prompt({
          type: 'list',
          name: 'environment',
          message: chalk.bold('🎯 Select environment:'),
          choices: [
            { 
              name: chalk.green('🔧 Development') + chalk.gray(' (quick deploy)'), 
              value: 'dev',
              short: 'Development'
            },
            { 
              name: chalk.red('🏭 Production') + chalk.gray(' (full pipeline)'), 
              value: 'prod',
              short: 'Production'
            }
          ],
          default: 'dev'
        });

        const spinner = ora({
          text: chalk.cyan(`Preparing ${environment} deployment...`),
          spinner: 'dots12',
          color: 'cyan'
        }).start();

        await new Promise(resolve => setTimeout(resolve, 800));
        spinner.stop();

        if (environment === 'dev') {
          console.log(chalk.green('✓'), chalk.bold('Deploying to Development'));
          await deployDev();
        } else {
          console.log(chalk.red('✓'), chalk.bold('Deploying to Production'));
          await deployProd();
        }
      } catch (error: any) {
        // Handle user cancellation gracefully
        if (error.name === 'ExitPromptError' || error.message?.includes('SIGINT')) {
          console.log('\n');
          console.log(boxen(
            chalk.yellow('⚠️ ') + chalk.white('Deployment cancelled by user'),
            {
              padding: { top: 0, bottom: 0, left: 1, right: 1 },
              borderStyle: 'round',
              borderColor: 'yellow',
              backgroundColor: '#1a1a00'
            }
          ));
          return;
        }
        // Re-throw other errors
        throw error;
      }
    });

  deployCommand
    .command('dev')
    .description(chalk.gray('🔧 Quick development deploy'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('deploy dev', 'Deploying to dev', deployDev);
      await cmd.execute(...args);
    });

  deployCommand
    .command('prod')
    .description(chalk.gray('🏭 Production deployment'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('deploy prod', 'Deploying to prod', deployProd);
      await cmd.execute(...args);
    });

  // React Native commands
  const rnCommand = program
    .command('rn')
    .alias('react-native')
    .description(chalk.gray('📱 React Native tools'));

  rnCommand
    .command('build')
    .description(chalk.gray('🔨 Build React Native app'))
    .action(async () => {
      try {
        console.log(boxen(
          gradientString('green', 'blue')('📱 React Native Build Center') + '\n' +
          chalk.gray('Choose your build target'),
          {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: { top: 1, bottom: 1, left: 0, right: 0 },
            borderStyle: 'round',
            borderColor: 'green',
            backgroundColor: '#0a1a0a'
          }
        ));

        const { buildType } = await inquirer.prompt({
          type: 'list',
          name: 'buildType',
          message: chalk.bold('🎯 Select build type:'),
          choices: [
            { 
              name: chalk.green('🤖 Android Release') + chalk.gray(' (with clean)'), 
              value: 'android-release',
              short: 'Android Release'
            },
            { 
              name: chalk.green('🤖 Android Release') + chalk.gray(' (skip clean)'), 
              value: 'android-release-no-clean',
              short: 'Android Release (No Clean)'
            },
            { 
              name: chalk.yellow('🔧 Android Debug') + chalk.gray(' (with clean)'), 
              value: 'android-debug',
              short: 'Android Debug'
            },
            { 
              name: chalk.yellow('🔧 Android Debug') + chalk.gray(' (skip clean)'), 
              value: 'android-debug-no-clean',
              short: 'Android Debug (No Clean)'
            },
            { 
              name: chalk.gray('🍎 iOS Release') + chalk.gray(' (coming soon)'), 
              value: 'ios-release',
              disabled: 'Coming soon'
            }
          ],
          default: 'android-release'
        });

        if (buildType === 'android-release') {
          await buildAndroidRelease();
        } else if (buildType === 'android-release-no-clean') {
          await buildAndroidRelease(true);
        } else if (buildType === 'android-debug') {
          await buildAndroidDebug();
        } else if (buildType === 'android-debug-no-clean') {
          await buildAndroidDebug(true);
        }
      } catch (error: any) {
        // Handle user cancellation gracefully
        if (error.name === 'ExitPromptError' || error.message?.includes('SIGINT')) {
          console.log('\n');
          console.log(boxen(
            chalk.yellow('⚠️ ') + chalk.white('Build cancelled by user'),
            {
              padding: { top: 0, bottom: 0, left: 1, right: 1 },
              borderStyle: 'round',
              borderColor: 'yellow',
              backgroundColor: '#1a1a00'
            }
          ));
          return;
        }
        // Re-throw other errors
        throw error;
      }
    });

  rnCommand
    .command('build release')
    .alias('br')
    .description(chalk.gray('🚀 Quick Android release build'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('React Native build release', 'Building Android release', buildAndroidRelease);
      await cmd.execute(...args);
    });

  rnCommand
    .command('build release --no-clean')
    .alias('brnc')
    .description(chalk.gray('🚀 Android release build (skip clean)'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('React Native build release (no clean)', 'Building Android release without clean', () => buildAndroidRelease(true));
      await cmd.execute(...args);
    });

  rnCommand
    .command('build debug')
    .alias('bd')
    .description(chalk.gray('🔧 Android debug build'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('React Native build debug', 'Building Android debug', buildAndroidDebug);
      await cmd.execute(...args);
    });

  rnCommand
    .command('build debug --no-clean')
    .alias('bdnc')
    .description(chalk.gray('🔧 Android debug build (skip clean)'))
    .action(async (...args) => {
      const cmd = createEnhancedCommand('React Native build debug (no clean)', 'Building Android debug without clean', () => buildAndroidDebug(true));
      await cmd.execute(...args);
    });

  // Add help enhancement
  program.on('--help', () => {
    console.log('\n');
    console.log(boxen(
      gradientString('blue', 'cyan')('💡 Pro Tips') + '\n' +
      chalk.gray('• Quick: ') + chalk.cyan('adk c') + chalk.gray(', ') + chalk.cyan('adk dr') + '\n' +
      chalk.gray('• Deploy: ') + chalk.cyan('adk d dev') + '\n' +
      chalk.gray('• RN Release: ') + chalk.cyan('adk rn br') + '\n' +
      chalk.gray('• RN Debug: ') + chalk.cyan('adk rn bd') + '\n' +
      chalk.gray('• No Clean: ') + chalk.cyan('adk rn brnc') + '\n' +
      chalk.gray('• Help: ') + chalk.cyan('adk --help'),
      {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: 'round',
        borderColor: 'blue',
        backgroundColor: '#0a0a1a'
      }
    ));
  });

  program.parse(process.argv);

  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    console.log(boxen(
      chalk.blue('ℹ️ ') + chalk.white('Run ') + chalk.cyan('adk --help') + chalk.white(' for commands'),
      {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'blue',
        backgroundColor: '#0a0a1a'
      }
    ));
  }
}

// Run the main function
main().catch(console.error);
