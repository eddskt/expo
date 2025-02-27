//  Copyright © 2019 650 Industries. All rights reserved.

#import <ABI46_0_0EXUpdates/ABI46_0_0EXUpdatesUpdate.h>
#import <ABI46_0_0EXUpdates/ABI46_0_0EXUpdatesManifestHeaders.h>
#import <ABI46_0_0EXManifests/ABI46_0_0EXManifestsNewManifest.h>

NS_ASSUME_NONNULL_BEGIN

@interface ABI46_0_0EXUpdatesNewUpdate : NSObject

+ (ABI46_0_0EXUpdatesUpdate *)updateWithNewManifest:(ABI46_0_0EXManifestsNewManifest *)manifest
                           manifestHeaders:(ABI46_0_0EXUpdatesManifestHeaders *)manifestHeaders
                                extensions:(NSDictionary *)extensions
                                    config:(ABI46_0_0EXUpdatesConfig *)config
                                  database:(ABI46_0_0EXUpdatesDatabase *)database;

+ (nullable NSDictionary *)dictionaryWithStructuredHeader:(NSString *)headerString;

@end

NS_ASSUME_NONNULL_END
