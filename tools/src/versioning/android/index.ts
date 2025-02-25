import spawnAsync from '@expo/spawn-async';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'glob-promise';
import minimatch from 'minimatch';
import path from 'path';
import semver from 'semver';

import * as Directories from '../../Directories';
import { getListOfPackagesAsync } from '../../Packages';
import { copyFileWithTransformsAsync } from '../../Transforms';
import { searchFilesAsync } from '../../Utils';
import { copyExpoviewAsync } from './copyExpoview';
import { expoModulesTransforms } from './expoModulesTransforms';
import { packagesToKeep } from './packagesConfig';
import { deleteLinesBetweenTags } from './utils';
import { versionCxxExpoModulesAsync } from './versionCxx';
import { updateVersionedReactNativeAsync } from './versionReactNative';
import { removeVersionedVendoredModulesAsync } from './versionVendoredModules';

export { versionVendoredModulesAsync } from './versionVendoredModules';

const EXPO_DIR = Directories.getExpoRepositoryRootDir();
const ANDROID_DIR = Directories.getAndroidDir();
const EXPOTOOLS_DIR = Directories.getExpotoolsDir();
const SCRIPT_DIR = path.join(EXPOTOOLS_DIR, 'src/versioning/android');
const SED_PREFIX = process.platform === 'darwin' ? "sed -i ''" : 'sed -i';

const appPath = path.join(ANDROID_DIR, 'app');
const expoviewPath = path.join(ANDROID_DIR, 'expoview');
const versionedAbisPath = path.join(ANDROID_DIR, 'versioned-abis');
const versionedExpoviewAbiPath = (abiName) => path.join(versionedAbisPath, `expoview-${abiName}`);
const expoviewBuildGradlePath = path.join(expoviewPath, 'build.gradle');
const appManifestPath = path.join(appPath, 'src', 'main', 'AndroidManifest.xml');
const templateManifestPath = path.join(
  EXPO_DIR,
  'template-files',
  'android',
  'AndroidManifest.xml'
);
const settingsGradlePath = path.join(ANDROID_DIR, 'settings.gradle');
const appBuildGradlePath = path.join(appPath, 'build.gradle');
const buildGradlePath = path.join(ANDROID_DIR, 'build.gradle');
const sdkVersionsPath = path.join(ANDROID_DIR, 'sdkVersions.json');
const rnActivityPath = path.join(
  expoviewPath,
  'src/versioned/java/host/exp/exponent/experience/MultipleVersionReactNativeActivity.java'
);
const expoviewConstantsPath = path.join(
  expoviewPath,
  'src/main/java/host/exp/exponent/Constants.java'
);
const testSuiteTestsPath = path.join(
  appPath,
  'src/androidTest/java/host/exp/exponent/TestSuiteTests.kt'
);
const versionedReactAndroidPath = path.join(ANDROID_DIR, 'versioned-react-native/ReactAndroid');
const versionedHermesPath = path.join(ANDROID_DIR, 'versioned-react-native/sdks/hermes');

async function transformFileAsync(filePath: string, regexp: RegExp, replacement: string = '') {
  const fileContent = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, fileContent.replace(regexp, replacement));
}

async function removeVersionReferencesFromFileAsync(sdkMajorVersion: string, filePath: string) {
  console.log(
    `Removing code surrounded by ${chalk.gray(`// BEGIN_SDK_${sdkMajorVersion}`)} and ${chalk.gray(
      `// END_SDK_${sdkMajorVersion}`
    )} from ${chalk.magenta(path.relative(EXPO_DIR, filePath))}...`
  );
  await transformFileAsync(
    filePath,
    new RegExp(
      `\\s*//\\s*BEGIN_SDK_${sdkMajorVersion}(_\d+)*\\n.*?//\\s*END_SDK_${sdkMajorVersion}(_\d+)*`,
      'gs'
    ),
    ''
  );
}

async function removeVersionedExpoviewAsync(versionedExpoviewAbiPath: string) {
  console.log(
    `Removing versioned expoview at ${chalk.magenta(
      path.relative(EXPO_DIR, versionedExpoviewAbiPath)
    )}...`
  );
  await fs.remove(versionedExpoviewAbiPath);
}

async function removeFromManifestAsync(sdkMajorVersion: string, manifestPath: string) {
  console.log(
    `Removing code surrounded by ${chalk.gray(
      `<!-- BEGIN_SDK_${sdkMajorVersion} -->`
    )} and ${chalk.gray(`<!-- END_SDK_${sdkMajorVersion} -->`)} from ${chalk.magenta(
      path.relative(EXPO_DIR, manifestPath)
    )}...`
  );
  await transformFileAsync(
    manifestPath,
    new RegExp(
      `\\s*<!--\\s*BEGIN_SDK_${sdkMajorVersion}(_\d+)*\\s*-->.*?<!--\\s*END_SDK_${sdkMajorVersion}(_\d+)*\\s*-->`,
      'gs'
    ),
    ''
  );
}

async function removeFromSettingsGradleAsync(abiName: string, settingsGradlePath: string) {
  console.log(
    `Removing ${chalk.green(`expoview-${abiName}`)} from ${chalk.magenta(
      path.relative(EXPO_DIR, settingsGradlePath)
    )}...`
  );
  const sdkVersion = abiName.replace(/abi(\d+)_0_0/, 'sdk$1');
  await transformFileAsync(settingsGradlePath, new RegExp(`\\n\\s*"${abiName}",[^\\n]*`, 'g'), '');
  await transformFileAsync(
    settingsGradlePath,
    new RegExp(`\\nuseVendoredModulesForSettingsGradle\\('${sdkVersion}'\\)[^\\n]*`, 'g'),
    ''
  );
}

async function removeFromBuildGradleAsync(abiName: string, buildGradlePath: string) {
  console.log(
    `Removing maven repository for ${chalk.green(`expoview-${abiName}`)} from ${chalk.magenta(
      path.relative(EXPO_DIR, buildGradlePath)
    )}...`
  );
  await transformFileAsync(
    buildGradlePath,
    new RegExp(`\\s*maven\\s*{\\s*url\\s*".*?/expoview-${abiName}/maven"\\s*}[^\\n]*`),
    ''
  );
}

async function removeFromSdkVersionsAsync(version: string, sdkVersionsPath: string) {
  console.log(
    `Removing ${chalk.cyan(version)} from ${chalk.magenta(
      path.relative(EXPO_DIR, sdkVersionsPath)
    )}...`
  );
  await transformFileAsync(sdkVersionsPath, new RegExp(`"${version}",\s*`, 'g'), '');
}

async function removeTestSuiteTestsAsync(version: string, testsFilePath: string) {
  console.log(
    `Removing test-suite tests from ${chalk.magenta(path.relative(EXPO_DIR, testsFilePath))}...`
  );
  await transformFileAsync(
    testsFilePath,
    new RegExp(`\\s*(@\\w+\\s+)*@ExpoSdkVersionTest\\("${version}"\\)[^}]+}`),
    ''
  );
}

async function findAndPrintVersionReferencesInSourceFilesAsync(version: string): Promise<boolean> {
  const pattern = new RegExp(
    `(${version.replace(/\./g, '[._]')}|(SDK|ABI).?${semver.major(version)})`,
    'ig'
  );
  let matchesCount = 0;

  const files = await glob('**/{src/**/*.@(java|kt|xml),build.gradle}', { cwd: ANDROID_DIR });

  for (const file of files) {
    const filePath = path.join(ANDROID_DIR, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const fileLines = fileContent.split(/\r\n?|\n/g);
    let match;

    while ((match = pattern.exec(fileContent)) != null) {
      const index = pattern.lastIndex - match[0].length;
      const lineNumberWithMatch = fileContent.substring(0, index).split(/\r\n?|\n/g).length - 1;
      const firstLineInContext = Math.max(0, lineNumberWithMatch - 2);
      const lastLineInContext = Math.min(lineNumberWithMatch + 2, fileLines.length);

      ++matchesCount;

      console.log(
        `Found ${chalk.bold.green(match[0])} in ${chalk.magenta(
          path.relative(EXPO_DIR, filePath)
        )}:`
      );

      for (let lineIndex = firstLineInContext; lineIndex <= lastLineInContext; lineIndex++) {
        console.log(
          `${chalk.gray(1 + lineIndex + ':')} ${fileLines[lineIndex].replace(
            match[0],
            chalk.bgMagenta(match[0])
          )}`
        );
      }
      console.log();
    }
  }
  return matchesCount > 0;
}

export async function removeVersionAsync(version: string) {
  const abiName = `abi${version.replace(/\./g, '_')}`;
  const sdkMajorVersion = `${semver.major(version)}`;

  console.log(`Removing SDK version ${chalk.cyan(version)} for ${chalk.blue('Android')}...`);

  // Remove expoview-abi*_0_0 library
  await removeVersionedExpoviewAsync(versionedExpoviewAbiPath(abiName));
  await removeFromSettingsGradleAsync(abiName, settingsGradlePath);
  await removeFromBuildGradleAsync(abiName, buildGradlePath);

  // Remove code surrounded by BEGIN_SDK_* and END_SDK_*
  await removeVersionReferencesFromFileAsync(sdkMajorVersion, expoviewBuildGradlePath);
  await removeVersionReferencesFromFileAsync(sdkMajorVersion, appBuildGradlePath);
  await removeVersionReferencesFromFileAsync(sdkMajorVersion, rnActivityPath);
  await removeVersionReferencesFromFileAsync(sdkMajorVersion, expoviewConstantsPath);

  // Remove test-suite tests from the app.
  await removeTestSuiteTestsAsync(version, testSuiteTestsPath);

  // Update AndroidManifests
  await removeFromManifestAsync(sdkMajorVersion, appManifestPath);
  await removeFromManifestAsync(sdkMajorVersion, templateManifestPath);

  // Remove vendored modules
  await removeVersionedVendoredModulesAsync(Number(version));

  // Remove SDK version from the list of supported SDKs
  await removeFromSdkVersionsAsync(version, sdkVersionsPath);

  console.log(`\nLooking for SDK references in source files...`);

  if (await findAndPrintVersionReferencesInSourceFilesAsync(version)) {
    console.log(
      chalk.yellow(`Please review all of these references and remove them manually if possible!\n`)
    );
  }
}

async function copyExpoModulesAsync(version: string) {
  const packages = await getListOfPackagesAsync();
  for (const pkg of packages) {
    if (
      pkg.isSupportedOnPlatform('android') &&
      pkg.isIncludedInExpoClientOnPlatform('android') &&
      pkg.isVersionableOnPlatform('android')
    ) {
      const abiVersion = `abi${version.replace(/\./g, '_')}`;
      const targetDirectory = path.join(ANDROID_DIR, `versioned-abis/expoview-${abiVersion}`);
      const sourceDirectory = path.join(pkg.path, pkg.androidSubdirectory);
      const transforms = expoModulesTransforms(pkg.packageName, abiVersion);

      const files = await searchFilesAsync(sourceDirectory, [
        './src/main/java/**',
        './src/main/kotlin/**',
        './src/main/AndroidManifest.xml',
      ]);

      for (const javaPkg of packagesToKeep) {
        const javaPkgWithSlash = javaPkg.replace(/\./g, '/');
        const pathFromPackage = `./src/main/{java,kotlin}/${javaPkgWithSlash}{/**,.java,.kt}`;
        for (const file of files) {
          if (minimatch(file, pathFromPackage)) {
            files.delete(file);
            continue;
          }
        }
      }

      for (const sourceFile of files) {
        await copyFileWithTransformsAsync({
          sourceFile,
          targetDirectory,
          sourceDirectory,
          transforms,
        });
      }
      const temporaryPackageManifestPath = path.join(
        targetDirectory,
        'src/main/TemporaryExpoModuleAndroidManifest.xml'
      );
      const mainManifestPath = path.join(targetDirectory, 'src/main/AndroidManifest.xml');
      await spawnAsync('java', [
        '-jar',
        path.join(SCRIPT_DIR, 'android-manifest-merger-3898d3a.jar'),
        '--main',
        mainManifestPath,
        '--libs',
        temporaryPackageManifestPath,
        '--placeholder',
        'applicationId=${applicationId}',
        '--out',
        mainManifestPath,
        '--log',
        'WARNING',
      ]);
      await fs.remove(temporaryPackageManifestPath);
      console.log(`   ✅  Created versioned ${pkg.packageName}`);
    }
  }
}

async function addVersionedActivitesToManifests(version: string) {
  const abiVersion = version.replace(/\./g, '_');
  const abiName = `abi${abiVersion}`;
  const majorVersion = semver.major(version);

  await transformFileAsync(
    templateManifestPath,
    new RegExp('<!-- ADD DEV SETTINGS HERE -->'),
    `<!-- ADD DEV SETTINGS HERE -->
    <!-- BEGIN_SDK_${majorVersion} -->
    <activity android:name="${abiName}.com.facebook.react.devsupport.DevSettingsActivity"/>
    <!-- END_SDK_${majorVersion} -->`
  );
}

async function registerNewVersionUnderSdkVersions(version: string) {
  const fileString = await fs.readFile(sdkVersionsPath, 'utf8');
  let jsConfig;
  // read the existing json config and add the new version to the sdkVersions array
  try {
    jsConfig = JSON.parse(fileString);
  } catch (e) {
    console.log('Error parsing existing sdkVersions.json file, writing a new one...', e);
    console.log('The erroneous file contents was:', fileString);
    jsConfig = {
      sdkVersions: [],
    };
  }
  // apply changes
  jsConfig.sdkVersions.push(version);
  await fs.writeFile(sdkVersionsPath, JSON.stringify(jsConfig));
}

async function cleanUpAsync(version: string) {
  const abiVersion = version.replace(/\./g, '_');
  const abiName = `abi${abiVersion}`;

  const versionedAbiSrcPath = path.join(
    versionedExpoviewAbiPath(abiName),
    'src/main/java',
    abiName
  );

  const filesToDelete: string[] = [];

  // delete PrintDocumentAdapter*Callback.kt
  // their package is `android.print` and therefore they are not changed by the versioning script
  // so we will have duplicate classes
  const printCallbackFiles = await glob(
    path.join(versionedAbiSrcPath, 'expo/modules/print/*Callback.kt')
  );
  for (const file of printCallbackFiles) {
    const contents = await fs.readFile(file, 'utf8');
    if (!contents.includes(`package ${abiName}`)) {
      filesToDelete.push(file);
    } else {
      console.log(`Skipping deleting ${file} because it appears to have been versioned`);
    }
  }

  // delete versioned loader providers since we don't need them
  filesToDelete.push(path.join(versionedAbiSrcPath, 'expo/loaders'));

  console.log('Deleting the following files and directories:');
  console.log(filesToDelete);

  for (const file of filesToDelete) {
    await fs.remove(file);
  }

  // misc fixes for versioned code
  const versionedExponentPackagePath = path.join(
    versionedAbiSrcPath,
    'host/exp/exponent/ExponentPackage.kt'
  );
  await transformFileAsync(
    versionedExponentPackagePath,
    new RegExp('// WHEN_VERSIONING_REMOVE_FROM_HERE', 'g'),
    '/* WHEN_VERSIONING_REMOVE_FROM_HERE'
  );
  await transformFileAsync(
    versionedExponentPackagePath,
    new RegExp('// WHEN_VERSIONING_REMOVE_TO_HERE', 'g'),
    'WHEN_VERSIONING_REMOVE_TO_HERE */'
  );

  await transformFileAsync(
    path.join(versionedAbiSrcPath, 'host/exp/exponent/VersionedUtils.kt'),
    new RegExp('// DO NOT EDIT THIS COMMENT - used by versioning scripts[^,]+,[^,]+,'),
    'null, null,'
  );

  // replace abixx_x_x...R with abixx_x_x.host.exp.expoview.R
  await spawnAsync(
    `find ${versionedAbiSrcPath} -iname '*.java' -type f -print0 | ` +
      `xargs -0 ${SED_PREFIX} 's/import ${abiName}\.[^;]*\.R;/import ${abiName}.host.exp.expoview.R;/g'`,
    [],
    { shell: true }
  );
  await spawnAsync(
    `find ${versionedAbiSrcPath} -iname '*.kt' -type f -print0 | ` +
      `xargs -0 ${SED_PREFIX} 's/import ${abiName}\\..*\\.R$/import ${abiName}.host.exp.expoview.R/g'`,
    [],
    { shell: true }
  );

  // add new versioned maven to build.gradle
  await transformFileAsync(
    buildGradlePath,
    new RegExp('// For old expoviews to work'),
    `// For old expoviews to work
    maven {
      url "$rootDir/versioned-abis/expoview-${abiName}/maven"
    }`
  );
}

async function prepareReanimatedAsync(version: string): Promise<void> {
  const abiVersion = version.replace(/\./g, '_');
  const abiName = `abi${abiVersion}`;
  const versionedExpoviewPath = versionedExpoviewAbiPath(abiName);
  const buildGradlePath = path.join(versionedExpoviewPath, 'build.gradle');

  const buildReanimatedSO = async () => {
    await spawnAsync(`./gradlew :expoview-${abiName}:packageNdkLibs`, [], {
      shell: true,
      cwd: path.join(versionedExpoviewPath, '../../'),
      stdio: 'inherit',
    });
  };

  const removeLeftoverDirectories = async () => {
    const mainPath = path.join(versionedExpoviewPath, 'src', 'main');
    const toRemove = ['Common', 'JNI', 'cpp'];
    for (const dir of toRemove) {
      await fs.remove(path.join(mainPath, dir));
    }
  };

  const removeLeftoversFromGradle = async () => {
    const buildGradle = await fs.readFile(buildGradlePath, 'utf-8');
    await fs.writeFile(
      buildGradlePath,
      deleteLinesBetweenTags(
        /WHEN_PREPARING_REANIMATED_REMOVE_FROM_HERE/,
        /WHEN_PREPARING_REANIMATED_REMOVE_TO_HERE/,
        buildGradle
      )
    );
  };

  await buildReanimatedSO();
  await removeLeftoverDirectories();
  await removeLeftoversFromGradle();
}

async function exportReactNdks() {
  const versionedRN = path.join(versionedReactAndroidPath, '..');
  await spawnAsync(`./gradlew :ReactAndroid:packageReactNdkLibs`, [], {
    shell: true,
    cwd: versionedRN,
    stdio: 'inherit',
    env: {
      ...process.env,
      REACT_NATIVE_OVERRIDE_HERMES_DIR: versionedHermesPath,
    },
  });
}

async function exportReactNdksIfNeeded() {
  const ndksPath = path.join(versionedReactAndroidPath, 'build', 'react-ndk', 'exported');
  const exists = await fs.pathExists(ndksPath);
  if (!exists) {
    await exportReactNdks();
    return;
  }

  const exportedSO = await glob(path.join(ndksPath, '**/*.so'));
  if (exportedSO.length === 0) {
    await exportReactNdks();
  }
}

export async function addVersionAsync(version: string) {
  console.log(' 🛠   1/10: Updating android/versioned-react-native...');
  await updateVersionedReactNativeAsync(
    Directories.getReactNativeSubmoduleDir(),
    ANDROID_DIR,
    version
  );
  console.log(' ✅  1/10: Finished\n\n');

  console.log(' 🛠  2/10: Building versioned ReactAndroid AAR...');
  await spawnAsync('./android-build-aar.sh', [version], {
    shell: true,
    cwd: SCRIPT_DIR,
    stdio: 'inherit',
  });
  console.log(' ✅  2/10: Finished\n\n');

  console.log(' 🛠   3/10: Creating versioned expoview package...');
  await copyExpoviewAsync(version, ANDROID_DIR);
  console.log(' ✅  3/10: Finished\n\n');

  console.log(' 🛠   4/10: Exporting react ndks if needed...');
  await exportReactNdksIfNeeded();
  console.log(' ✅  4/10: Finished\n\n');

  console.log(' 🛠   5/10: prepare versioned Reanimated...');
  await prepareReanimatedAsync(version);
  console.log(' ✅  5/10: Finished\n\n');

  console.log(' 🛠   6/10: Creating versioned expo-modules packages...');
  await copyExpoModulesAsync(version);
  console.log(' ✅  6/10: Finished\n\n');

  console.log(' 🛠   7/10: Versoning c++ libraries for expo-modules...');
  await versionCxxExpoModulesAsync(version);
  console.log(' ✅  7/10: Finished\n\n');

  console.log(' 🛠   8/10: Adding extra versioned activites to AndroidManifest...');
  await addVersionedActivitesToManifests(version);
  console.log(' ✅  8/10: Finished\n\n');

  console.log(' 🛠   9/10: Registering new version under sdkVersions config...');
  await registerNewVersionUnderSdkVersions(version);
  console.log(' ✅  9/10: Finished\n\n');

  console.log(' 🛠   10/10: Misc cleanup...');
  await cleanUpAsync(version);
  console.log(' ✅  10/10: Finished');
}
