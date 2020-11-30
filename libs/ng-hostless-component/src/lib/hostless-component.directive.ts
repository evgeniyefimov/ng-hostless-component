import {
  ChangeDetectorRef,
  ComponentFactory,
  ComponentRef,
  Directive,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { combineLatest, from, merge, Observable, ReplaySubject, Subscription } from "rxjs";
import { map, mergeMap, shareReplay } from "rxjs/operators";

import { mapAndBindOutputs, SimpleChangesTyped } from "./utils";

@Directive()
export abstract class HostlessComponentDirective<T> implements OnChanges, OnDestroy, OnInit {
  private readonly componentRef$: Observable<ComponentRef<T>>;
  private readonly simpleChanges$: Observable<SimpleChangesTyped<this>>;

  private readonly simpleChangesSource = new ReplaySubject<SimpleChangesTyped<this>>(1);

  private readonly subscription = new Subscription();

  constructor(
    private readonly injector: Injector,
  ) {
    this.componentRef$ = this.connectComponentRef();
    this.simpleChanges$ = this.simpleChangesSource.asObservable();
  }

  public ngOnChanges(simpleChanges: SimpleChangesTyped<this>): void {
    this.simpleChangesSource.next(simpleChanges);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
    this.useEffectPatchLazyComponentInputs();
    this.useEffectListenLazyComponentOutputs();
  }

  protected abstract getComponentFactory(): Promise<ComponentFactory<T>>;

  private connectComponentRef(): Observable<ComponentRef<T>> {
    return from(this.getComponentFactory())
      .pipe(
        map((componentFactory) => {
          const viewContainerRef = this.injector.get(ViewContainerRef);
          const embeddedView = this.injector.get(TemplateRef).createEmbeddedView({});
          embeddedView.detectChanges();

          const projectableNodes = this.getNgContent(embeddedView.rootNodes, componentFactory.ngContentSelectors);

          return viewContainerRef.createComponent(componentFactory, undefined, this.injector, [projectableNodes]);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  // https://stackoverflow.com/a/61890918/7251821
  private getNgContent(nodeList: ReadonlyArray<unknown>, ngContentSelectors: ReadonlyArray<string>): unknown[][] {
    const projectableNodes: ReadonlyArray<{ nodes: unknown[], selector: string }> = ngContentSelectors
      .map((selector) => {
        return {
          nodes: [],
          selector,
        };
      });

    return nodeList
      .reduce<typeof projectableNodes>(
        (result, node) => {
          return result.map((projectableNode) => {
            const isWildcard = projectableNode.selector === "*";
            const isMatched = node instanceof Element && node.matches(projectableNode.selector);
            const passed = isMatched || (isWildcard && !isMatched);

            if (passed) {
              return {
                ...projectableNode,
                nodes: [...projectableNode.nodes, node],
              }
            }

            return projectableNode;
          });
        },
        projectableNodes,
      )
      .map((projectableNode) => {
        return projectableNode.nodes;
      });
  }

  private useEffectPatchLazyComponentInputs(): void {
    const effect$ = combineLatest([this.componentRef$, this.simpleChanges$])
      .subscribe(([componentRef, simpleChanges]) => {
        for (const [key, simpleChange] of Object.entries(simpleChanges)) {
          (componentRef.instance as any)[key] = simpleChange.currentValue;
        }

        // https://github.com/angular/angular/issues/18817
        componentRef.injector.get(ChangeDetectorRef).detectChanges();
      });

    this.subscription.add(effect$);
  }

  private useEffectListenLazyComponentOutputs(): void {
    const effect$ = this.componentRef$
      .pipe(
        mergeMap((componentRef) => {
          const eventEmitters = mapAndBindOutputs(this, componentRef.instance);

          return merge(...eventEmitters);
        }),
      )
      .subscribe();

    this.subscription.add(effect$);
  }
}
