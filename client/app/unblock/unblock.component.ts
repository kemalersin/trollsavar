import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { UnblockService } from "./unblock.service";

@Component({
    selector: "unblock",
    template: require("./unblock.pug"),
    styles: [require("./unblock.scss")],
})
export class UnblockComponent implements OnInit {
    username;
    unblocks: Object[];
    newUnblock = "";

    index = 1;
    count = -1;

    uploading;

    alert: any = new Ngxalert();

    static parameters = [ActivatedRoute, Router, ToastrService, UnblockService];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private unblockService: UnblockService
    ) {
        this.route = route;
        this.router = router;
        this.unblockService = unblockService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get("username");

            this.unblockService.query(this.username).subscribe((unblocks) => {
                this.unblocks = unblocks;

                this.username
                    ? (this.count = unblocks.length)
                    : this.unblockService.count().subscribe(
                          (count) => (this.count = count),
                          (error) => (this.count = 0)
                      );
            });
        });
    }

    onScroll() {
        this.unblockService
            .query(this.username, ++this.index)
            .subscribe((unblocks) => {
                this.unblocks = [...this.unblocks, ...unblocks];
            });
    }

    addUnblock() {
        if (this.newUnblock) {
            let unblock = this.newUnblock;
            this.newUnblock = "";

            return this.unblockService.create({ username: unblock }).subscribe(
                (unblocks) => {
                    if (this.username) {
                        return this.router.navigate(["/engel-kaldir"]);
                    }

                    if (Array.isArray(unblocks)) {
                        this.unblocks = [...unblocks, ...this.unblocks];
                        this.count += unblocks.length;
                    } else {
                        this.unblocks.unshift(unblocks);
                        this.count++;
                    }
                },
                (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            unblock = res.error.username;
                        }

                        return this.router.navigate(["/engel-kaldir", unblock]);
                    }

                    this.toastr.error(res.error);
                }
            );
        }
    }

    delete(unblock) {
        this.alert.create({
            id: "remove-user",
            title: "Kullanıcı Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-user");

                this.unblockService
                    .remove(unblock)
                    .subscribe((unblockedUser) => {
                        this.count--;
                        this.unblocks.splice(
                            this.unblocks.indexOf(unblockedUser),
                            1
                        );
                    });
            },
        });
    }
}
