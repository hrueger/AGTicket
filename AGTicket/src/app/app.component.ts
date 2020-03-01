import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "./_services/authentication.service";
import { RemoteService } from "./_services/remote.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.scss"],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    public currentUser: any;
    public pushMessage: any;
    public showNav: boolean = false;
    public isShare: boolean;
    public showEverything: boolean = true;
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        // private pushService: PushService,
        private translateService: TranslateService,
        private remoteService: RemoteService,
        private cdr: ChangeDetectorRef,
    ) {
        translateService.setDefaultLang(translateService.getBrowserLang());
        this.authenticationService.currentUser.subscribe(
            (x) => (this.currentUser = x),
        );
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        const userId = Math.round(Math.random() * 10000);
        // this.pushService.requestPermission(userId);
        // this.pushService.receiveMessage();
        // this.pushMessage = this.pushService.currentMessage;
        this.router.events.subscribe((event: any) => {
            if (event.url) {
                if (event.url.startsWith("/share/")) {
                    this.isShare = true;
                } else {
                    this.isShare = false;
                }
            }
        });
        this.translateService.setDefaultLang(
            localStorage.getItem("language") ?
            localStorage.getItem("language") :
            this.translateService.getBrowserLang(),
        );
        this.translateService.onLangChange.subscribe(() => {
            this.showEverything = false;
            setTimeout(() => {
                this.showEverything = true;
            }, 0);
        });
    }
}
