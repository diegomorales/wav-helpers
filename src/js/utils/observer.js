/**
 * This module implements an observer pattern.<br>
 * It can be used to extend the functionality of a module.
 *
 * @example
 * import observer from 'composites/observer';
 *
 * export default () => {
 *  let instance = {};
 *  ...
 *  ...
 *  instance = Object.assign({}, instance, observer());
 * }
 *
 * @module observer
 */

/**
 * There's no need to pass the instance of the parent module to this composite.
 * @static
 * @function factory
 * @returns {object} Observer instance
 */
export const observer = () => {
  let uid = -1
  const events = {}

  /**
   * Subscribes to an Event.
   *
   * @param {string} event - Name of the event.
   * @param {function} listener - Callback function.
   * @returns {number} Returns an id for this subscription.
   */
  const on = (event, listener) => {
    uid++

    if (!events[event]) {
      events[event] = { queue: [] }
    }

    events[event].queue.push({
      uid: uid,
      listener: listener
    })

    return uid
  }

  /**
   * Unsubscribes an event.
   * Passing the subscription id or event name and listener removes only this event.
   * Passing only the event name will remove all listeners for this event.
   *
   * @param {string|number} event - Can be id of subscription or event name.
   * @param {function} listener
   * @returns {string|number|boolean} Returns the removed id or event name.
   */
  const off = (event, listener) => {
    if (typeof event === 'number') {
      for (const e in events) {
        if (Object.prototype.hasOwnProperty.call(events, e)) {
          for (let i = events[e].queue.length; i--;) {
            if (events[e].queue[i].uid === event) {
              events[e].queue.splice(i, 1)

              if (!events[e].queue.length) {
                delete events[e]
              }

              return event
            }
          }
        }
      }
    }

    if (typeof event === 'string') {
      if (typeof listener === 'function') {
        for (let i = events[event].queue.length; i--;) {
          if (events[event].queue[i].listener === listener) {
            events[event].queue.splice(i, 1)

            if (!events[event].queue.length) {
              delete events[event]
            }
            return event
          }
        }
      } else {
        delete events[event]
        return event
      }
    }

    return false
  }

  const once = (event, listener) => {
    on(event, function _listener () {
      listener()

      off(event, _listener)
    })
  }

  /**
   * Triggers all listeners of event.
   *
   * @param {string} event - Name of Event
   * @param {object} [data] - Data which will be passed to listeners. Can actually also be string, number or array. The listener should simply be able to handle the passed data.
   */
  const trigger = (event, data) => {
    if (!events[event] || !events[event].queue.length) {
      return
    }

    // Cycle through topics queue, fire!
    events[event].queue.forEach(function (item) {
      if (data) {
        item.listener(data)
      } else {
        item.listener()
      }
    })
  }

  return {
    // @if NODE_ENV='development'
    _events: events,
    // @endif
    on,
    off,
    once,
    trigger
  }
}
