// @flow
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type UnblockType = {
    username: string;
    profile?: {};
};

@Injectable()
export class UnblockService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get("/api/unblocks/count") as Observable<number>;
    }

    query(username = "", index = 1): Observable<UnblockType[]> {
        return this.http.get(
            `/api/unblocks/${username ? username : ""}?index=${index}`
        ) as Observable<UnblockType[]>;
    }

    create(unblock: UnblockType) {
        return this.http.post("/api/unblocks/", unblock);
    }

    hide(profile, unblocked?) {
        return this.http
            .post(`/api/unblocks/hide/${profile.id_str}`, {unblocked})
            .pipe(map(() => profile));
    } 

    remove(unblock) {
        return this.http
            .delete(`/api/unblocks/${unblock.id || unblock._id}`)
            .pipe(map(() => unblock));
    }
}
