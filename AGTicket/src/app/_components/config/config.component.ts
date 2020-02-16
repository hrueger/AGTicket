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
    constructor(private fb: FormBuilder, private remoteService: RemoteService, private configService: ConfigService, private alertService: AlertService) {}
    public configForm: FormGroup;
    public canValidate: boolean = false;
    public ngOnInit() {
        this.configForm = this.fb.group({
            title: ["", [Validators.required]],
            location: ["", [Validators.required]],
            date: ["", [Validators.required]],
            codeType: ["", [Validators.required]],
            idType: ["", [Validators.required]],
            ticketsX: ["", [Validators.required, Validators.min(1), Validators.max(10)]],
            ticketsY: ["", [Validators.required, Validators.min(1), Validators.max(20)]],
            ticketSpacing: ["", [Validators.required, Validators.min(0), Validators.max(50)]],
            contentSpacing: ["", [Validators.required, Validators.min(0), Validators.max(50)]],
        });
        setTimeout(async () => {
            const config = await this.configService.getConfig();
            this.configForm.get("title").setValue(config.title);
            this.configForm.get("location").setValue(config.location);
            this.configForm.get("date").setValue(config.date);
            this.configForm.get("codeType").setValue(config.codeType);
            this.configForm.get("idType").setValue(config.idType);
            this.configForm.get("ticketsX").setValue(config.ticketsX);
            this.configForm.get("ticketsY").setValue(config.ticketsY);
            this.configForm.get("ticketSpacing").setValue(config.contentSpacing);
            this.configForm.get("contentSpacing").setValue(config.ticketSpacing);
            this.canValidate = true;
        }, 0);
    }

    public save() {
        if (this.configForm.invalid) {
            this.alertService.warning("Formular ungültig!");
            return;
        }
        this.remoteService.get("post", "config", {
            title: this.configForm.get("title").value,
            location: this.configForm.get("location").value,
            date: this.configForm.get("date").value,
            codeType: this.configForm.get("codeType").value,
            idType: this.configForm.get("idType").value,
            ticketsX: this.configForm.get("ticketsX").value,
            ticketsY: this.configForm.get("ticketsY").value,
            ticketSpacing: this.configForm.get("ticketSpacing").value,
            contentSpacing: this.configForm.get("contentSpacing").value,
        }).subscribe((data) => {
            if (data && data.status) {
                this.alertService.success("Erfolgreich gespeichert!");
                this.configService.reload();
            }
        });
    }
}
