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
  ConditionBuilder,
  toRemoveNotificationMessage,
} from "karabiner.ts";

const MODES: BuildableMode<any>[] = [];

function allModeConditions() {
  return MODES.map((m) => mode.name).map((m) => ifVar(m));
}

export function withExitAllModes(b: BasicManipulatorBuilder) {
  return b.to(
    MODES.flatMap((m) => [
      toSetVar(mode.name, 0),
      toRemoveNotificationMessage(`${mode.name}-mode-notification`),
    ]),
  );
}

/**
 * Wrapping map to fix annoying type hint errors.
 *
 * Might do something with it later too
 */
export function map(event: FromEvent | string | number) {
  return originalMap(event);
}

export const withModeEnter = (
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

export const withModeExit = (
  mode: string,
  builder: BasicManipulatorBuilder,
) => {
  return withCondition(ifVar(mode))([
    builder
      .toAfterKeyUp(toSetVar(mode, 0))
      .toRemoveNotificationMessage(`${mode}-mode-notification`),
  ]);
};

export const withModeExitKeys = (
  mode: string,
  ...builder: BasicManipulatorBuilder[]
) => {
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

export type ModeProps<ActionType> = {
  name: string;
  description: string;
  hint?: string;
  triggers: BasicManipulatorBuilder[] | never[];
  manipulators: BasicManipulatorBuilder[] | never[];
  mappingConditions?: ConditionBuilder[];
  triggerConditions?: ConditionBuilder[];
  isOneShotMode?: boolean;
  oneShotKeys?: BasicManipulatorBuilder[];
};

export type Mode<ActionType> = {
  addTrigger: (manupulator: BasicManipulatorBuilder) => BasicManipulatorBuilder;
  addMapping: (manupulator: BasicManipulatorBuilder) => void;
  withExit: (b: BasicManipulatorBuilder) => Manipulator[] | ManipulatorBuilder;
};

export type BuildableMode<ActionType> = Mode<ActionType> & {
  build: () => RuleBuilder[];
};

export function mode<ActionType>(
  mode: ModeProps<ActionType>,
): BuildableMode<ActionType> {
  let triggers: BasicManipulatorBuilder[] = [];
  let manipulators: (
    | BasicManipulatorBuilder
    | (Manipulator[] & ManipulatorBuilder)
  )[] = [];
  const oneShotKeysSet = new Set(mode.oneShotKeys || []);
  let finalMode: Mode<ActionType> = {
    addTrigger: (b: BasicManipulatorBuilder) => {
      let trigger = withModeEnter(mode.name, mode.hint, b)[0];
      triggers.push(trigger);
      return trigger;
    },
    addMapping: (b: BasicManipulatorBuilder) => {
      if (mode.isOneShotMode === true || oneShotKeysSet.has(b)) {
        manipulators.push(withModeExit(mode.name, b));
      } else {
        manipulators.push(b);
      }
    },
    withExit: (b: BasicManipulatorBuilder) => withModeExit(mode.name, b),
  };

  mode.triggers.forEach(finalMode.addTrigger);
  mode.manipulators.forEach(finalMode.addMapping);
  if (mode.oneShotKeys) {
    mode.oneShotKeys.forEach(finalMode.addMapping);
  }

  const build = () => {
    let triggersRule = rule(
      `${mode.name}: ${mode.description}`,
      ...(mode.triggerConditions ? mode.triggerConditions : []),
    ).manipulators(triggers);

    return [
      triggersRule,
      rule(
        `Key assignments for ${mode.name}`,
        ...(mode.mappingConditions ? mode.mappingConditions : []),
      ).manipulators(manipulators),
      rule(`Escape ${mode.name}`).manipulators([
        withModeExit(mode.name, map("escape")),
      ]),
    ];
  };

  let buildableMode = {
    ...finalMode,
    build,
  };
  MODES.push(buildableMode);
  return buildableMode;
}
