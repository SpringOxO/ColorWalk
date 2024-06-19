import { Component, Injectable } from '@angular/core';
import { PaletteColorService } from '../palette-color.service';

@Component({
  selector: 'app-eyedropper',
  standalone: true,
  imports: [],
  templateUrl: './eyedropper.component.html',
  styleUrl: './eyedropper.component.css'
})
/*
  * This component is used to pick a color from the screen.
  * It can be imported and used in any other component.
  * the html file provides a reference ui design.
  * to copy the ui you need to define a local hasEyeDrop variable in the component.
  * you can initialize it with eyeDropper method.
  */
@Injectable()
export class EyedropperComponent {
  hasEyeDrop: boolean;
  public constructor(private paletteColorService: PaletteColorService) {
    this.hasEyeDrop = 'EyeDropper' in window;
  }

  /*
  * This method uses the EyeDropper API to pick a color from the screen.
  * the api is only available in Chrom and Edge.
  * checking if the EyeDropper is available in the window object is necessary.
  * use an assertion to avoid typescript errors.
  */
  async nativePick(event?: any): Promise<number> {
    const val = event ? event.target.value : null;
    let decimalValue = -1;
  
    if (val) {
      console.log('获得颜色: ' + val);
    } else if (this.hasEyeDrop) {
      const eyeDropper = new (window as any)['EyeDropper']();
      console.log('按Esc可退出');
      try {
        const result = await eyeDropper.open();
        console.log(result);
        this.paletteColorService.changeColor(result.sRGBHex);
        let hexColor = result.sRGBHex.replace("#", "");
        decimalValue = parseInt(hexColor, 16);
        console.log('获得颜色: ' + result.sRGBHex);
        
      } catch (e) {
        console.log('用户取消了取色');
      }
    }
    return decimalValue;
  }

  public eyeDropper(): boolean {
    return this.hasEyeDrop;
  }
}
