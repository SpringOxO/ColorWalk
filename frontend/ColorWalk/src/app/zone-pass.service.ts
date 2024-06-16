import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZonePassService {

  private zoneNumberSource = new BehaviorSubject<number>(0);
  zoneNumber = this.zoneNumberSource.asObservable();
  constructor() { }
  passZone(zoneN: number) {
    this.zoneNumberSource.next(zoneN);
  }
}
