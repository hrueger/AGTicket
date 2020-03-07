import { CanDeactivate } from '@angular/router';
import { Injectable, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FastTranslateService } from '../_services/fast-translate.service';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
  hasUnsavedData: boolean;
}

@Injectable()
export class UnsavedDataGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private fts: FastTranslateService) {}
  canDeactivate(component: ComponentCanDeactivate): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (component.hasUnsavedData) {
        this.fts.t("general.unsavedDataWarning").then((v) => {
          resolve(confirm(v));
        });
      } else {
        resolve(true);
      }
    });
  }
}