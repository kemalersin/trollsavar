import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../../components/auth/user.service';

@Component({
    selector: 'users',
    template: require('./users.pug'),
    styles: [require('./users.scss')],
})
export class UsersComponent implements OnInit {
    users: Object[];
    username = '';

    count = -1;

    static parameters = [Location, ActivatedRoute, Router, UserService];

    constructor(private location: Location, private route: ActivatedRoute,
        private router: Router, private userService: UserService) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.userService = userService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            let username = params.get('username');

            username ? this.count = 1 :
                this.userService.count().subscribe((count) => this.count = count);

            this.userService.query(username).subscribe(users => {
                this.users = Array.isArray(users) ? users : [users];
            });
        });
    }

    getUser() {
        if (!this.username) {
            return this.router.navigate(['/uyeler']);
        }

        return this.userService.get(this.username)
            .subscribe((users) => this.router.navigate([
                '/uyeler',
                users.length === 1 ?
                users[0].username : this.username
        ]));
    }
}
