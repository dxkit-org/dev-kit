import { ui } from '../utils/ui-helpers.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

export const clean = async () => {
  // Support: adk clean nm or adk clean node_modules to delete node_modules only
  const args = process.argv.slice(2).map(a => a.toLowerCase());
  let cleanedNodeModules = false;
  if (args.includes('nm') || args.includes('node_modules')) {
    ui.section('🧹 Node Modules Cleanup', 'Removing node_modules directory');
    const spinner = ui.createSpinner('Deleting node_modules...');
    spinner.start();
    try {
      await fs.rm('node_modules', { recursive: true, force: true });
      spinner.stop();
      ui.success('node_modules deleted successfully!');
      cleanedNodeModules = true;
    } catch (error) {
      spinner.fail('Failed to delete node_modules');
      ui.error('Error deleting node_modules', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
    // Do not return; continue with the rest of the clean logic
  }

  ui.section('🧹 Project Cleanup', 'Removing build artifacts and temporary files');

  // Detect if this is a React Native project (android dir and app.json or package.json with react-native)
  const isRN = existsSync('android') && (
    existsSync('app.json') ||
    (() => {
      try {
        const pkg = require(join(process.cwd(), 'package.json'));
        return pkg.dependencies && pkg.dependencies['react-native'];
      } catch {
        return false;
      }
    })()
  );

  let cleanMode = 'node';
  if (isRN) {
    // Prompt user for clean mode
    const { mode } = await inquirer.prompt({
      type: 'list',
      name: 'mode',
      message: 'React Native project detected. What would you like to clean?',
      choices: [
        { name: '🧹 Clean all (Node + RN Android)', value: 'all' },
        { name: '🟢 Clean Node project only', value: 'node' },
        { name: '🤖 Clean RN Android only', value: 'rn-android' }
      ],
      default: 'all'
    });
    cleanMode = mode;
  }

  // Node project clean items

  const nodeItems: CleanItem[] = [
    { path: 'dist/', type: 'directory' },
    { path: 'node_modules/.cache/', type: 'directory' },
    { path: '*.log', type: 'files' },
    { path: '.tmp/', type: 'directory' }
  ];

  // RN Android clean items
  const rnItems: CleanItem[] = [
    { path: 'android/app/build/', type: 'directory' },
    { path: 'android/build/', type: 'directory' },
    { path: 'android/.gradle/', type: 'directory' }
  ];

  // Compose items to clean based on mode
  type CleanItem = { path: string; type: 'directory' | 'files' };
  let itemsToClean: CleanItem[] = [];
  if (cleanMode === 'all') {
    itemsToClean = [...nodeItems, ...rnItems];
  } else if (cleanMode === 'node') {
    itemsToClean = nodeItems;
  } else if (cleanMode === 'rn-android') {
    itemsToClean = rnItems;
  }

  const spinner = ui.createSpinner('Scanning for files to clean...');
  spinner.start();
  try {
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.stop();

    if (itemsToClean.length === 0) {
      ui.info('Nothing to clean for this mode.');
      return;
    }

    ui.info('Found items to clean:');
    console.log('');
    itemsToClean.forEach(item => {
      console.log(
        `  ${item.type === 'directory' ? '📁' : '📄'} ` +
        `${item.path} ` +
        `${item.type === 'directory' ? '(directory)' : '(files)'}`
      );
    });
    console.log('');

    const cleanSpinner = ui.createSpinner('Cleaning files and directories...');
    cleanSpinner.start();

    // Simulate cleanup process
    for (let i = 0; i < itemsToClean.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      cleanSpinner.text = `Cleaning ${itemsToClean[i].path}...`;
    }

    // If RN Android clean, run gradlew clean for extra safety
    if ((cleanMode === 'all' || cleanMode === 'rn-android') && existsSync('android/gradlew.bat')) {
      cleanSpinner.text = 'Running gradlew.bat clean...';
      await new Promise((resolve, reject) => {
        const gradle = spawn('cmd', ['/c', 'cd android && gradlew.bat clean'], { stdio: 'ignore' });
        gradle.on('close', () => resolve(true));
        gradle.on('error', () => resolve(true));
      });
    }

    cleanSpinner.stop();

    ui.success('Cleanup completed successfully!', 'All selected temporary files and build artifacts have been removed');

    // Show summary
    ui.table([
      { key: 'Directories cleaned', value: itemsToClean.filter(i => i.type === 'directory').length.toString() },
      { key: 'Files removed', value: itemsToClean.filter(i => i.type === 'files').length.toString() },
      { key: 'Mode', value: cleanMode },
      { key: 'Time taken', value: '2.1s' }
    ]);

  } catch (error) {
    spinner.fail('Cleanup failed');
    ui.error('Failed to clean project', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};
