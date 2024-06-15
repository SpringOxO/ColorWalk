import { ChangeDetectionStrategy, Component, ElementRef, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { WhiteWorld } from './white-world.service';
import { CommonModule } from '@angular/common';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-white-world',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './white-world.component.html',
  styleUrl: './white-world.component.css'
})
export class WhiteWorldComponent {
  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  public constructor(private whiteWorld: WhiteWorld, private colorService: ColorService) {
  }

  public ngOnInit(): void {
    this.whiteWorld.createScene(this.rendererCanvas);
    this.whiteWorld.animate();
    this.colorService.currentColor.subscribe(color => {
      if (color) {
        this.whiteWorld.setSavedColor(color);
      }
    });
  }

  public coloration(event: MouseEvent): void {
    this.whiteWorld.coloration(event);
  }
}