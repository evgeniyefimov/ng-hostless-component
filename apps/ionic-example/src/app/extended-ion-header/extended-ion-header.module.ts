import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";

import { ExtendedIonHeaderDirective } from "./extended-ion-header.directive";

@NgModule({
  imports: [IonicModule],
  declarations: [ExtendedIonHeaderDirective],
  exports: [ExtendedIonHeaderDirective]
})
export class ExtendedIonHeaderModule {}
