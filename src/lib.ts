import {
  BasicManipulatorBuilder,
  duoLayer,
  FromEvent,
  LayerKeyParam,
  map as originalMap,
  toRemoveNotificationMessage,
  toSetVar,
} from "karabiner.ts";

const REGISTERED_MODE_VARIABLES = new Set<string>();

function registerModeVariable(name: string) {
  REGISTERED_MODE_VARIABLES.add(name);
}

export function createDuoLayer(
  key1: LayerKeyParam,
  key2: LayerKeyParam,
  name: string,
  onValue: number | string | boolean = 1,
  offValue: number | string | boolean = 0,
) {
  registerModeVariable(name);
  return duoLayer(key1, key2, name, onValue, offValue);
}

/**
 * Wrapping map to fix annoying type hint errors.
 */
export function map(event: FromEvent | string | number) {
  return originalMap(event);
}

export function withExitAllModes(builder: BasicManipulatorBuilder) {
  if (REGISTERED_MODE_VARIABLES.size === 0) {
    return builder;
  }

  const exitEvents = Array.from(REGISTERED_MODE_VARIABLES).flatMap((name) => [
    toSetVar(name, 0),
    toRemoveNotificationMessage(`duo-layer-${name}`),
  ]);

  return builder.to(exitEvents);
}
