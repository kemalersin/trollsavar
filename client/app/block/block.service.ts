// @flow
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type BlockType = {
    username: string;
    profile?: {}
};

@Injectable()
export class BlockService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get('/api/blocks/count') as Observable<number>;
    }

    query(username): Observable<BlockType[]> {
        return this.http.get(`/api/blocks/${username ? username : ""}`) as Observable<BlockType[]>;
    }

    create(block: BlockType) {
        return this.http.post('/api/blocks/', block);
    }

    remove(block) {
        return this.http.delete(`/api/blocks/${block.id || block._id}`)
            .pipe(map(() => block));
    }
}
