import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZonePassService {

  private zoneNumberSource = new BehaviorSubject<number>(0);
  zoneNumber = this.zoneNumberSource.asObservable();

  private zoneNumberChanged = new Subject<number>();
  zoneNumberChanged$ = this.zoneNumberChanged.asObservable();

  constructor() { }
  passZone(zoneN: number) {
    this.zoneNumberSource.next(zoneN);
    this.zoneNumberChanged.next(zoneN);
  }
}
