import { Component, OnInit } from '@angular/core';

import { LogsService } from './logs.service';

@Component({
    selector: 'logs',
    template: require('./logs.pug'),
    styles: [require('./logs.scss')],
})
export class LogsComponent implements OnInit {
    logs: Object[];

    count = -1;
    index = 0;

    static parameters = [LogsService];

    constructor(private logsService: LogsService) {
        this.logsService = logsService;
    }

    ngOnInit() {
        this.onScroll();
    }

    onScroll() {
        this.logsService.query(++this.index).subscribe((logs) => {
            this.logs = [...this.logs, ...logs];
        });
    }
}
