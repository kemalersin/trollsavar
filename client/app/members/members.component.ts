import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { MembersService } from './members.service';

@Component({
    selector: 'members',
    template: require('./members.pug'),
    styles: [require('./members.scss')],
})
export class MembersComponent implements OnInit {
    username;
    members: Object[];
    newMember = '';

    count = -1;

    static parameters = [Location, ActivatedRoute, Router, MembersService];

    constructor(private location: Location, private route: ActivatedRoute, private router: Router,
        private membersService: MembersService) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.membersService = membersService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');

            this.username ? this.count = 1 :
                this.membersService.count().subscribe((count) => this.count = count);

            this.membersService.query(this.username).subscribe((members) => {
                this.members = members;
            });
        });
    }

    addMember() {
        if (this.newMember) {
            let members = this.newMember;
            this.newMember = '';

            return this.membersService.create({ username: members })
                .subscribe((members) => {
                    this.username ? this.router.navigate(['/engelliler']) :
                        this.members.unshift(members);

                    this.count++;
                }, (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            members = res.error.username
                        }

                        return this.router.navigate(['/engelliler', members]);
                    }

                    alert(res.error)
                });
        }
    }

    delete(member) {
        if (!confirm("Emin misiniz?")) {
            return;
        }

        this.membersService.remove(member).subscribe(member => {
            this.count--;
            this.members.splice(this.members.indexOf(member), 1);
        });
    }
}
