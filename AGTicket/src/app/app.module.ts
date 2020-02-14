import { CommonModule } from "@angular/common";
import { Location } from "@angular/common";
import { registerLocaleData } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { LOCALE_ID, NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { TabModule } from "@syncfusion/ej2-angular-navigations";
import { ToastrModule } from "ngx-toastr";
import { UiSwitchModule } from "ngx-ui-switch";
import { environment } from "../environments/environment";
import { HomeComponent } from "./_components/home/home.component";
import { LoginComponent } from "./_components/login/login.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { UsersComponent } from "./_components/users/users.component";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { RenewJwtTokenInterceptor } from "./_helpers/renewJwtToken.interceptor";
import { SortableHeader } from "./_helpers/sortable.directive";
import { SafePipe } from "./_pipes/safe.pipe";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { AppComponent } from "./app.component";
import { routes } from "./app.routes";
import { GridModule, PageService, SortService, FilterService, GroupService, SearchService, AggregateService, EditService, ResizeService, ToolbarService, ExcelExportService, PdfExportService, ColumnChooserService, ColumnMenuService, CommandColumnService, SelectionService } from '@syncfusion/ej2-angular-grids';
import { TicketsComponent } from "./_components/tickets/tickets.component";
import { CreateTicketsComponent } from "./_components/createTickets/createTickets.component";

registerLocaleData(localeDe);

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        LoginComponent,
        SafePipe,
        UsersComponent,
        SortableHeader,
        NavbarComponent,
        ShortWhenPipe,
        TruncatePipe,
        HomeComponent,
        TicketsComponent,
        CreateTicketsComponent,
    ],
    imports: [
        UiSwitchModule.forRoot({}),
        RouterModule.forRoot(routes, { useHash: true, enableTracing: false }),
        BrowserAnimationsModule,
        BrowserModule,
        GridModule,
        TabModule,
        NgbModule,
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        NgbModalModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                deps: [HttpClient],
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
            },
        }),
    ],
    providers: [
        Location,
        PageService,
        SortService,
        ToolbarService,
        ResizeService,
        ExcelExportService,
        PdfExportService,
        ColumnChooserService,
        ColumnMenuService,
        CommandColumnService,
        SelectionService,
        FilterService,
        SearchService,
        EditService,
        AggregateService,
        GroupService,
        {
            provide: LOCALE_ID,
            useValue: "de-DE",
        },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RenewJwtTokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ],
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, `${environment.appUrl.replace("/#/", "")}/assets/i18n/`, ".json");
}
