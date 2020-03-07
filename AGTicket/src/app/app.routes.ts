import { Routes } from "@angular/router";
import { HomeComponent } from "./_components/home/home.component";
import { LoginComponent } from "./_components/login/login.component";
import { UsersComponent } from "./_components/users/users.component";
import { AuthGuard } from "./_guards/auth.guard";
import { TicketsComponent } from "./_components/tickets/tickets.component";
import { CreateTicketsComponent } from "./_components/createTickets/createTickets.component";
import { ScanComponent } from "./_components/scan/scan.component";
import { ConfigComponent } from "./_components/config/config.component";
import { EditorComponent } from "./_components/editor/editor.component";
import { UnsavedDataGuard } from "./_guards/unsaved-data.guard";

export const routes: Routes = [
    {
        canActivate: [AuthGuard],
        component: TicketsComponent,
        path: "tickets",
    },
    {
        canActivate: [AuthGuard],
        component: ScanComponent,
        path: "scan",
    },
    {
        canActivate: [AuthGuard],
        component: CreateTicketsComponent,
        path: "createTickets",
    },
    {
        canActivate: [AuthGuard],
        component: ConfigComponent,
        path: "config",
    },
    {
        canActivate: [AuthGuard],
        canDeactivate: [UnsavedDataGuard],
        component: EditorComponent,
        path: "editor"
    },
    {
        canActivate: [AuthGuard],
        component: UsersComponent,
        path: "users",
    },
    {
        canActivate: [AuthGuard],
        component: HomeComponent,
        path: "home",
    },
    /* Authentication paths*/
    { path: "login", component: LoginComponent },
    { path: "resetPassword/:resetPasswordToken", component: LoginComponent },
    // otherwise redirect to home
    { path: "**", redirectTo: "/home" },
];
