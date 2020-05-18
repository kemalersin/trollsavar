import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { BlockService } from './block.service';

@Component({
    selector: 'block',
    template: require('./block.pug'),
    styles: [require('./block.scss')],
})
export class BlockComponent implements OnInit {
    username;
    blocks: Object[];
    newBlock = '';

    index = 1;
    count = -1;

    static parameters = [Location, ActivatedRoute, Router, BlockService];

    constructor(private location: Location, private route: ActivatedRoute, private router: Router,
        private blockService: BlockService) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.blockService = blockService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');

            this.blockService.query(this.username).subscribe((blocks) => {
                this.blocks = blocks;

                this.username ? this.count = blocks.length :
                    this.blockService.count().subscribe((count) => this.count = count);
            });
        });
    }

    onScroll() {
        this.blockService.query(this.username, ++this.index).subscribe((blocks) => {
            this.blocks = [...this.blocks, ...blocks];
        });
    }

    addBlock() {
        if (this.newBlock) {
            let block = this.newBlock;
            this.newBlock = '';

            return this.blockService.create({ username: block })
                .subscribe((block) => {
                    this.username ? this.router.navigate(['/engelliler']) :
                        this.blocks.unshift(block);

                    this.count++;
                }, (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            block = res.error.username
                        }

                        return this.router.navigate(['/engelliler', block]);
                    }

                    alert(res.error)
                });
        }
    }

    delete(block) {
        if (!confirm("Emin misiniz?")) {
            return;
        }

        this.blockService.remove(block).subscribe(blockedUser => {
            this.count--;
            this.blocks.splice(this.blocks.indexOf(blockedUser), 1);
        });
    }
}
