import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../components/auth/auth.service';

@Component({
    selector: 'main',
    template: require('./main.pug'),
    styles: [require('./main.scss')],
})
export class MainComponent implements OnInit {
    isLoggedIn;

    static parameters = [AuthService];

    constructor(private authService: AuthService) {
        this.isLoggedIn = !!authService.getToken();

        this.authService.currentUserChanged.subscribe(user => {
            this.authService.isLoggedIn().then(is => {
                this.isLoggedIn = is;
            });
        });
    }

    ngOnInit() {
    }
}
