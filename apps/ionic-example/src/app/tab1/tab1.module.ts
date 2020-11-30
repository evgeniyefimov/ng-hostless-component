import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { Tab1Page } from "./tab1.page";
import { ExploreContainerComponentModule } from "../explore-container/explore-container.module";
import { ExtendedIonHeaderModule } from "../extended-ion-header/extended-ion-header.module";
import { ExtendedIonToolbarModule } from "../extended-ion-toolbar/extended-ion-toolbar.module";

import { Tab1PageRoutingModule } from "./tab1-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ExtendedIonHeaderModule,
    ExtendedIonToolbarModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}
