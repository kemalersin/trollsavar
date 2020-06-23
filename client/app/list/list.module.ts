import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { ListComponent } from "./list.component";

const listRoutes: Routes = [
    {
        path: "listem",
        component: ListComponent,
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild(listRoutes)        
    ],
    exports: [ListComponent],
    declarations: [ListComponent],
})
export class ListModule {}
