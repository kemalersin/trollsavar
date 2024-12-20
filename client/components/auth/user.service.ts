// @flow
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type UserType = {
    // TODO: use Mongoose model
    id?: string;
    _id?: string;
    username?: string;
    email?: string;
};

@Injectable()
export class UserService {
    static parameters = [HttpClient];

    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get("/api/users/count") as Observable<number>;
    }

    query(username, index = 1): Observable<UserType[]> {
        return this.http.get(
            `/api/users/${username ? username : ""}?index=${index}`
        ) as Observable<UserType[]>;
    }

    get(username): Observable<UserType[]> {
        return this.http.get(
            `/api/users/${username ? username : "me"}`
        ) as Observable<UserType[]>;
    }

    create(user: UserType, captcha) {
        return this.http.post("/api/users/", { user, captcha });
    }

    sendPasswordResetCode(email, captcha) {
        return this.http.post("/api/users/password-reset", { email, captcha });
    }

    resetPassword(email, password, code, captcha) {
        return this.http.post("/api/users/password-reset", {
            email,
            password,
            code,
            captcha,
        });
    }

    logout() {
        return this.http.get("/api/users/logout");
    }

    changeUsername(user, username, name) {
        return this.http.put(`/api/users/${user.id || user._id}/username`, {
            username,
            name,
        });
    }    

    changePassword(user, oldPassword, newPassword) {
        return this.http.put(`/api/users/${user.id || user._id}/password`, {
            oldPassword,
            newPassword,
        });
    }

    remove(user) {
        return this.http
            .delete(`/api/users/${user.id || user._id}`)
            .pipe(map(() => user));
    }
}
