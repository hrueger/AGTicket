import { Component, ViewChild } from "@angular/core";
import { ZXingScannerComponent } from "@zxing/ngx-scanner"
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";
import { FastTranslateService } from "../../_services/fast-translate.service";

@Component({
    selector: "app-scan",
    styleUrls: ["./scan.component.scss"],
    templateUrl: "./scan.component.html",
})
export class ScanComponent {
    @ViewChild("scanner") public scanner: ZXingScannerComponent;
    private checking: boolean = false;
    private ticketsDone: string[] = [];
    constructor(private alertService: AlertService, private remoteService: RemoteService, private fts: FastTranslateService) {}

    public async camerasFoundHandler(event) {
        this.alertService.info(await this.fts.t("general.camerasFound"));
    }
    public camerasNotFoundHandler(event) {
        this.alertService.error(event.toString());
    }
    public scanSuccessHandler(data: string) {
        if (!this.checking && !this.ticketsDone.includes(data)) {
            this.checking = true;
            this.remoteService.getNoCache("post", `tickets/${data}/activate`).subscribe(async (res) => {
                if (res) {
                    if (res.status === true) {
                        this.alertService.success(await this.fts.t("general.ticketActivatedSuccessfully"));
                    } else {
                        this.alertService.error(res.status);
                    }
                }
                this.checking = false;
                this.ticketsDone.push(data);
            });
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
