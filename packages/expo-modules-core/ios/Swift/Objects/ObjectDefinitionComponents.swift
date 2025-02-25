/// This file implements definition components that are allowed in any object-based definition — `ObjectDefinition`.
/// So far only constants and functions belong to plain object.

// MARK: - Constants

/**
 Definition function setting the module's constants to export.
 */
public func Constants(@_implicitSelfCapture _ body: @escaping () -> [String: Any?]) -> AnyDefinition {
  return ConstantsDefinition(body: body)
}

/**
 Definition function setting the module's constants to export.
 */
public func Constants(@_implicitSelfCapture _ body: @autoclosure @escaping () -> [String: Any?]) -> AnyDefinition {
  return ConstantsDefinition(body: body)
}

// MARK: - Events

/**
 Defines event names that the object can send to JavaScript.
 */
public func Events(_ names: String...) -> AnyDefinition {
  return EventsDefinition(names: names)
}

/**
 Function that is invoked when the first event listener is added.
 */
public func OnStartObserving(@_implicitSelfCapture _ body: @escaping () -> Void) -> AsyncFunctionComponent<(), Void, Void> {
  return AsyncFunctionComponent("startObserving", firstArgType: Void.self, dynamicArgumentTypes: [], body)
}

/**
 Function that is invoked when all event listeners are removed.
 */
public func OnStopObserving(@_implicitSelfCapture _ body: @escaping () -> Void) -> AsyncFunctionComponent<(), Void, Void> {
  return AsyncFunctionComponent("stopObserving", firstArgType: Void.self, dynamicArgumentTypes: [], body)
}
