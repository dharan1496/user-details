import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppSharedService {

    constructor(private httpClient: HttpClient) { }

    fetchUsers(): Observable<any> {
        return this.httpClient.get('http://localhost:8080/users', { responseType: 'json' });
    }

    deleteUser(userid: string): Observable<any> {
        return this.httpClient.delete(`http://localhost:8080/deleteUser/${userid}`, { responseType: 'text' });
    }

    addUser(name: string): Observable<any> {
        return this.httpClient.post(`http://localhost:8080/addUser`, { name }, { responseType: 'json' });
    }

    updateUser(user: any): Observable<any>  {
        return this.httpClient.put(`http://localhost:8080/updateUser`, user, { responseType: 'json' });
    }
}