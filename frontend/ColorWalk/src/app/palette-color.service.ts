import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Service informing the current color on the palette
 * can be used to get the current color on the palette and check with the target color
 */
export class PaletteColorService {
  private colorSource = new BehaviorSubject<string | null>(null);
  currentColor = this.colorSource.asObservable();
  constructor() { }
  changeColor(color: string) {
    this.colorSource.next(color);
  }
}
