import {
  BasicManipulatorBuilder,
  FromEvent,
  ifApp,
  ifVar,
  layer,
  Manipulator,
  ManipulatorBuilder,
  map as originalMap,
  mapDoubleTap,
  mapSimultaneous,
  NumberKeyValue,
  rule,
  RuleBuilder,
  toSetVar,
  withCondition,
  withMapper,
  writeToProfile,
} from "karabiner.ts";

/**
 * Wrapping map to fix annoying type hint errors.
 *
 * Might do something with it later too
 */
export function map(event: FromEvent | string | number) {
  return originalMap(event);
}

const modeTriggers = (
  mode: string,
  message?: string,
  ...manipulators: BasicManipulatorBuilder[]
) =>
  manipulators.map((b) => {
    let it = b.toVar(mode);
    return message
      ? it.toNotificationMessage(`${mode}-mode-notification`, message)
      : it;
  });

const withModeExit = (mode: string, builder: BasicManipulatorBuilder) => {
  return withCondition(ifVar(mode))([
    builder
      .toAfterKeyUp(toSetVar(mode, 0))
      .toRemoveNotificationMessage(`${mode}-mode-notification`),
  ]);
};

const withModeKeys = (mode: string, ...builder: BasicManipulatorBuilder[]) => {
  return builder.map((b) => withModeExit(mode, b));
};

export type Binding<ActionType> = {
  key: FromEvent | string | number;
  // what info is required will depend on what the node is doing
  actionData: ActionType;
};

export type BindingMap<ActionType> = {
  [key: string | number]: ActionType;
};

export type Mode<ActionType> = {
  name: string;
  description: string;
  hint?: string;
  triggers: BasicManipulatorBuilder[];
  manipulators: BasicManipulatorBuilder[];
};

export function mode<ActionType>(mode: Mode<ActionType>): RuleBuilder[] {
  let triggersManipulators = modeTriggers(
    mode.name,
    mode.hint,
    ...mode.triggers,
  );
  let triggersRule = rule(`${mode.name}: ${mode.description}`).manipulators(
    triggersManipulators,
  );
  return [
    triggersRule,
    rule(`Key assignments for ${mode.name}`).manipulators(
      mode.manipulators.map((b) => withModeExit(mode.name, b)),
    ),
    rule(`Escape ${mode.name}`).manipulators([
      withModeExit(mode.name, map("escape")),
    ]),
  ];
}
