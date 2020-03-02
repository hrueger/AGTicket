import { Component, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { PageSettingsModel, GridComponent, SelectionSettingsModel, EditSettingsModel, ColumnModel, Column } from "@syncfusion/ej2-angular-grids";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "../../_services/alert.service";
import { DatePipe } from "@angular/common";

@Component({
    selector: "app-tickets",
    styleUrls: ["./tickets.component.scss"],
    templateUrl: "./tickets.component.html",
})
export class TicketsComponent {
    public tickets: any = [];
    public pageSettings: PageSettingsModel = {pageSizes: [10, 50, 100, 500, 1000, 5000, 10000], pageSize: 10};
    public selectionOptions: SelectionSettingsModel = {type: "Multiple", checkboxOnly: false};
    public editSettings: EditSettingsModel = {allowEditing: true};
    @ViewChild("grid") public grid: GridComponent;
    public rowsSelected: number = 0;
    public printing: boolean = false;
    public deleting: boolean;
    private refreshed: boolean = false;

    constructor(private remoteService: RemoteService, private httpClient: HttpClient, private alertService: AlertService, private datePipe: DatePipe) {}

    public ngOnInit() {
        this.remoteService.get("get", "tickets").subscribe((res) => {
            if (res) {
                this.tickets = /*res.map((t) => {
                    return {
                        Nr: t.guid,
                        Name: t.name,
                        Erstellt: Date.parse(t.createdAt).toLocaleString(),
                        Geändert: Date.parse(t.updatedAt).toLocaleString(),
                        Aktiv: t.active ? "Ja" : "Nein",
                    };
                });*/ res;
            }
        });
        setTimeout(() => {
            this.grid.rowDeselected.subscribe(() => {
                this.rowsSelected = this.grid.getSelectedRows().length;
            });
            this.grid.rowSelected.subscribe(() => {
                this.rowsSelected = this.grid.getSelectedRows().length;
            });
        }, 10);
    }

    public dataBound(args: any) {
        if (this.refreshed) {
            return;
        } else {
            this.refreshed = true;
        }
        for (const col of (this.grid.columns as ColumnModel[])) {
            if (col.field === "id") {
                col.visible = false;
            } else if (col.field == "guid") {
                col.headerText = "Ticket #";
                col.allowEditing = false;
            } else if (col.field == "name") {
                col.headerText = "Name";
                col.allowEditing = true;
            } else if (col.field == "createdAt") {
                col.headerText = "Erstellt";
                col.formatter = (field: string, data1: any, column: object) => {
                    return this.datePipe.transform(data1.createdAt, "short");
                }
                col.allowEditing = false;
            } else if (col.field == "updatedAt") {
                col.headerText = "Aktualisiert";
                col.formatter = (field: string, data1: any, column: object) => {
                    return this.datePipe.transform(data1.createdAt, "short");
                }
                col.allowEditing = false;
            } else if (col.field == "activated") {
                col.headerText = "Aktiviert?";
                col.allowEditing = false;
            }
        }
        this.grid.refreshColumns();
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
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }
}
