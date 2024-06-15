import { Component, ViewChild, ElementRef, AfterViewChecked, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaletteColorService } from '../palette-color.service';
import { PaletteCloseService } from '../palette-close.service';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css']
})
export class PaletteComponent implements AfterViewChecked {
  @ViewChild('myCanvas', { static: true }) canvasRef !: ElementRef<HTMLCanvasElement>;
  private ctx !: CanvasRenderingContext2D;
  private pickedColor = '#ff0000';
  private currentColor = '#ffffff';
  private colorAmount = 0;
  private maxColorAmount = 10;
  buttonColors: string[] = ['#ff0000', '#00ff00', '#0000ff', '#000000', '#ffffff', '#ffffff', '#ffffff'];
  pressTimer: any;
  pressIntervalTimer: any;
  longClick: boolean = false;
  isDragging: boolean = false;
  startDragging: boolean = false;

  colorLongClick: boolean = false;
  colorPressTimer: any;
  colorIntervalTimer: any;

  showPalette: boolean = false;

  currentColorDiv: {[key: string]: string} = {
    'background-color': '#ffffff',
    width: '300px',
    height: '45%',
    border: '1px solid black'
  };

  constructor(private paletteColorService: PaletteColorService, private paletteCloseService: PaletteCloseService) { }

  ngAfterViewChecked() {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx && canvas) {
      let ctx = canvas.getContext('2d');
      if (ctx) {
        this.ctx = ctx;
      } else {
        return;
      }

      if (this.ctx) {
        // Initial background color fill
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      }
    }
  }

  paletteMouseDown(event: MouseEvent) {
    console.log('Mouse down on canvas');
    this.isDragging = true;
    this.pressTimer = setTimeout(() => {
      console.log('Long press on canvas');
      this.longClick = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let i = 0;
      this.pressIntervalTimer = setInterval(() => {
        this.blendColor(x, y, this.pickedColor, 15 + 1 * i);
        i++;
      }, 100);
    }, 500);
  }

  paletteMouseUp(event: MouseEvent) {
    console.log('Mouse up on canvas');
    clearTimeout(this.pressTimer);
    clearInterval(this.pressIntervalTimer );
    if (!this.longClick) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.blendColor(x, y, this.pickedColor);
    }
    this.longClick = false;
    this.isDragging = false;
    this.startDragging = false;
  }

  paletteMouseMove(event: MouseEvent) {
    console.log('Mouse move on canvas');
    // console.log(this.isDragging);
    if (this.isDragging) {
      this.startDragging = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.blendColor(x, y, this.pickedColor);
    }
  }

  blendColor(x: number, y: number, newColor: string, radius: number = 15) {
    if (!this.ctx) {
      return;
    }
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    const newRgb = this.hexToRgb(newColor);

    for (let y = 0; y < radius * 2; y++) {
      for (let x = 0; x < radius * 2; x++) {
        const dx = x - radius;
        const dy = y - radius;
        if (dx * dx + dy * dy <= radius * radius) {
          const index = (y * radius * 2 + x) * 4;
          if (data[index] === 255 && data[index + 1] === 255 && data[index + 2] === 255) {
            data[index] = newRgb.r;
            data[index + 1] = newRgb.g;
            data[index + 2] = newRgb.b;
            continue;
          }
          data[index] = (data[index] + newRgb.r) / 2;
          data[index + 1] = (data[index + 1] + newRgb.g) / 2;
          data[index + 2] = (data[index + 2] + newRgb.b) / 2;
        }
      }
    }

    this.ctx.putImageData(imageData, x - radius, y - radius);
  }

  changeColor(color: string) {
    console.log('Change color to ' + color);
    this.pickedColor = color;
    this.colorPressTimer = setTimeout(() => {
      this.colorLongClick = true;
      this.colorIntervalTimer = setInterval(() => {
        this.mixColor(color);
      }, 100);
    }, 500);
  }

  changeColorFinish() {
    clearTimeout(this.colorPressTimer);
    clearInterval(this.colorIntervalTimer);
    if (!this.colorLongClick) {
      this.mixColor(this.pickedColor);
    }
    this.colorLongClick = false;
    if (this.colorAmount >= this.maxColorAmount) {
      alert('You have reached the maximum color amount');
    } else {
      this.paletteColorService.changeColor(this.currentColor);
    }
  }

  mixColor(color: string) {
    this.colorAmount++;
    const currentRgb = this.hexToRgb(this.currentColor);
    const newRgb = this.hexToRgb(color);
    console.log(currentRgb);
    if (currentRgb.r === 255 && currentRgb.g === 255 && currentRgb.b === 255) {
      this.currentColor = color;
      this.currentColorDiv['background-color'] = color;
      console.log(this.currentColorDiv['background-color']);
      return;
    }
    let rate = 0.9 + 0.1 * this.colorAmount / this.maxColorAmount;
    if (rate > 1) {
      rate = 1;
    }
    const r = Math.round(currentRgb.r * rate + newRgb.r * (1- rate)).toString(16).padStart(2, '0');;
    const g = Math.round(currentRgb.g * rate + newRgb.g * (1- rate)).toString(16).padStart(2, '0');;
    const b = Math.round(currentRgb.b * rate + newRgb.b * (1- rate)).toString(16).padStart(2, '0');;
    this.currentColor = '#' + r + g + b;
    this.currentColorDiv['background-color'] = this.currentColor;
    console.log(this.currentColorDiv['background-color']);
  }

  hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  public tryAgain() {
    this.colorAmount = 0;
    this.currentColor = '#ffffff';
    this.currentColorDiv['background-color'] = this.currentColor;
    if (this.ctx) {
      this.ctx.fillStyle = 'white'; // 设置画布的填充颜色为白色
      this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height); // 填充整个画布
    }
  }

  public closePalette() {
    this.paletteCloseService.closePalette(true);
  }
}
