import { Component, EventEmitter, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaletteColorService } from '../palette-color.service';
import { color } from 'three/examples/jsm/nodes/Nodes.js';
import { ZonePassService } from '../zone-pass.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { PaintingNearService } from '../painting-near.service';
import { AuthService } from '../auth.service';

interface ColorDrop {
  idx: number;
  color: string;   // 颜色值，例如 '#FF5733'
  selected: boolean;  // 是否被选中
  passed: boolean;  // 是否通过比较
}

@Component({
  imports: [UiPaintingComponent,MatCardModule,CommonModule,MatButtonModule],
  selector: 'app-ui-painting',
  templateUrl: './ui-painting.component.html',
  styleUrls: ['./ui-painting.component.scss'],
  standalone: true
})
export class UiPaintingComponent {
  imgPath : string = "./assets/pictures/RYB.jpg";

  currentColor : string | null = '#000000';  // 默认颜色
  private paletteSubscription!: Subscription; //同步调色板当前颜色的订阅
  private paintingNearSubscription!: Subscription; //获取靠近挂画的信号的订阅
  private zonePassedSubscription!: Subscription; //区域的订阅

  currentZonePassNumber : number = 0;

  constructor(private authService: AuthService, private paletteColorService: PaletteColorService, private zonePassService : ZonePassService,private dialog: MatDialog, private paintingNearService: PaintingNearService) {}

  colorDrops: ColorDrop[] = [  // 使用接口定义数组
    { idx: 0, color: '#3254ff', selected: false, passed: false },
    { idx: 1, color: '#e84040', selected: false, passed: false },
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
    this.paletteSubscription = this.paletteColorService.currentColor.subscribe(color => {
      this.currentColor = color;
    });

    this.zonePassedSubscription = this.zonePassService.zoneNumberChanged$.subscribe( //如果过关数改变就更新画
      zoneNumber => {
        this.currentZonePassNumber = zoneNumber;
        this.updatePainting();
      }
    );

    this.paintingNearSubscription = this.paintingNearService.onEvent().subscribe(() => {
      // 在这里处理接收到的事件
      // console.log('near painting!');
      this.onShow();
    })
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
      
      // console.log(currentRGB);
      // console.log(dropRGB);
      console.log(drop.passed);
    }
  
    if (this.checkPass()) { //过关啦！！！
      console.log('zone pass!');
      this.currentZonePassNumber++;
      if (this.currentZonePassNumber <= 3){ //避免bug的可能，bonus关就不去更新了
        this.zonePassService.passZone(this.currentZonePassNumber);
      }
      this.authService.increaseZonePassed(this.authService.getUsername()).subscribe(
        response => {
          console.log('Update success!');
        },
        (error) => {
          console.error('Error retrieving user:', error);
        }
      );
      // this.authService.increaseZonePassed(this.authService.getUsername());

      this.updatePainting();
    }
    // console.log('!');
    // console.log(this.colorDrops);
  }

  updatePainting(){
    this.onHide();
    switch(this.currentZonePassNumber){
      case 0:{
        this.imgPath = "./assets/pictures/RYB.jpg";
        this.colorDrops = [
          { idx: 0, color: '#3254ff', selected: false, passed: false },
          { idx: 1, color: '#e84040', selected: false, passed: false },
          { idx: 2, color: '#f0b11e', selected: false, passed: false }
        ];
      }
        break;
      case 1:
        {
          this.imgPath = "./assets/pictures/Sunday.jpg"
          this.colorDrops = [
            { idx: 0, color: '#bbb96c', selected: false, passed: false },
            { idx: 1, color: '#d06c42', selected: false, passed: false },
            { idx: 2, color: '#8f94c3', selected: false, passed: false }
          ];
        }
        break;
      case 2:
        {
          this.imgPath = "./assets/pictures/Sunrise.jpg"
          this.colorDrops = [
            { idx: 0, color: '#6c8593', selected: false, passed: false },
            { idx: 1, color: '#ce7a69', selected: false, passed: false },
            { idx: 2, color: '#9ea993', selected: false, passed: false }
          ];
        }
        break;
      default:
        const randomColor : string = this.changeToRandomColor();
        this.colorDrops = [
          { idx: 0, color: randomColor, selected: false, passed: false }
        ];
        break;
    }
  }

  applyRandomColorToImage(color: string) {
    const imageElement = document.getElementById('painting-frame');
    if (imageElement) {
      imageElement.style.backgroundColor = color;
    }
  }

  changeToRandomColor():string {
    const randomColor = this.getRandomColor();
    // this.currentColor = randomColor;
    this.imgPath = "./assets/pictures/transparent.png"; // 或者设置为透明或空白图片的路径
    console.log(`Changed to random color: ${randomColor}`);
    this.applyRandomColorToImage(randomColor);
    return randomColor;
  }
  
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  hexToRGB(hex: string): number[] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  @Output() close = new EventEmitter<void>();

  @Output() hide = new EventEmitter<void>();

  @Output() show = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onHide(): void {
    this.hide.emit();
  }

  onShow(): void {
    this.show.emit();
  }

  onOpenAI(): void {
    const dialogRef = this.dialog.open(AiChatComponent, {
      //width: '1200px',
      //data: { /* 可选：传递给对话框组件的数据 */ }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // 处理对话框关闭后的逻辑
    });
  }
}