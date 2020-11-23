import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { UnblockService } from './unblock.service';
import { UnblockComponent } from './unblock.component';

const UnblockRoutes: Routes = [{
    path: 'engel-kaldir/:username',
    component: UnblockComponent,
    canActivate: [AuthGuard]
}, {
    path: 'engel-kaldir',
    component: UnblockComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forChild(UnblockRoutes),
        TooltipModule.forRoot(),
        InfiniteScrollModule
    ],
    declarations: [
        UnblockComponent
    ],
    exports: [
        UnblockComponent
    ],
    providers: [
        UnblockService
    ]
})
export class UnblockModule { }
