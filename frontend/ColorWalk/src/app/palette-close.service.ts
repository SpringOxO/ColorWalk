import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Service informing the close of palette
 */
export class PaletteCloseService {
  private closeSource = new BehaviorSubject<boolean | null>(null);
  currentCloseState = this.closeSource.asObservable();
  constructor() { }
  closePalette(close: boolean) {
    this.closeSource.next(close);
  }
}
