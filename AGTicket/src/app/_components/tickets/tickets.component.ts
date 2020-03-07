import { Component, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { PageSettingsModel, GridComponent, SelectionSettingsModel, EditSettingsModel, ColumnModel, Column, SaveEventArgs, EditEventArgs, DialogEdit } from "@syncfusion/ej2-angular-grids";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "../../_services/alert.service";
import { DatePipe } from "@angular/common";
import { FastTranslateService } from "../../_services/fast-translate.service";
import * as PDFKit from "../../_lib/pdfkit.standalone";
import { ConfigService } from "../../_services/config.service";
import { fabric } from "fabric";
import * as blobStream from "../../_lib/blob-stream";
import * as QRCode from "qrcode";

@Component({
    selector: "app-tickets",
    styleUrls: ["./tickets.component.scss"],
    templateUrl: "./tickets.component.html",
})
export class TicketsComponent {
    public tickets: any = [];
    public pageSettings: PageSettingsModel = { pageSizes: [10, 50, 100, 500, 1000, 5000, 10000], pageSize: 10 };
    public selectionOptions: SelectionSettingsModel = { type: "Multiple", checkboxOnly: false };
    public editSettings: EditSettingsModel = { allowEditing: true, mode: "Dialog" };
    @ViewChild("grid") public grid: GridComponent;
    public rowsSelected: number = 0;
    public printing: boolean = false;
    public deleting: boolean;
    private refreshed: boolean = false;
    private translations: any = {};
    private config: any = {};

    constructor(private remoteService: RemoteService,
        private httpClient: HttpClient,
        private alertService: AlertService,
        private datePipe: DatePipe,
        private fts: FastTranslateService,
        private configService: ConfigService) { }

    public async ngOnInit() {
        this.config = await this.configService.getConfig();
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
            this.remoteService.getNoCache("post", `/tickets/${args.data.guid}`, { name: args.data.name }).subscribe(async (data) => {
                if (data && data.status) {
                    this.alertService.success(await this.fts.t("general.ticketUpdatedSuccessfully"));
                    this.tickets = this.tickets.map((t) => {
                        if (t.guid == args.data.guid) {
                            t.name = args.data.name;
                        }
                        return t;
                    });
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
                this.printTickets(this.grid.getSelectedRecords());
            } else {
                this.printTickets(this.tickets);
            }
        } else if (action === "deleteTickets") {
            this.deleting = true;
            if (this.rowsSelected) {
                const guids = this.grid.getSelectedRecords().map((t: any) => t.guid);
                this.remoteService.get("post", `tickets/delete`, { tickets: guids }).subscribe((res) => {
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


    public async printTickets(tickets: any[]) {
        const ticketSpacing = parseInt(this.config.ticketSpacing, undefined);
        const borderWidth = parseInt(this.config.borderWidth, undefined);
        const ticketsX = parseInt(this.config.ticketsX, undefined);
        const ticketsY = parseInt(this.config.ticketsY, undefined);
        const data = JSON.parse(this.config.editor);

        const fullheight = 793;
        const fullwidth = 611;
        const editorCanvasScaleFactor = 5;
        const qrSize = 70;
        const barcodeSize = 30;
        const pageHeight = fullheight - (2 * ticketSpacing);
        const pageWidth = fullwidth - (2 * ticketSpacing);
        const ticketWidth = (pageWidth - ((ticketsX - 1) * ticketSpacing)) / ticketsX;
        const ticketHeight = (pageHeight - ((ticketsY - 1) * ticketSpacing)) / ticketsY;

        const document = new PDFKit({ margin: ticketSpacing, info: { Author: "AGTicket", CreationDate: new Date(), Creator: "AGTicket", Title: "Tickets" } });
        const stream = document.pipe(blobStream());
        let x = 0;
        let y = 0;
        const f = new fabric.Canvas(null, {
            // @ts-ignore
            width: ticketWidth * editorCanvasScaleFactor,
            height: ticketHeight * editorCanvasScaleFactor,
        });
        f.loadFromJSON(data, () => {
            f.renderAll();
        });
        await new Promise((r, u) => {
            setTimeout(() => {
                r();
            }, 2000);
        });
        const properties: any = {};
        f.getObjects().filter((o) => o.placeholder == "qr").forEach(async (o: fabric.Image) => {
            properties.top = o.top;
            properties.left = o.left;
            properties.height = o.getScaledHeight();
            properties.width = o.getScaledWidth();
            f.remove(o);
        });
        for (const ticket of tickets) {
            const ticketStartX = (ticketSpacing * (x + 1)) + (ticketWidth * x);
            const ticketStartY = (ticketSpacing * (y + 1)) + (ticketHeight * y);

            f.getObjects().filter((o) => o.placeholder).forEach(async (o) => {
                if (o.placeholder == "name") {
                    o.text = ticket.name;
                } else if (o.placeholder == "number") {
                    o.text = ticket.guid;
                }
            });

            await new Promise((r, u) => {
                setTimeout(() => {
                    r();
                }, 500);
            });

            f.renderAll();
            const scaleFactor = 0.345;
            document.image(f.toDataURL({
                width: ticketWidth * editorCanvasScaleFactor * scaleFactor,
                height: ticketHeight * editorCanvasScaleFactor * scaleFactor,
                enableRetinaScaling: true,
            }), ticketStartX, ticketStartY, { fit: [ticketWidth, ticketHeight] });
            const qrScaleFactor = 0.58;
            document.image(await QRCode.toDataURL(ticket.guid, { margin: 1, width: qrSize}),
                ticketStartX + (properties.left * qrScaleFactor),
                ticketStartY + (properties.top * qrScaleFactor),
                { fit: [properties.width * qrScaleFactor, properties.height * qrScaleFactor] }
            );

            if (borderWidth > 0 || true) {
                document.fillColor("black");
                document.lineWidth(borderWidth);
                document.rect(ticketStartX, ticketStartY, ticketWidth, ticketHeight).stroke();
            }
            x++;
            if (x >= ticketsX) {
                x = 0;
                y++;
            }
            if (y >= ticketsY) {
                y = 0;
                document.addPage();
            }
        }
        document.end();
        stream.on('finish', () => {
            const url = stream.toBlobURL('application/pdf');
            window.open(url, "_blank");
            this.printing = false;
        });
    }
}
