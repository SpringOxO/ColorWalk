import { Component, EventEmitter, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaletteColorService } from '../palette-color.service';
import { color } from 'three/examples/jsm/nodes/Nodes.js';
import { ZonePassService } from '../zone-pass.service';

interface ColorDrop {
  idx: number;
  color: string;   // 颜色值，例如 '#FF5733'
  selected: boolean;  // 是否被选中
  passed: boolean;  // 是否通过比较
}

@Component({
  imports: [UiPaintingComponent,MatCardModule,CommonModule],
  selector: 'app-ui-painting',
  templateUrl: './ui-painting.component.html',
  styleUrls: ['./ui-painting.component.scss'],
  standalone: true
})
export class UiPaintingComponent {
  currentColor : string | null = '#000000';  // 默认颜色
  private subscription!: Subscription;

  currentZonePassNumber : number = 0;

  constructor(private paletteColorService: PaletteColorService, private zonePassService : ZonePassService) {console.log('###');}

  colorDrops: ColorDrop[] = [  // 使用接口定义数组
    // { idx: 0, color: '#3254ff', selected: false, passed: false },
    // { idx: 1, color: '#e84040', selected: false, passed: false },
    { idx: 2, color: '#f0b11e', selected: false, passed: false }
  ];

  public checkPass(): boolean {
    console.log(this.colorDrops);
    return this.colorDrops.every(colorDrop => colorDrop.passed);
  }

  selectColor(drop: ColorDrop): void {  // 明确参数类型
    this.colorDrops.forEach(d => d.selected = false);
    drop.selected = true;
    // this.currentColor = drop.color;
    this.compareColor(drop); // 只比较当前选中的颜色
  }

  public ngOnInit() {
    this.subscription = this.paletteColorService.currentColor.subscribe(color => {
      this.currentColor = color;
    });
  }
  
  compareColor(drop: ColorDrop) {
    if (this.currentColor) {
      const currentRGB = this.hexToRGB(this.currentColor);
      const dropRGB = this.hexToRGB(drop.color);
  
      const diff = Math.abs(currentRGB[0] - dropRGB[0]) +
                   Math.abs(currentRGB[1] - dropRGB[1]) +
                   Math.abs(currentRGB[2] - dropRGB[2]);
      
      if (diff < 80){
        drop.passed = true;
      }
      
      console.log(currentRGB);
      console.log(dropRGB);
      console.log(drop.passed);
    }
  
    if (this.checkPass()) {
      console.log('zone pass!');
      this.currentZonePassNumber++;
      this.zonePassService.passZone(this.currentZonePassNumber);
    }
    console.log('!');
    console.log(this.colorDrops);
  }

  hexToRGB(hex: string): number[] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}