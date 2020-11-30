import { ComponentFactory, ComponentFactoryResolver, Directive, Injector, Input } from "@angular/core";
import type { IonToolbar as LazyComponent } from "@ionic/angular";

import { HostlessComponentDirective } from "ng-hostless-component";

@Directive({ selector: "[hcExtendedIonToolbar]" })
export class ExtendedIonToolbarDirective extends HostlessComponentDirective<LazyComponent> {
  @Input()
  public hcExtendedIonToolbar: unknown;

  @Input()
  public translucent: boolean;

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    injector: Injector,
  ) {
    super(injector);
  }

  public async getComponentFactory(): Promise<ComponentFactory<LazyComponent>> {
    const { IonToolbar } = await import("@ionic/angular");

    return this.componentFactoryResolver.resolveComponentFactory(IonToolbar);
  }
}
