import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/auth/auth-guard.service';
import { AuthModule } from '../../components/auth/auth.module';
import { MembersComponent } from './members.component';


const membersRoutes: Routes = [{
    path: 'uyeler',
    component: MembersComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        AuthModule,
        BrowserModule,
        RouterModule.forChild(membersRoutes),

    ],
    declarations: [
        MembersComponent,
    ],
    exports: [
        MembersComponent,
    ],
})
export class MembersModule {}
