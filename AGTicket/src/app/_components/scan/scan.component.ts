import { Component, ViewChild } from "@angular/core";
import { ZXingScannerComponent } from "@zxing/ngx-scanner"
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-scan",
    styleUrls: ["./scan.component.scss"],
    templateUrl: "./scan.component.html",
})
export class ScanComponent {
    @ViewChild("scanner") public scanner: ZXingScannerComponent;
    private checking: boolean = false;
    private ticketsDone: string[] = [];
    constructor(private alertService: AlertService, private remoteService: RemoteService) {}

    public camerasFoundHandler(event) {
        this.alertService.info("Kameras wurden gefunden, bitte die Berechtigngsanfrage akzeptieren!");
    }
    public camerasNotFoundHandler(event) {
        this.alertService.error(event.toString());
    }
    public scanSuccessHandler(data: string) {
        if (!this.checking && !this.ticketsDone.includes(data)) {
            if (new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(data)) {
                this.checking = true;
                this.remoteService.getNoCache("post", `tickets/${data}/activate`).subscribe((res) => {
                    if (res) {
                        if (res.status === true) {
                            this.alertService.success("Ticket erfolgreich deaktivert!");
                        } else {
                            this.alertService.error(res.status);
                        }
                    }
                    this.checking = false;
                    this.ticketsDone.push(data);
                });
            } else {
                this.alertService.error("not valid");
            }
        }
    }
    public scanErrorHandler(event) {
        this.alertService.error(event.toString());
    }
    public scanFailureHandler(event) {
        // console.log(event);
    }
    public scanCompleteHandler(event) {
        // console.log(event);
    }
}
