import { Component } from '@angular/core';
import { UserService } from '../../components/auth/user.service';

@Component({
    selector: 'members',
    template: require('./members.pug'),
    styles: [require('./members.scss')],
})
export class MembersComponent {
    users: Object[];

    static parameters = [UserService];

    constructor(private userService: UserService) {
        this.userService = userService;
        this.userService.query().subscribe(users => {
            this.users = users;
        });
    }
}
