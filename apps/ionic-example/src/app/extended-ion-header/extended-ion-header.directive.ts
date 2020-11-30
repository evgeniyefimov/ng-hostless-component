import { ComponentFactory, ComponentFactoryResolver, Directive, Injector, Input } from "@angular/core";
import type { IonHeader as LazyComponent } from "@ionic/angular";

import { HostlessComponentDirective } from "ng-hostless-component";

@Directive({ selector: "[hcExtendedIonHeader]" })
export class ExtendedIonHeaderDirective extends HostlessComponentDirective<LazyComponent> {
  @Input()
  public hcExtendedIonHeader: unknown;

  @Input()
  public translucent: boolean;

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    injector: Injector,
  ) {
    super(injector);
  }

  public async getComponentFactory(): Promise<ComponentFactory<LazyComponent>> {
    const { IonHeader } = await import("@ionic/angular");

    return this.componentFactoryResolver.resolveComponentFactory(IonHeader);
  }
}
