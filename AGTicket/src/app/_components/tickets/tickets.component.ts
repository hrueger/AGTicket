import { Component, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { PageSettingsModel, GridComponent, SelectionSettingsModel, EditSettingsModel, ColumnModel, Column, SaveEventArgs, EditEventArgs, DialogEdit } from "@syncfusion/ej2-angular-grids";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "../../_services/alert.service";
import { DatePipe } from "@angular/common";
import { FastTranslateService } from "../../_services/fast-translate.service";

@Component({
    selector: "app-tickets",
    styleUrls: ["./tickets.component.scss"],
    templateUrl: "./tickets.component.html",
})
export class TicketsComponent {
    public tickets: any = [];
    public pageSettings: PageSettingsModel = {pageSizes: [10, 50, 100, 500, 1000, 5000, 10000], pageSize: 10};
    public selectionOptions: SelectionSettingsModel = {type: "Multiple", checkboxOnly: false};
    public editSettings: EditSettingsModel = {allowEditing: true, mode: "Dialog"};
    @ViewChild("grid") public grid: GridComponent;
    public rowsSelected: number = 0;
    public printing: boolean = false;
    public deleting: boolean;
    private refreshed: boolean = false;
    private translations: any = {};

    constructor(private remoteService: RemoteService,
        private httpClient: HttpClient,
        private alertService: AlertService,
        private datePipe: DatePipe,
        private fts: FastTranslateService) {}

    public async ngOnInit() {
        this.remoteService.get("get", "tickets").subscribe((res) => {
            if (res) {
                this.tickets = res;
            }
        });
        this.translations.yes = await this.fts.t("general.yes");
        this.translations.no = await this.fts.t("general.no");
        this.translations.createdAt = await this.fts.t("general.created");
        this.translations.updatedAt = await this.fts.t("general.updated");
        this.translations.number = await this.fts.t("general.number");
        this.translations.name = await this.fts.t("general.name");
        this.translations.activated = await this.fts.t("general.activated");
        this.translations.editTicket = await this.fts.t("general.editTicket");
        setTimeout(() => {
            this.grid.rowDeselected.subscribe(() => {
                this.rowsSelected = this.grid.getSelectedRows().length;
            });
            this.grid.rowSelected.subscribe(() => {
                this.rowsSelected = this.grid.getSelectedRows().length;
            });
        }, 10);
    }

    public async dataBound(args: any) {
        if (this.refreshed) {
            return;
        } else {
            this.refreshed = true;
        }
        for (const col of (this.grid.columns as ColumnModel[])) {
            if (col.field === "id") {
                col.visible = false;
            } else if (col.field == "guid") {
                col.headerText = this.translations.number;
                col.allowEditing = false;
            } else if (col.field == "name") {
                col.headerText = this.translations.name;
                col.allowEditing = true;
            } else if (col.field == "createdAt") {
                col.headerText = this.translations.createdAt;
                col.formatter = (field: string, data1: any, column: object) => {
                    return this.datePipe.transform(data1.createdAt, "short");
                }
                col.allowEditing = false;
            } else if (col.field == "updatedAt") {
                col.headerText = this.translations.updatedAt;
                col.formatter = (field: string, data1: any, column: object) => {
                    return this.datePipe.transform(data1.createdAt, "short");
                }
                col.allowEditing = false;
            } else if (col.field == "activated") {
                col.headerText = this.translations.activated;
                col.allowEditing = false;
                col.formatter = (field: string, data1: any, column: object) => {
                    return data1.activated ? `<span class="badge badge-success">${this.translations.yes}</span>` : `<span class="badge badge-danger">${this.translations.no}</span>`;
                }
                col.disableHtmlEncode = false;
            }
        }
        this.grid.refreshColumns();
    }

    public actionBegin(args: EditEventArgs) {
        if (args.requestType === "beginEdit") {
            for (const cols of (this.grid.columns as Column[])) {
                if (cols.field === "createdAt") {
                    cols.visible = false;
                } else if (cols.field === "updatedAt") {
                    cols.visible = false;
                } else if (cols.field === "activated") {
                    cols.visible = false;
                }
            }
        }
    }

    public actionComplete(args) {
        if (args.requestType === "save") {
            for (const cols of (this.grid.columns as Column[])) {
                if (cols.field === "createdAt") {
                    cols.visible = true;
                } else if (cols.field === "updatedAt") {
                    cols.visible = true;
                } else if (cols.field === "activated") {
                    cols.visible = true;
                }
            }
            this.remoteService.getNoCache("post", `/tickets/${args.data.guid}`, {name: args.data.name}).subscribe(async (data) => {
                if (data && data.status) {
                    this.alertService.success(await this.fts.t("general.ticketUpdatedSuccessfully"));
                }
            });
        } else if (args.requestType === "beginEdit") {
            args.dialog.header = this.translations.editTicket;
            // args.dialog.
        }
    }

    public toolbarClick(action: string, event?): void {
        if (action === "pdf") {
            this.grid.pdfExport();
        } else if (action === "excel") {
            this.grid.excelExport();
        } else if (action === "csv") {
            this.grid.csvExport();
        } else if (action === "print") {
            this.grid.print();
        } else if (action === "search") {
            this.grid.search(event.target.value);
        } else if (action === "printTickets") {
            this.printing = true;
            if (this.rowsSelected) {
                this.httpClient.post(`${environment.apiUrl}tickets/print`, {tickets: this.grid.getSelectedRecords().map((t: any) => t.guid)}, {responseType: "blob"}).subscribe((data) => {
                    this.openPDF(data);
                });
            } else {
                this.httpClient.get(`${environment.apiUrl}tickets/print`, {responseType: "blob"}).subscribe((data) => {
                    this.openPDF(data);
                });
            }
        } else if (action === "deleteTickets") {
            this.deleting = true;
            if (this.rowsSelected) {
                const guids = this.grid.getSelectedRecords().map((t: any) => t.guid);
                this.remoteService.get("post", `tickets/delete`, {tickets: guids}).subscribe((res) => {
                    if (res && res.status) {
                        this.deleting = false;
                        this.tickets = this.tickets.filter((t) => !guids.includes(t.guid));
                        this.alertService.success("Tickets erfolgreich gelöscht!");
                    }
                });
            }
        } else {
            // tslint:disable-next-line: no-console
            console.warn(action, "not found!");
        }
    }

    private openPDF(data: Blob) {
        this.printing = false;
        const blob = new Blob([data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }
}
