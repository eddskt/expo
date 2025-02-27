// Copyright 2018-present 650 Industries. All rights reserved.

#import "ABI46_0_0EXScopedNotificationsHandlerModule.h"
#import "ABI46_0_0EXScopedNotificationsUtils.h"

@interface ABI46_0_0EXScopedNotificationsHandlerModule ()

@property (nonatomic, strong) NSString *scopeKey;

@end

@implementation ABI46_0_0EXScopedNotificationsHandlerModule

- (instancetype)initWithScopeKey:(NSString *)scopeKey
{
  if (self = [super init]) {
    _scopeKey = scopeKey;
  }
  
  return self;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  if ([ABI46_0_0EXScopedNotificationsUtils shouldNotification:notification beHandledByExperience:_scopeKey]) {
    [super userNotificationCenter:center willPresentNotification:notification withCompletionHandler:completionHandler];
  }
}

@end
