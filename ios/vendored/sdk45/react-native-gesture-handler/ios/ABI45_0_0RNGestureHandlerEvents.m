#import "ABI45_0_0RNGestureHandlerEvents.h"

#define SAFE_VELOCITY(velocity) @(isnan(velocity) ? 0 : velocity)

@implementation ABI45_0_0RNGestureHandlerEventExtraData

- (instancetype)initWithData:(NSDictionary *)data;
{
    if ((self = [super init])) {
        _data = data;
    }
    return self;
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{
                           @"x": @(position.x),
                           @"y": @(position.y),
                           @"absoluteX": @(absolutePosition.x),
                           @"absoluteY": @(absolutePosition.y),
                           @"numberOfPointers": @(numberOfTouches)}];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                   withDuration:(NSUInteger)duration
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{
                           @"x": @(position.x),
                           @"y": @(position.y),
                           @"absoluteX": @(absolutePosition.x),
                           @"absoluteY": @(absolutePosition.y),
                           @"numberOfPointers": @(numberOfTouches),
                           @"duration":@(duration)
            }];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forPan:(CGPoint)position
                      withAbsolutePosition:(CGPoint)absolutePosition
                           withTranslation:(CGPoint)translation
                              withVelocity:(CGPoint)velocity
                       withNumberOfTouches:(NSUInteger)numberOfTouches
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{
                           @"x": @(position.x),
                           @"y": @(position.y),
                           @"absoluteX": @(absolutePosition.x),
                           @"absoluteY": @(absolutePosition.y),
                           @"translationX": @(translation.x),
                           @"translationY": @(translation.y),
                           @"velocityX": SAFE_VELOCITY(velocity.x),
                           @"velocityY": SAFE_VELOCITY(velocity.y),
                           @"numberOfPointers": @(numberOfTouches)}];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forForce:(CGFloat)force
                                 forPosition:(CGPoint)position
                        withAbsolutePosition:(CGPoint)absolutePosition
                         withNumberOfTouches:(NSUInteger)numberOfTouches
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{
                           @"x": @(position.x),
                           @"y": @(position.y),
                           @"absoluteX": @(absolutePosition.x),
                           @"absoluteY": @(absolutePosition.y),
                           @"force": @(force),
                           @"numberOfPointers": @(numberOfTouches)}];
  
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forPinch:(CGFloat)scale
                              withFocalPoint:(CGPoint)focalPoint
                                withVelocity:(CGFloat)velocity
                         withNumberOfTouches:(NSUInteger)numberOfTouches
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{
                           @"scale": @(scale),
                           @"focalX": @(focalPoint.x),
                           @"focalY": @(focalPoint.y),
                           @"velocity": SAFE_VELOCITY(velocity),
                           @"numberOfPointers": @(numberOfTouches)}];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forRotation:(CGFloat)rotation
                                withAnchorPoint:(CGPoint)anchorPoint
                                   withVelocity:(CGFloat)velocity
                            withNumberOfTouches:(NSUInteger)numberOfTouches
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{@"rotation": @(rotation),
                           @"anchorX": @(anchorPoint.x),
                           @"anchorY": @(anchorPoint.y),
                           @"velocity": SAFE_VELOCITY(velocity),
                           @"numberOfPointers": @(numberOfTouches)}];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forEventType:(ABI45_0_0RNTouchEventType)eventType
                             withChangedPointers:(NSArray<NSDictionary *> *)changedPointers
                                 withAllPointers:(NSArray<NSDictionary *> *)allPointers
                             withNumberOfTouches:(NSUInteger)numberOfTouches
{
    if (changedPointers == nil || allPointers == nil) {
        changedPointers = @[];
        allPointers = @[];
        eventType = ABI45_0_0RNTouchEventTypeUndetermined;
    }
  
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{@"eventType": @(eventType),
                         @"changedTouches": changedPointers,
                         @"allTouches": allPointers,
                         @"numberOfTouches": @(numberOfTouches)}];
}

+ (ABI45_0_0RNGestureHandlerEventExtraData *)forPointerInside:(BOOL)pointerInside
{
    return [[ABI45_0_0RNGestureHandlerEventExtraData alloc]
            initWithData:@{@"pointerInside": @(pointerInside)}];
}

@end


@implementation ABI45_0_0RNGestureHandlerEvent
{
    NSNumber *_handlerTag;
    ABI45_0_0RNGestureHandlerState _state;
    ABI45_0_0RNGestureHandlerEventExtraData *_extraData;
}

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithABI45_0_0ReactTag:(NSNumber *)ABI45_0_0ReactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(ABI45_0_0RNGestureHandlerState)state
                       extraData:(ABI45_0_0RNGestureHandlerEventExtraData *)extraData
                   coalescingKey:(uint16_t)coalescingKey
{
    if ((self = [super init])) {
        _viewTag = ABI45_0_0ReactTag;
        _handlerTag = handlerTag;
        _state = state;
        _extraData = extraData;
        _coalescingKey = coalescingKey;
    }
    return self;
}

ABI45_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)

- (NSString *)eventName
{
    return @"onGestureHandlerEvent";
}

- (BOOL)canCoalesce
{
    return YES;
}

- (id<ABI45_0_0RCTEvent>)coalesceWithEvent:(id<ABI45_0_0RCTEvent>)newEvent;
{
    return newEvent;
}

+ (NSString *)moduleDotMethod
{
    return @"ABI45_0_0RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithDictionary:_extraData.data];
    [body setObject:_viewTag forKey:@"target"];
    [body setObject:_handlerTag forKey:@"handlerTag"];
    [body setObject:@(_state) forKey:@"state"];
    return @[self.viewTag, @"onGestureHandlerEvent", body];
}

@end


@implementation ABI45_0_0RNGestureHandlerStateChange
{
    NSNumber *_handlerTag;
    ABI45_0_0RNGestureHandlerState _state;
    ABI45_0_0RNGestureHandlerState _prevState;
    ABI45_0_0RNGestureHandlerEventExtraData *_extraData;
}

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithABI45_0_0ReactTag:(NSNumber *)ABI45_0_0ReactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(ABI45_0_0RNGestureHandlerState)state
                       prevState:(ABI45_0_0RNGestureHandlerState)prevState
                       extraData:(ABI45_0_0RNGestureHandlerEventExtraData *)extraData
{
    static uint16_t coalescingKey = 0;
    if ((self = [super init])) {
        _viewTag = ABI45_0_0ReactTag;
        _handlerTag = handlerTag;
        _state = state;
        _prevState = prevState;
        _extraData = extraData;
        _coalescingKey = coalescingKey++;
    }
    return self;
}

ABI45_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)

- (NSString *)eventName
{
    return @"onGestureHandlerStateChange";
}

- (BOOL)canCoalesce
{
    // TODO: event coalescing
    return NO;
}

- (id<ABI45_0_0RCTEvent>)coalesceWithEvent:(id<ABI45_0_0RCTEvent>)newEvent;
{
    return newEvent;
}

+ (NSString *)moduleDotMethod
{
    return @"ABI45_0_0RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithDictionary:_extraData.data];
    [body setObject:_viewTag forKey:@"target"];
    [body setObject:_handlerTag forKey:@"handlerTag"];
    [body setObject:@(_state) forKey:@"state"];
    [body setObject:@(_prevState) forKey:@"oldState"];
    return @[self.viewTag, @"onGestureHandlerStateChange", body];
}

@end
