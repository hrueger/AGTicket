import { Component, ViewChild } from "@angular/core";
import { ZXingScannerComponent } from "@zxing/ngx-scanner"

@Component({
    selector: "app-scan",
    styleUrls: ["./scan.component.scss"],
    templateUrl: "./scan.component.html",
})
export class ScanComponent {
    @ViewChild("scanner") public scanner: ZXingScannerComponent;

    public camerasFoundHandler(event) {
        console.log(event);
    }
    public camerasNotFoundHandler(event) {
        console.log(event);
    }
    public scanSuccessHandler(event) {
        console.log(event);
    }
    public scanErrorHandler(event) {
        console.log(event);
    }
    public scanFailureHandler(event) {
        console.log(event);
    }
    public scanCompleteHandler(event) {
        console.log(event);
    }
}
