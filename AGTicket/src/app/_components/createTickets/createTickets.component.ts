import { Component } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { ConfigService } from "../../_services/config.service";

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
    constructor(private remoteService: RemoteService, private alertService: AlertService, private configService: ConfigService) { }

    public async ngOnInit() {
        this.guid = await this.createGuid();
        this.addTickets();
    }

    public saveOne() {
        this.remoteService.getNoCache("post", "tickets", {tickets: [{name: this.name, guid: this.guid}]}).subscribe(async (res) => {
            if (res && res.status) {
                this.alertService.success("Erfolgreich gespeichert!");
                this.guid = await this.createGuid();
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

    public async addTickets() {
        for (let i = 0; i < this.x; i++) {
            this.tickets.push({name: "", guid: await this.createGuid()});
        }
    }

    private async createGuid() {
        const config = await this.configService.getConfig();
        if (config.idType == "guid") {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                // tslint:disable-next-line: no-bitwise
                const r = Math.random() * 16 | 0;
                // tslint:disable-next-line: no-bitwise
                const v = c == "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } else if (config.idType == "numbers") {
            return "xxxxxxxxxxxx".replace(/[x]/g, (c) => {
                return Math.floor(Math.random() * 10).toString();
            });
        } else if (config.idType == "letters") {
            let result           = '';
            const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < 12; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    }

}
