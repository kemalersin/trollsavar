import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { RandomComponent } from "./random.component";

const randomRoutes: Routes = [
    {
        path: "rastgele",
        component: RandomComponent,
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild(randomRoutes)        
    ],
    exports: [RandomComponent],
    declarations: [RandomComponent],
})
export class RandomModule {}
