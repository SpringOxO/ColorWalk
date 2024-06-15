import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

interface ColorDrop {
  color: string;   // 颜色值，例如 '#FF5733'
  selected: boolean;  // 是否被选中
}

@Component({
  imports: [UiPaintingComponent,MatCardModule,CommonModule],
  selector: 'app-ui-painting',
  templateUrl: './ui-painting.component.html',
  styleUrls: ['./ui-painting.component.scss'],
  standalone: true
})
export class UiPaintingComponent {
  currentColor = '#000000';  // 默认颜色
  colorDrops: ColorDrop[] = [  // 使用接口定义数组
    { color: '#FF5733', selected: false },
    { color: '#33FF57', selected: false },
    { color: '#3357FF', selected: false },
    { color: '#F333FF', selected: false },
    { color: '#FFF333', selected: false }
  ];

  selectColor(drop: ColorDrop): void {  // 明确参数类型
    this.colorDrops.forEach(d => d.selected = false);
    drop.selected = true;
    this.currentColor = drop.color;
  }
}