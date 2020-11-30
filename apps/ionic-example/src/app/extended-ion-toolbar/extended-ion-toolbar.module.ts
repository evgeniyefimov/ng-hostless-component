import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";

import { ExtendedIonToolbarDirective } from "./extended-ion-toolbar.directive";

@NgModule({
  imports: [IonicModule],
  declarations: [ExtendedIonToolbarDirective],
  exports: [ExtendedIonToolbarDirective]
})
export class ExtendedIonToolbarModule {}
