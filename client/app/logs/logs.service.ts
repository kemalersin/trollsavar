
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

type LogsType = {
    user: {};
    error: String;
};

@Injectable()
export class LogsService {
    static parameters = [HttpClient];

    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get("/api/logs/count") as Observable<number>;
    }

    query(index = 1): Observable<LogsType[]> {
        return this.http.get(`/api/logs/?index=${index}`) as Observable<
            LogsType[]
        >;
    }
}
