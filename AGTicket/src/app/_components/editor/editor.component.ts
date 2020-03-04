import { Component } from "@angular/core";
import { fabric } from "fabric";
import { ColorEvent } from "ngx-color";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { ConfigService } from "../../_services/config.service";
import * as FontFaceObserver from "fontfaceobserver";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"]
})
export class EditorComponent {
  public showColorPicker: boolean = false;
  public selectedObjects: any[] = [];
  public allObjects: any[] = [];
  public canvas: fabric.Canvas;
  public imageUploadConfig;
  public textProperties = {
    underline: false,
    italic: false,
    overline: false,
    bold: false,
    linethrough: false,
    align: "left",
    fontSize: 30,
    fontFamily: "",
  }
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
  private originalColor: string = "";
  private currentColor: string = "";
  private imageUploadModal: any;

  constructor(private modalService: NgbModal,
    private authenticationService: AuthenticationService,
    private remoteService: RemoteService,
    private alertService: AlertService,
    private configService: ConfigService,
  ) { }

  public async ngOnInit() {
    const config = await this.configService.getConfig();
    this.canvas = new fabric.Canvas("canvas");
    this.canvas.on("mouse:down", (options) => {
      this.selectionCreated(options);
    });
    this.canvas.on("selection:created", (options) => {
      this.selectionCreated(options);
    });
    if (config && config.editor) {
      this.canvas.loadFromJSON(JSON.parse(config.editor), () => {
        this.refreshAllObjects();
      });
    } else {
      const circle = new fabric.Circle({
        radius: 50, fill: "green", left: 40, top: 100
      });
      const triangle = new fabric.Triangle({
        width: 100, height: 60, fill: "blue", left: 50, top: 50
      });

      this.canvas.add(circle, triangle);
    }
    this.refreshAllObjects();

    this.imageUploadConfig = {
      multiple: false,
      formatsAllowed: ".jpg,.png,.jpeg",
      maxSize: "30",
      uploadAPI: {
        url: `${environment.apiUrl}config/uploadImage`,
        headers: {
          "Authorization" : `Bearer ${this.authenticationService.currentUserValue.token}`
        }
      },
      replaceTexts: {
        selectFileBtn: 'Select Files',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        dragNDropBox: 'Drag N Drop',
        attachPinBtn: 'Attach Files...',
        afterUploadMsg_success: 'Successfully Uploaded !',
        afterUploadMsg_error: 'Upload Failed !'
      }
    };

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

  public save() {
    this.remoteService.get("post", "config/editor", {data: this.canvas.toJSON(["name"])}).subscribe((data) => {
      if (data && data.status) {
        this.alertService.success("Erfolgreich gespeichert!");
        this.configService.reload();
      }
    });
  }

  public imageUploaded(event) {
      const data = JSON.parse(event.responseText);
      if (data && data.status) {
        fabric.Image.fromURL(`${environment.apiUrl}config/file/${data.name}`, (i) => {
          if (i) {
            this.canvas.add(i);
          }
        });
      }
      this.imageUploadModal.close();
  }

  private selectionCreated(options) {
    for (const o of this.canvas.getObjects() as any[]) {
      o.selected = false;
    }
    this.selectedObjects = this.canvas.getActiveObjects();
    this.originalColor = options.target?.fill as string;
    for (const o of this.selectedObjects) {
      o.selected = true;
    }
    if (this.selectedObjects.length == 1 && this.selectedObjects[0].type == 'textbox') {
      const o = this.selectedObjects[0] as fabric.Textbox;
      this.textProperties.fontSize = o.fontSize;
      this.textProperties.fontFamily = o.fontFamily;
      this.textProperties.align = o.textAlign;
      this.textProperties.bold = o.fontWeight == "bold" ? true : false;
      this.textProperties.italic = o.fontStyle == "italic" ? true : false;
      this.textProperties.linethrough = o.linethrough;
      this.textProperties.overline = o.overline;
      this.textProperties.underline = o.underline;
    }
  }

  public updateTextProperties(fontChanged=false) {
    const o = this.selectedObjects[0] as fabric.Textbox;
    o.fontSize = this.textProperties.fontSize;
    o.fontFamily = this.textProperties.fontFamily;
    o.textAlign = this.textProperties.align;
    o.fontWeight = this.textProperties.bold ? "bold" : "normal";
    o.fontStyle = this.textProperties.italic ? "italic" : "normal";
    o.linethrough = this.textProperties.linethrough;
    o.overline = this.textProperties.overline;
    o.underline = this.textProperties.underline;
    this.canvas.renderAll();
    const origTextAlign = o.textAlign;
    o.textAlign = o.textAlign == "left" ? "right" : "left";
    this.canvas.renderAll();
    o.textAlign = origTextAlign;
    this.canvas.renderAll();
    if (fontChanged) {
      const newFont = new FontFaceObserver(this.textProperties.fontFamily);
      newFont.load()
        .then(() => {
          o.fontFamily = this.textProperties.fontFamily;
          this.canvas.renderAll();
        }).catch((e) => {
          //
        });
    }
  }

  public toggleVisibility(object: fabric.Object) {
    object.visible = !object.visible;
    this.canvas.renderAll();
  }

  public addText() {
    this.canvas.add(new fabric.Textbox("Text", {
      fontFamily: "'Comic Sans'"
    }));
    this.refreshAllObjects();
  }
  public addImage(modal) {
    this.imageUploadModal = this.modalService.open(modal);
    this.imageUploadModal.result.then((result) => {
      //
    }, (reason) => {
      //
    });
    this.canvas.add(new fabric.Image());
    this.refreshAllObjects();
  }
  public addRect() {
    this.canvas.add(new fabric.Rect({ height: 20, width: 30 }));
    this.refreshAllObjects();
  }
  public addTriangle() {
    this.canvas.add(new fabric.Triangle());
    this.refreshAllObjects();
  }
  public addCircle() {
    this.canvas.add(new fabric.Circle({ radius: 20 }));
    this.refreshAllObjects();
  }

  public color() {
    this.showColorPicker = true;
  }
  public delete() {
    this.canvas.remove(...this.selectedObjects);
    this.selectedObjects = [];
    this.refreshAllObjects();
  }

  public bringForward() {
    for (const o of this.selectedObjects) {
      o.bringForward();
      o.dirty = true;
    }
    this.canvas.renderAll();
    this.refreshAllObjects();
  }
  public bringToFront() {
    for (const o of this.selectedObjects) {
      o.bringToFront();
      o.dirty = true;
    }
    this.canvas.renderAll();
    this.refreshAllObjects();
  }
  public sendToBack() {
    for (const o of this.selectedObjects) {
      o.sendToBack();
      o.dirty = true;
    }
    this.canvas.renderAll();
    this.refreshAllObjects();
  }
  public sendBackwards() {
    for (const o of this.selectedObjects) {
      o.sendBackwards();
      o.dirty = true;
    }
    this.canvas.renderAll();
    this.refreshAllObjects();
  }


  public colorPickerChange(event: ColorEvent) {
    this.currentColor = event.color.hex;
  }
  public colorPickerAccept() {
    this.showColorPicker = false;
    this.originalColor = this.currentColor;
    for (const o of this.selectedObjects) {
      o.dirty = true;
      o.fill = this.originalColor;
    }
    this.canvas.renderAll();
  }
  public colorPickerCancel() {
    this.showColorPicker = false;
  }

  public listObjectClicked(event: MouseEvent, index) {
    // @ts-ignore
    // this.canvas.setActiveObject(this.canvas.item(index));
  }

  public refreshAllObjects() {
    this.allObjects = this.canvas.getObjects().reverse();
  }
}
