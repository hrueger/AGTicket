import { Injectable } from "@angular/core";
import { RemoteService } from "./remote.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private cache: object = {};
  private cacheLoaded: boolean = false;
  constructor(private remoteService: RemoteService) { }
  public async getConfig(): Promise<any> {
    if (!this.cacheLoaded) {
      const data = await this.remoteService.getNoCache("get", "config").toPromise();
      for(const line of data) {
        this.cache[line.key] = line.value;
      }
      this.cacheLoaded = true;
    }
    return this.cache;
  }

  public reload() {
    this.cacheLoaded = false;
    this.getConfig();
  }
}
