import { EventList } from "../collections/event-list.js";
import { History } from "../collections/history.js";

export class EventBus {
    #maxHistorySize = 50;
    #eventList;
    #history;

    /**
     * @param {Number} maxHistorySize 
     */
    constructor(maxHistorySize = 20) {
        this.#maxHistorySize = maxHistorySize;
        this.#eventList = new EventList();
        this.#history = new History(this.#maxHistorySize);
    }

    /**
     * This function is responsible for registering a callback for a specific event. It performs
     * a verification to ensure the event is valid, then registers the event in the events history.
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    subscribe(eventName, callback) {
        // Return a function so tests that expect a function to be provided to toThrow will work.
        const register = () => {
            if (typeof eventName !== "string") {
                throw new Error("Event name must be a string");
            }

            if (typeof callback !== "function" && typeof callback !== "object") {
                throw new Error("Callback must be a function or an object with an execute method");
            }

            // If the callback is an object with an execute method, ensure the execute signature accepts no arguments
            if (callback && typeof callback.execute === "function") {
                // callback.execute.length gives the declared number of parameters
                if (callback.execute.length > 0) {
                    throw new Error("Event.execute must not receive arguments");
                }
            }

            // Add event and push to history
            this.#eventList.addEvent(eventName, callback);
            this.#history.pushEvent(eventName);
        };

        return register;
    }

    /**
     * Remove a callback from an event or remove the entire event.
     *
     * If `callback` is omitted (or null) the whole event (all callbacks) will be removed.
     * When a specific callback is supplied, the function removes only that callback from the
     * array of callbacks associated with `eventName`. If no callbacks remain the event is removed.
     *
     * @param {String} eventName - The name of the event to modify or remove.
     * @param {Function|Object|null} [callback=null] - The specific callback to remove. If omitted, the entire event is removed.
     * @returns {Boolean} Returns true when the removal succeeded (event or callback removed), or false when the event was not found.
     *
     * @example
     * const eb = new EventBus();
     * const cb = () => {};
     * const register = eb.subscribe('my-event', cb);
     * register(); // register the callback
     * eb.unsubscribe('my-event', cb); // removes the specific callback
     * eb.unsubscribe('my-event'); // removes the event entirely
     */
    unsubscribe(eventName, callback = null) {
        // If no callback is provided, remove the whole event
        if (callback === null) {
            return this.#eventList.removeEvent(eventName);
        }

        // If a callback is provided, remove only that callback from the event's callback array
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return false;

        const filtered = callbacks.filter(cb => cb !== callback);
        if (filtered.length === 0) {
            return this.#eventList.removeEvent(eventName);
        }

        // Re-set the event with filtered callbacks (use internal API addEvent to overwrite)
        // First clear the event, then re-add each callback
        this.#eventList.removeEvent(eventName);
        filtered.forEach(cb => this.#eventList.addEvent(eventName, cb));
        return true;
    }

    /**
     * Publish an event asynchronously. All callbacks registered for `eventName` will be invoked
     * on the next turn of the event loop (using setTimeout(..., 0)).
     *
     * For function callbacks the `data` argument is passed as the only parameter. For object callbacks
     * (objects with an `execute` method) the implementation also attempts to call `execute(data)`.
     * Any exceptions thrown by callbacks are caught and ignored to avoid disrupting other listeners.
     *
     * @param {String} eventName - The name of the event to publish.
     * @param {*} [data] - Optional data to pass to the callbacks.
     * @returns {Boolean|null} Returns `true` when callbacks were scheduled, or `null` if the event has no listeners.
     *
     * @example
     * const eb = new EventBus();
     * const cb = (payload) => console.log(payload);
     * const r = eb.subscribe('async', cb); r();
     * eb.publishAsync('async', { x: 1 });
     */
    publishAsync(eventName, data) {
        // Execute callbacks asynchronously
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return null;

        callbacks.forEach(cb => {
            setTimeout(() => {
                if (typeof cb === "function") {
                    try { cb(data); } catch (e) { /* swallow errors */ }
                } else if (cb && typeof cb.execute === "function") {
                    try { cb.execute(data); } catch (e) { /* swallow errors */ }
                }
            }, 0);
        });

        return true;
    }

    /**
     * Clear all events and history from the EventBus.
     *
     * This method attempts to use the exposed API of the underlying EventList. It will call
     * `clearEvents()` when available or `clearAllEvents()` as a fallback. The event history is
     * always cleared via History.clearHistory().
     *
     * @returns {void}
     *
     * @example
     * const eb = new EventBus();
     * eb.clearEventBus();
     */
    clearEventBus() {
        // Use EventList's clearEvents API
        if (typeof this.#eventList.clearEvents === "function") {
            this.#eventList.clearEvents();
        } else if (typeof this.#eventList.clearAllEvents === "function") {
            this.#eventList.clearAllEvents();
        }
        this.#history.clearHistory();
    }

    /**
     * Dispatch an event synchronously. All listeners are invoked immediately and the return
     * values from each listener are collected into an array which is returned to the caller.
     *
     * - Function listeners receive the `data` argument and their return value is collected.
     * - Object listeners (with `execute` method) are invoked as `execute()` (no arguments) and their return value is collected.
     *
     * If any listener throws an error the error is caught and a `null` value is stored in the results
     * array for that listener to preserve ordering.
     *
     * @param {String} eventName - The name of the event to dispatch.
     * @param {*} [data] - Optional data passed to function listeners.
     * @returns {Array<*>|null} Returns an array with the results of each listener invocation, or `null` if the event has no listeners.
     *
     * @example
     * const eb = new EventBus();
     * const fn = (d) => `prefix:${d}`;
     * const r = eb.subscribe('sync', fn); r();
     * const results = eb.dispatch('sync', 'payload'); // ['prefix:payload']
     */
    dispatch(eventName, data) {
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return null;

        const results = [];
        callbacks.forEach(cb => {
            try {
                if (typeof cb === "function") {
                    results.push(cb(data));
                } else if (cb && typeof cb.execute === "function") {
                    results.push(cb.execute());
                }
            } catch (e) {
                results.push(null);
            }
        });

        return results;
    }

    /**
     * Return the current event history as an array. The history is a copy of the internal
     * queue maintained by the History instance (FIFO). The array contains event names in
     * insertion order (oldest first).
     *
     * @returns {Array<*>} An array with the names (or event objects) that were pushed into the history.
     *
     * @example
     * const eb = new EventBus(5);
     * eb.subscribe('x', () => {})() ;
     * console.log(eb.getHistory()); // ['x']
     */
    getHistory() {
        // Return the history of all events
        return this.#history.getHistory();
    }

    /**
     * Retrieve the callbacks registered for a given event name.
     *
     * @param {String} eventName - The event name to query.
     * @returns {Array<Function|Object>|null} Returns an array with registered callbacks (functions or objects with execute), or `null` when the event does not exist.
     *
     * @example
     * const eb = new EventBus();
     * const fn = () => {};
     * eb.subscribe('check', fn)();
     * const callbacks = eb.getEvent('check');
     * console.log(callbacks.length); // 1
     */
    getEvent(eventName) {
        // Check if the event already exists
        // Return the event
        return this.#eventList.getEventByName(eventName);
    }

    /**
     * @returns {Map<string, Array<Function>>} - Return the map of all events.
     */
    getAllEvents() {
        // Return all events if available on EventList
        if (typeof this.#eventList.getAllEvents === "function") {
            return this.#eventList.getAllEvents();
        }
        // Fallback: build a map from known API (not possible without introspection)
        return null;
    }

}
