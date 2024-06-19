import { Component, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { EyedropperComponent } from '../eyedropper/eyedropper.component';
import { ColorService } from '../color.service';
import { PaletteComponent } from '../palette/palette.component';
import { PaletteCloseService } from '../palette-close.service';
import { PaletteColorService } from '../palette-color.service';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [MatIconModule, CommonModule, EyedropperComponent, PaletteComponent],
  templateUrl: './floating-action-button.component.html',
  styleUrl: './floating-action-button.component.css'
})
export class FloatingActionButtonComponent {
  buttonsVisible = false;
  private eyedropper = new EyedropperComponent(this.paletteColorService);
  hasEyeDrop = this.eyedropper.eyeDropper();
  showPalette: boolean = false;

  constructor(private colorService: ColorService, private paletteCloseService: PaletteCloseService, private paletteColorService : PaletteColorService) {}

  public ngOnInit(): void {
    this.paletteCloseService.currentCloseState.subscribe(close => {
      if (close) {
        this.showPalette = false;
      }
    });
  }

  pickerStyles: {[key: string]: string} = {
    color: 'black',
  };

  changeStyles(color: string) {
    this.pickerStyles['color'] = color;
  }

  callPalette() {
    this.showPalette = !this.showPalette;
    this.toggleToolMenu();
  }

  toggleToolMenu() {
    this.buttonsVisible = !this.buttonsVisible;
  }

  performAction(action: string) {
    console.log(action + ' performed');
    this.toggleToolMenu();
  }
  
  public async nativePick(event?: any): Promise<void> {
    this.toggleToolMenu();
    const color = await this.eyedropper.nativePick(event);
    this.colorService.changeColor(color);
    const stringColor = '#' + color.toString(16).padStart(6, '0');
    console.log('Color: ' + stringColor);
    this.changeStyles(stringColor);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === '1') {
      this.showPalette = !this.showPalette;
    } else if (event.key === '2') {
      this.showPalette = false;
      this.buttonsVisible = true;
      this.nativePick();
    }
  }
}
