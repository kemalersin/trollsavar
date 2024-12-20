import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { BlockService } from "./block.service";

@Component({
    selector: "block",
    template: require("./block.pug"),
    styles: [require("./block.scss")],
})
export class BlockComponent implements OnInit {
    username;
    blocks: Object[];
    newBlock = "";

    index = 1;
    count = -1;

    uploading;

    alert: any = new Ngxalert();

    @ViewChild("fileInput") fileInput: ElementRef;

    static parameters = [ActivatedRoute, Router, ToastrService, BlockService];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private blockService: BlockService
    ) {
        this.route = route;
        this.router = router;
        this.blockService = blockService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get("username");

            this.blockService.query(this.username).subscribe((blocks) => {
                this.blocks = blocks;

                this.username
                    ? (this.count = blocks.length)
                    : this.blockService.count().subscribe(
                          (count) => (this.count = count),
                          (error) => (this.count = 0)
                      );
            });
        });
    }

    onScroll() {
        this.blockService
            .query(this.username, ++this.index)
            .subscribe((blocks) => {
                this.blocks = [...this.blocks, ...blocks];
            });
    }

    addBlock() {
        if (this.newBlock) {
            let block = this.newBlock;
            this.newBlock = "";

            return this.blockService.create({ username: block }).subscribe(
                (blocks) => {
                    if (this.username) {
                        return this.router.navigate(["/engelliler"]);
                    }

                    if (Array.isArray(blocks)) {
                        this.blocks = [...blocks, ...this.blocks];
                        this.count += blocks.length;
                    } else {
                        this.blocks.unshift(blocks);
                        this.count++;
                    }
                },
                (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            block = res.error.username;
                        }

                        return this.router.navigate(["/engelliler", block]);
                    }

                    this.toastr.error(res.error);
                }
            );
        }
    }

    delete(block) {
        this.alert.create({
            id: "remove-user",
            title: "Kullanıcı Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-user");

                this.blockService.remove(block).subscribe((blockedUser) => {
                    this.count--;
                    this.blocks.splice(this.blocks.indexOf(blockedUser), 1);
                });
            },
        });
    }

    onFileChanged(event) {
        const fileList: FileList = event.target.files;

        if (fileList.length == 0) {
            return;
        }

        const file: File = fileList[0];

        const list = () => {
            this.blockService
                .query()
                .subscribe((blocks) => (this.blocks = blocks));
        };

        this.uploading = true;

        const timerId = setInterval(list, 1000);

        this.blockService
            .upload(file)
            .pipe(
                finalize(() => {
                    clearInterval(timerId);

                    this.blockService.count().subscribe((count) => {
                        this.count = count;
                        this.uploading = false;
                    });
                })
            )
            .subscribe(() => {
                list();
            });
    }
}
