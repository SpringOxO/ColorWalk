import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaintingNearService {
  private nearPaintingSubject = new Subject<void>();

  emitEvent() {
    this.nearPaintingSubject.next();
  }

  onEvent() {
    return this.nearPaintingSubject.asObservable();
  }
}
