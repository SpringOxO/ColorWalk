import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Service informing a new color has been picked by the user through eye dropper
 * If you need the color, you can subscribe this service
 * you will get the color as a decimal number
 */
export class ColorService {
  private colorSource = new BehaviorSubject<number | null>(null);
  currentColor = this.colorSource.asObservable();

  constructor() {}

  changeColor(color: number) {
    this.colorSource.next(color);
  }
}
