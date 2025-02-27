---
title: iOS Capabilities
---

import { YesIcon, NoIcon } from '~/ui/components/DocIcons';

When you make a change to your iOS entitlements, this change needs to be updated remotely on Apple's servers before making a production build. EAS Build automatically synchronizes capabilities on the Apple Developer Portal with your local entitlements configuration when you run `eas build`. Capabilities are web services provided by Apple, think of them like AWS or Firebase services.

> This feature can be disabled with `EXPO_NO_CAPABILITY_SYNC=1 eas build`

## Entitlements

In bare workflow apps, the entitlements are read from your `ios/**/*.entitlements` file.

In managed workflow, the entitlements are read from the introspected Expo config. You can see what your introspected config looks like by running `npx expo config --type introspect` in your project, then look for the `ios.entitlements` object for the results.

## Enabling

If a supported entitlement is present in the entitlements file, then running `eas build` will enable it on Apple Developer Portal. If the capability is already enabled, then EAS Build will skip it.

## Disabling

If a capability is enabled for your app remotely, but not present in the native entitlements file, then running `eas build` will automatically disable it.

## Supported Capabilities

EAS Build will only enable capabilities that it has built-in support for, any unsupported entitlements must be manually enabled via [Apple Developer Portal][apple-dev-portal].

| Support     | Capability                                        | Entitlement string                                                         |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| <YesIcon /> | Access Wi-Fi Information                          | `com.apple.developer.networking.wifi-info`                                 |
| <YesIcon /> | App Attest                                        | `com.apple.developer.devicecheck.appattest-environment`                    |
| <YesIcon /> | App Groups                                        | `com.apple.security.application-groups`                                    |
| <YesIcon /> | Apple Pay Payment Processing                      | `com.apple.developer.in-app-payments`                                      |
| <YesIcon /> | Associated Domains                                | `com.apple.developer.associated-domains`                                   |
| <YesIcon /> | AutoFill Credential Provider                      | `com.apple.developer.authentication-services.autofill-credential-provider` |
| <YesIcon /> | ClassKit                                          | `com.apple.developer.ClassKit-environment`                                 |
| <YesIcon /> | Communicates with Drivers                         | `com.apple.developer.driverkit.communicates-with-drivers`                  |
| <YesIcon /> | Communication Notifications                       | `com.apple.developer.usernotifications.communication`                      |
| <YesIcon /> | Custom Network Protocol                           | `com.apple.developer.networking.custom-protocol`                           |
| <YesIcon /> | Data Protection                                   | `com.apple.developer.default-data-protection`                              |
| <YesIcon /> | DriverKit Allow Third Party UserClients           | `com.apple.developer.driverkit.allow-third-party-userclients`              |
| <YesIcon /> | DriverKit Family Audio (development)              | `com.apple.developer.driverkit.family.audio`                               |
| <YesIcon /> | DriverKit Family HID Device (development)         | `com.apple.developer.driverkit.family.hid.device`                          |
| <YesIcon /> | DriverKit Family HID EventService (development)   | `com.apple.developer.driverkit.family.hid.eventservice`                    |
| <YesIcon /> | DriverKit Family Networking (development)         | `com.apple.developer.driverkit.family.networking`                          |
| <YesIcon /> | DriverKit Family SCSIController (development)     | `com.apple.developer.driverkit.family.scsicontroller`                      |
| <YesIcon /> | DriverKit Family Serial (development)             | `com.apple.developer.driverkit.family.serial`                              |
| <YesIcon /> | DriverKit Transport HID (development)             | `com.apple.developer.driverkit.transport.hid`                              |
| <YesIcon /> | DriverKit USB Transport (development)             | `com.apple.developer.driverkit.transport.usb`                              |
| <YesIcon /> | DriverKit for Development                         | `com.apple.developer.driverkit`                                            |
| <YesIcon /> | Extended Virtual Address Space                    | `com.apple.developer.kernel.extended-virtual-addressing`                   |
| <YesIcon /> | Family Controls                                   | `com.apple.developer.family-controls`                                      |
| <YesIcon /> | FileProvider TestingMode                          | `com.apple.developer.fileprovider.testing-mode`                            |
| <YesIcon /> | Fonts                                             | `com.apple.developer.user-fonts`                                           |
| <YesIcon /> | Group Activities                                  | `com.apple.developer.group-session`                                        |
| <YesIcon /> | HealthKit                                         | `com.apple.developer.healthkit`                                            |
| <YesIcon /> | HomeKit                                           | `com.apple.developer.homekit`                                              |
| <YesIcon /> | Hotspot                                           | `com.apple.developer.networking.HotspotConfiguration`                      |
| <YesIcon /> | Increased Memory Limit                            | `com.apple.developer.kernel.increased-memory-limit`                        |
| <YesIcon /> | Inter-App Audio                                   | `inter-app-audio`                                                          |
| <YesIcon /> | Low Latency HLS                                   | `com.apple.developer.coremedia.hls.low-latency`                            |
| <YesIcon /> | MDM Managed Associated Domains                    | `com.apple.developer.associated-domains.mdm-managed`                       |
| <YesIcon /> | Maps                                              | `com.apple.developer.maps`                                                 |
| <YesIcon /> | Media Device Discovery                            | `com.apple.developer.media-device-discovery-extension`                     |
| <YesIcon /> | Multipath                                         | `com.apple.developer.networking.multipath`                                 |
| <YesIcon /> | NFC Tag Reading                                   | `com.apple.developer.nfc.readersession.formats`                            |
| <YesIcon /> | Network Extensions                                | `com.apple.developer.networking.networkextension`                          |
| <YesIcon /> | On Demand Install Capable for App Clip Extensions | `com.apple.developer.on-demand-install-capable`                            |
| <YesIcon /> | Personal VPN                                      | `com.apple.developer.networking.vpn.api`                                   |
| <YesIcon /> | Push Notifications                                | `aps-environment`                                                          |
| <YesIcon /> | Push to Talk                                      | `com.apple.developer.push-to-talk`                                         |
| <YesIcon /> | Recalibrate Estimates                             | `com.apple.developer.healthkit.recalibrate-estimates`                      |
| <YesIcon /> | Shared with You                                   | `com.apple.developer.shared-with-you`                                      |
| <YesIcon /> | Sign In with Apple                                | `com.apple.developer.applesignin`                                          |
| <YesIcon /> | SiriKit                                           | `com.apple.developer.siri`                                                 |
| <YesIcon /> | System Extension                                  | `com.apple.developer.system-extension.install`                             |
| <YesIcon /> | TV Services                                       | `com.apple.developer.user-management`                                      |
| <YesIcon /> | Time Sensitive Notifications                      | `com.apple.developer.usernotifications.time-sensitive`                     |
| <YesIcon /> | Wallet                                            | `com.apple.developer.pass-type-identifiers`                                |
| <YesIcon /> | WeatherKit                                        | `com.apple.developer.weatherkit`                                           |
| <YesIcon /> | Wireless Accessory Configuration                  | `com.apple.external-accessory.wireless-configuration`                      |
| <YesIcon /> | iCloud                                            | `com.apple.developer.icloud-container-identifiers`                         |
| <NoIcon />  | HLS Interstitial Previews                         | Unknown                                                                    |

The unsupported capabilities either don't support iOS, or they don't have a corresponding entitlement value.

Partially supported capabilities have extra configuration which EAS Build currently does not support. This includes Apple merchant IDs, App Group IDs, and iCloud container IDs. These values must all be [configured manually](https://expo.fyi/provisioning-profile-missing-capabilities) for the time being. You can also refer to this [Apple doc](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-app) for more information on manual setup.

## Debugging

You can run `EXPO_DEBUG=1 eas build` to get more detailed logs regarding the capability syncing.

If you have trouble using this feature, you can disable it with the environment variable `EXPO_NO_CAPABILITY_SYNC=1`.

To see all of the currently enabled capabilities, visit [Apple Developer Portal][apple-dev-portal], and find the bundle identifier matching your app, if you click on it you should see a list of all the currently enabled capabilities.

[apple-dev-portal]: https://developer.apple.com/account/resources/identifiers/list
