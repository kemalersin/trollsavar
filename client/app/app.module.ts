import {
    NgModule,
    ApplicationRef,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {
    removeNgStyles,
    createNewHosts,
    createInputTransfer,
} from '@angularclass/hmr';

import { RouterModule, Routes } from '@angular/router';

import { ToastrModule } from "ngx-toastr";
import { NgxDialogsModule } from "ngx-dialogs";

import { AppComponent } from './app.component';
import { MainModule } from './main/main.module';
import { LoginModule } from "./login/login.module";
import { RegisterModule } from "./register/register.module";
import { SettingsModule } from "./settings/settings.module";
import { RandomModule } from "./random/random.module";
import { ListModule } from "./list/list.module";
import { PasswordResetModule } from "./password/password.reset/password.reset.module";

import { DirectivesModule } from '../components/directives.module';

import { JwtModule } from '@auth0/angular-jwt';

import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';
import { BlockModule } from './block/block.module';
import { UnblockModule } from './unblock/unblock.module';
import { LogsModule } from './logs/logs.module';

export function tokenGetter() {
    return localStorage.getItem('id_token');
}

const appRoutes: Routes = [{
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
},
{ path: "**", redirectTo: "/" }];

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                tokenGetter,
            }
        }),

        RouterModule.forRoot(appRoutes, { enableTracing: process.env.NODE_ENV === 'development' }),
        MainModule,
        LoginModule,
        RegisterModule, 
        SettingsModule,   
        PasswordResetModule,            
        DirectivesModule,
        MembersModule,
        UsersModule,
        BlockModule,
        UnblockModule,
        LogsModule,
        RandomModule,
        ListModule,
        NgxDialogsModule,
        ToastrModule.forRoot({
            timeOut: 2500,
            progressBar: true,
            preventDuplicates: true,
            positionClass: "toast-top-center",
        })
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {
    static parameters = [ApplicationRef];
    constructor(private appRef: ApplicationRef) {
        this.appRef = appRef;
    }

    hmrOnInit(store) {
        if (!store || !store.state) return;
        console.log('HMR store', store);
        console.log('store.state.data:', store.state.data);
        // inject AppStore here and update it
        // this.AppStore.update(store.state)
        if ('restoreInputValues' in store) {
            store.restoreInputValues();
        }
        // change detection
        this.appRef.tick();
        Reflect.deleteProperty(store, 'state');
        Reflect.deleteProperty(store, 'restoreInputValues');
    }

    hmrOnDestroy(store) {
        var cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
        // recreate elements
        store.disposeOldHosts = createNewHosts(cmpLocation);
        // inject your AppStore and grab state then set it on store
        // var appState = this.AppStore.get()
        store.state = { data: 'yolo' };
        // store.state = Object.assign({}, appState)
        // save input values
        store.restoreInputValues = createInputTransfer();
        // remove styles
        removeNgStyles();
    }

    hmrAfterDestroy(store) {
        // display new elements
        store.disposeOldHosts();
        Reflect.deleteProperty(store, 'disposeOldHosts');
        // anything you need done the component is removed
    }
}
