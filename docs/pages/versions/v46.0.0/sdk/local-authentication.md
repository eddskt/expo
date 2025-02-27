---
title: LocalAuthentication
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-46/packages/expo-local-authentication'
packageName: 'expo-local-authentication'
---

import APISection from '~/components/plugins/APISection';
import {APIInstallSection} from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-local-authentication`** allows you to use FaceID and TouchID (iOS) or the Biometric Prompt (Android) to authenticate the user with a face or fingerprint scan.

<PlatformsSection android emulator ios simulator />

## Installation

<APIInstallSection />

## Configuration

On Android, this module requires permissions to access the biometric data for authentication purposes. The `USE_BIOMETRIC` and `USE_FINGERPRINT` permissions are automatically added.

## API

```js
import * as LocalAuthentication from 'expo-local-authentication';
```

<APISection packageName="expo-local-authentication" apiName="LocalAuthentication" />
