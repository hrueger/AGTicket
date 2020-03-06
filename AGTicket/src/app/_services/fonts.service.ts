import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class FontsService {
  public fonts = [
    "Arial",
    "Roboto",
    "Times New Roman",
    "Verdana",
    "Georgia",
    "Garamond",
    "Candara",
    "Arial Black",
    "Impact",
    "Pacifico",
    "VT323",
    "Quicksand",
    "Inconsolata",
  ]
  public load() {
    setTimeout(async () => {
      for(const f of this.fonts) {
        try {
          await (new FontFaceObserver(f).load());
        } catch (e) {
          //
        }
      }
    });
  }

}
