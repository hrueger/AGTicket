import { Component } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-createTickets",
    styleUrls: ["./createTickets.component.scss"],
    templateUrl: "./createTickets.component.html",
})
export class CreateTicketsComponent {
    public guid: string;
    public name: string;
    public x: number = 10;
    public tickets: any = [];
    constructor(private remoteService: RemoteService, private alertService: AlertService) { }

    public ngOnInit() {
        this.guid = this.createGuid();
        this.addTickets();
    }

    public saveOne() {
        this.remoteService.getNoCache("post", "tickets", {tickets: [{name: this.name, guid: this.guid}]}).subscribe((res) => {
            if (res && res.status) {
                this.alertService.success("Erfolgreich gespeichert!");
                this.guid = this.createGuid();
                this.name = "";
            }
        });
    }

    public saveMany() {
        this.remoteService.getNoCache("post", "tickets", {tickets: this.tickets}).subscribe((res) => {
            if (res && res.status) {
                this.alertService.success("Erfolgreich gespeichert!");
                this.tickets = [];
                this.addTickets();
            }
        });
    }

    public addTickets() {
        for (let i = 0; i < this.x; i++) {
            this.tickets.push({name: "", guid: this.createGuid()});
        }
    }

    private createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}
