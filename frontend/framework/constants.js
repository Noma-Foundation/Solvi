/**
 * Sets the maximum limit for a History collection.
 */
export const MAX_HISTORY_SIZE = 20;

/**
 * Fallback value used by History when an invalid maxSize is provided.
 */
export const HISTORY_FALLBACK_SIZE = 20;

/**
 * Delay (ms) used by EventBus.publishAsync to defer callback execution.
 */
export const PUBLISH_ASYNC_DELAY_MS = 0;

/**
 * Error message thrown when the event name passed to subscribe() is not a string.
 */
export const ERR_EVENT_NAME_NOT_STRING = "Event name must be a string";

/**
 * Error message thrown when the callback passed to subscribe() is neither a function nor an object.
 */
export const ERR_CALLBACK_INVALID_TYPE = "Callback must be a function or an object with an execute method";

/**
 * Error message thrown when an event object's execute() method declares parameters.
 */
export const ERR_EXECUTE_HAS_PARAMS = "Event.execute must not receive arguments";

/**
 * Error message thrown when IComponentModel.buildTemplate() is not implemented by a subclass.
 */
export const ERR_BUILD_TEMPLATE_NOT_IMPLEMENTED = "You must implement the buildTemplate method.";

/**
 * Error message thrown when IComponentModel.bindEvents() is not implemented by a subclass.
 */
export const ERR_BIND_EVENTS_NOT_IMPLEMENTED = "You must implement the bindEvents method.";

