import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from "@angular/core";
import { fabric } from "fabric";
import { ColorEvent } from "ngx-color";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
  private originalColor: string = "";
  private currentColor: string = "";

  constructor(private modalService: NgbModal) { }

  public ngOnInit() {
    this.canvas = new fabric.Canvas("canvas");
    this.canvas.on("mouse:down", (options) => {
      this.selectionCreated(options);
    });
    this.canvas.on("selection:created", (options) => {
      this.selectionCreated(options);
    });
    const circle = new fabric.Circle({
      radius: 50, fill: "green", left: 40, top: 100
    });
    const triangle = new fabric.Triangle({
      width: 100, height: 60, fill: "blue", left: 50, top: 50
    });

    this.canvas.add(circle, triangle);
    this.refreshAllObjects();

    this.imageUploadConfig = {
      multiple: false,
      formatsAllowed: ".jpg,.png,.jpeg",
      maxSize: "30",
      uploadAPI: {
        url: "https://example-file-upload-api",
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
  }

  public toggleVisibility(object: fabric.Object) {
    object.visible = !object.visible;
    this.canvas.renderAll();
  }

  public addText() {
    this.canvas.add(new fabric.Textbox("Text"));
    this.refreshAllObjects();
  }
  public addImage(modal) {
    this.modalService.open(modal).result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log(`Dismissed ${reason}`)
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
