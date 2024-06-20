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
  imgIntro : string = '';

  imgIntroSet =[
    '蒙德里安的《红黄蓝的构成》是荷兰风格派艺术的代表作之一。这幅画创作于1930年,'+
    '以抽象的几何图形和三原色为主要元素,表现了蒙德里安对绝对纯粹、普遍和谐的追求。'+
    '画面由黑色的垂直线和水平线分割成不规则的方块,部分方块填充以鲜艳的红、黄、蓝三种颜色,'+
    '其余则为白色。这种简洁的构图强调了平面性和非对称性的美感,同时凸显了原色的强烈视觉冲击力。'+
    '蒙德里安通过这种几何抽象的表现手法,剥离了一切具象元素,力图揭示隐藏在万物之后的普遍规律和绝对秩序。'+
    '《红黄蓝的构成》完美体现了风格派"新造型主义"的核心思想,成为抽象艺术发展史上的里程碑之作。'
    ,
    '大碗岛的星期日下午是法国后印象派画家乔治·修拉的代表作之一,完成于1884年至1886年间。'+
    '这幅画描绘了塞纳河畔大碗岛上巴黎人周日下午的休闲景象。'+
    '画面中众多人物或三三两两交谈,或独自休憩,衣着鲜艳多彩,营造出轻松愉悦的氛围。'+
    '修拉运用了标志性的点彩技法,用细小的点状色块构成画面,色彩明快丰富。整幅画构图稳健,'+
    '人物、树木、水面与天空巧妙融合,呈现出一派祥和宁静的景象。'+
    '这幅画生动再现了19世纪末巴黎市民的休闲生活,体现出修拉作为新印象主义代表画家精湛的艺术技巧,'+
    '是印象派绘画的经典之作。它现藏于美国芝加哥艺术博物馆。'
    ,
    '莫奈的《日出印象》创作于1872年，是印象派绘画的代表作之一。'+
    '这幅画描绘了法国勒阿弗尔港口的日出景象，朦胧的晨雾笼罩着港口，隐约可见船只的轮廓。'+
    '莫奈通过快速的笔触和鲜明的色彩，捕捉了朝阳初升时那转瞬即逝的光影变化。'+
    '橙色和蓝色的交织体现了日出时独特的色彩效果。这幅作品不仅展现了莫奈高超的写生技巧，'+
    '也开启了印象派艺术注重光与色的先河，对西方现代绘画产生了深远影响。'+
    '《日出印象》体现了印象派"捕捉瞬间，描绘光影"的创作理念，是莫奈的代表作，也是印象派艺术的标志性画作之一。',
  ];

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
        this.imgIntro = this.imgIntroSet[0];
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
          this.imgIntro = this.imgIntroSet[1];
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
          this.imgIntro = this.imgIntroSet[2];
          this.colorDrops = [
            { idx: 0, color: '#6c8593', selected: false, passed: false },
            { idx: 1, color: '#ce7a69', selected: false, passed: false },
            { idx: 2, color: '#9ea993', selected: false, passed: false }
          ];
        }
        break;
      default:
        this.imgIntro = '';
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