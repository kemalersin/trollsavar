import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { BlockService } from './block.service';
import { BlockComponent } from './block.component';

const BlockRoutes: Routes = [{
    path: 'engelliler/:username',
    component: BlockComponent,
    canActivate: [AuthGuard]
}, {
    path: 'engelliler',
    component: BlockComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forChild(BlockRoutes),
        TooltipModule.forRoot(),
        InfiniteScrollModule
    ],
    declarations: [
        BlockComponent
    ],
    exports: [
        BlockComponent
    ],
    providers: [
        BlockService
    ]
})
export class BlockModule { }
