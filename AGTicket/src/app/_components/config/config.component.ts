import { Component } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { ConfigService } from "../../_services/config.service";

@Component({
    selector: "app-config",
    styleUrls: ["./config.component.scss"],
    templateUrl: "./config.component.html",
})
export class ConfigComponent {
    public updating: boolean = false;
    constructor(private fb: FormBuilder, private remoteService: RemoteService, private configService: ConfigService, private alertService: AlertService) {}
    public configForm: FormGroup;
    public updates: any = {};
    public canValidate: boolean = false;
    public ngOnInit() {
        this.configService.reload();
        this.remoteService.get("get", "config/checkForUpdates").subscribe((data) => {
            this.updates = data.data;
        });
        this.configForm = this.fb.group({
            codeType: ["", [Validators.required]],
            idType: ["", [Validators.required]],
            ticketsX: ["", [Validators.required, Validators.min(1), Validators.max(10)]],
            ticketsY: ["", [Validators.required, Validators.min(1), Validators.max(20)]],
            ticketSpacing: ["", [Validators.required, Validators.min(0), Validators.max(50)]],
            borderWidth: ["", [Validators.required, Validators.min(0), Validators.max(50)]],
        });
        setTimeout(async () => {
            const config = await this.configService.getConfig();
            this.configForm.get("codeType").setValue(config.codeType);
            this.configForm.get("idType").setValue(config.idType);
            this.configForm.get("ticketsX").setValue(config.ticketsX);
            this.configForm.get("ticketsY").setValue(config.ticketsY);
            this.configForm.get("ticketSpacing").setValue(config.ticketSpacing);
            this.configForm.get("borderWidth").setValue(config.borderWidth);
            this.canValidate = true;
        }, 0);
    }

    public update() {
        this.remoteService.get("post", "config/update").subscribe((res) => {
            this.updating = true;
        });
        setTimeout(() => {
            location.reload();
        }, 10000);
    }

    public save() {
        if (this.configForm.invalid) {
            this.alertService.warning("Formular ungültig!");
            return;
        }
        this.remoteService.get("post", "config", {
            codeType: this.configForm.get("codeType").value,
            idType: this.configForm.get("idType").value,
            ticketsX: this.configForm.get("ticketsX").value,
            ticketsY: this.configForm.get("ticketsY").value,
            ticketSpacing: this.configForm.get("ticketSpacing").value,
            borderWidth: this.configForm.get("borderWidth").value,
        }).subscribe((data) => {
            if (data && data.status) {
                this.alertService.success("Erfolgreich gespeichert!");
                this.configService.reload();
            }
        });
    }
}
