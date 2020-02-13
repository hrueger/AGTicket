import { Component, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { PageSettingsModel, GridComponent } from "@syncfusion/ej2-angular-grids";
import { ClickEventArgs } from "@syncfusion/ej2-angular-navigations";

@Component({
    selector: "app-tickets",
    styleUrls: ["./tickets.component.scss"],
    templateUrl: "./tickets.component.html",
})
export class TicketsComponent {
    public tickets: any = [];
    public toolbar = ["Search", "Add", "Edit", "Update", "Delete", "Cancel", "Print", "ColumnChooser", "PdfExport", "ExcelExport", "CsvExport"];
    public pageSettings: PageSettingsModel = {pageSizes: [10, 50, 100, 500, 1000], pageSize: 50};
    @ViewChild("grid") public grid: GridComponent;

    constructor(private remoteService: RemoteService) {}

    public ngOnInit() {
        this.remoteService.get("get", "tickets").subscribe((res) => {
            if (res) {
                this.tickets = res.map((t) => {
                    return {
                        Nr: t.guid,
                        Name: t.name,
                        Erstellt: Date.parse(t.createdAt).toLocaleString(),
                        Geändert: Date.parse(t.updatedAt).toLocaleString(),
                        Aktiv: t.active ? "Ja" : "Nein",
                    };
                });
            }
        });
    }

    public toolbarClick(args: ClickEventArgs): void {
        console.log(args);
        if (args.item.id === "grid_999134205_0_pdfexport") {
            this.grid.pdfExport();
        } else if (args.item.id === "grid_999134205_0_excelexport") {
            this.grid.excelExport();
        } else if (args.item.id === "grid_999134205_0_csvexport") {
            this.grid.csvExport();
        } else {
            console.warn(args.item.id, "not found!");
        }
    }
}
