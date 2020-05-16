import { Component } from '@angular/core';

@Component({
    selector: 'oauth-buttons',
    template: require('./oauth-buttons.pug'),
    styles: [require('./oauth-buttons.scss')],
})
export class OauthButtonsComponent {
    loginOauth(provider) {
        window.location.href = `/auth/${provider}`;
    }
}
