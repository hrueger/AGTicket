import { Routes } from "@angular/router";
import { HomeComponent } from "./_components/home/home.component";
import { LoginComponent } from "./_components/login/login.component";
import { UsersComponent } from "./_components/users/users.component";
import { AuthGuard } from "./_guards/auth.guard";
import { TicketsComponent } from "./_components/tickets/tickets.component";
import { CreateTicketsComponent } from "./_components/createTickets/createTickets.component";

export const routes: Routes = [
    {
        canActivate: [AuthGuard],
        component: TicketsComponent,
        path: "tickets",
    },
    {
        canActivate: [AuthGuard],
        component: CreateTicketsComponent,
        path: "createTickets",
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
