import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { AuthModule } from '../../components/auth/auth.module';

import { LogsService } from './logs.service';
import { LogsComponent } from './logs.component';


const logsRoutes: Routes = [{
    path: 'hata-kayitlari',
    component: LogsComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        AuthModule,
        BrowserModule,
        FormsModule,
        RouterModule.forChild(logsRoutes),
        InfiniteScrollModule
    ],
    declarations: [
        LogsComponent,
    ],
    exports: [
        LogsComponent,
    ],
    providers: [
        LogsService
    ]
})
export class LogsModule { }
