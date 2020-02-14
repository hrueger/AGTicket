import { Component, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { PageSettingsModel, GridComponent, SelectionSettingsModel, EditSettingsModel } from "@syncfusion/ej2-angular-grids";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

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

    constructor(private remoteService: RemoteService, private httpClient: HttpClient) {}

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
