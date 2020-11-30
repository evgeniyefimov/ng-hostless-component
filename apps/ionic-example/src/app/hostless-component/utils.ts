import { EventEmitter, SimpleChange, SimpleChanges } from "@angular/core";
import { tap } from "rxjs/operators";

//#region https://github.com/microsoft/TypeScript/pull/12253#issuecomment-353494273
export type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T];

export type Entries<T> = Entry<T>[];

export function objectEntries<T>(object: T): Entries<T> {
  return Object.entries(object) as Entries<T>;
}
//#endregion

//#region https://github.com/angular/angular/issues/17560
export type SimpleChangeTyped<T> = Omit<SimpleChange, SimpleChange["previousValue"] | SimpleChange["currentValue"]> & {
  previousValue: T;
  currentValue: T;
};

export type SimpleChangesTyped<T> = {
  [K in keyof T]: SimpleChangeTyped<T[K]>;
} & SimpleChanges;
//#endregion

export function mapAndPatchChanges<Host, Child>(simpleChanges: SimpleChangesTyped<Host>, child: Child): void {
  for (const [key, simpleChange] of objectEntries(simpleChanges)) {
    (child as any)[key] = simpleChange.currentValue;
  }

}

export function mapAndBindOutputs<Host, Child>(host: Host, child: Child): EventEmitter<unknown>[] {
  return objectEntries(child)
    .reduce<ReadonlyArray<{ key: keyof Child, value: EventEmitter<unknown> }>>((result, [key, value]) => {
      if (value instanceof EventEmitter) {
        return [...result, { key, value }];
      }

      return result;
    }, [])
    .map((componentEntry) => {
      const thisEventEmitter = objectEntries(host).reduce<EventEmitter<unknown> | undefined>((result, [key, value]) => {
        if (key.toString() === componentEntry.key.toString() && value instanceof EventEmitter) {
          return value;
        }

        return result;
      }, undefined);

      if (!thisEventEmitter) {
        return undefined;
      }

      return componentEntry.value.pipe(tap((payload) => {
        thisEventEmitter.emit(payload);
      }));
    })
    .filter((eventEmitter$): eventEmitter$ is EventEmitter<unknown> => !!eventEmitter$)
}
