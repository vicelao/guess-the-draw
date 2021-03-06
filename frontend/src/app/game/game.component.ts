import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FreeHand } from '../models/tools/free-hand';
import { Tool } from '../models/tools/tool';
import { Coordinate, getRelativeCoordinate } from '../models/coordinate';
import { Eraser } from '../models/tools/eraser';
import { SquareLine } from '../models/tools/square-line';
import { SquareSolid } from '../models/tools/square-solid';
import { faRedo, faUndo, faTrash, faShare } from '@fortawesome/free-solid-svg-icons';
import { CircleSolid } from '../models/tools/circle-solid';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Route } from '@angular/router';
import { PaintBucket } from '../models/tools/paint-bucket';
import { Color } from '../models/color';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {
  faUndo = faUndo;
  faRedo = faRedo;
  faTrash = faTrash;
  faShare = faShare;

  coordinate: Coordinate = {x: 0, y: 0}
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  svg: HTMLDivElement;

  tools: Tool[];
  currentTool: Tool;
  selectedSize = 10;

  colors: Color[] = [
    {
      code: '#333',
      hex: 0xFF333333
    },
    {
      code: '#fff',
      hex: 0xFFFFFFFF
    },
    {
      code: '#2ecc71',
      hex: 0xFF71cc2e
    },
    {
      code: '#3498db',
      hex: 0xFFdb9834
    },
    {
      code: '#e74c3c',
      hex: 0xFF3c4ce7
    },
    {
      code: '#8e44ad',
      hex: 0xFFad448e
    },
    {
      code: '#ecf0f1',
      hex: 0xFFf1f0ec
    },
    {
      code: '#f39c12',
      hex: 0xFF129cf3
    },
    {
      code: '#bdc3c7',
      hex: 0xFFc7c3bd
    },    {
      code: '#f1c40f',
      hex: 0xFF0fc4f1
    }
  ];
  selectedColor: Color;

  historic: string[]

  shareUrl: string;
  drawing = false;
  constructor(private route: ActivatedRoute) {
    this.historic = [];
    this.selectedColor = this.colors[0];
    this.tools = [
      new CircleSolid(this.selectedColor, { min: 1, max: 30, current: 5 }),
      new SquareLine(this.selectedColor, { min: 1, max: 30, current: 3 }),
      new SquareSolid(this.selectedColor, { min: 0, max: 0, current: 0 }),
      new FreeHand(this.selectedColor, { min: 1, max: 30, current: 10 }),
      new Eraser(this.selectedColor, { min: 1, max: 500, current: 200 }),
      new PaintBucket(this.selectedColor, { min: 1, max: 500, current: 200 }),
    ]
    this.currentTool = this.tools[0];
  }

  ngOnInit(): void {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.svg = document.getElementById('svg') as HTMLDivElement;
    
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
      const rect = this.canvas.getBoundingClientRect();

      this.canvas.width = rect.right - rect.left;
      this.canvas.height = rect.bottom - rect.top;

      this.svg.setAttribute("width", `${rect.right - rect.left}px`);
      this.svg.setAttribute("height", `${rect.bottom - rect.top}px`);

      this.canvas.onmousedown = (ev: MouseEvent) => {
        this.drawing = true;
        this.historic.push(this.canvas.toDataURL());
        this.currentTool.startDrawing(this.ctx, getRelativeCoordinate(ev, this.canvas), this.canvas);
      }

      this.canvas.onmousemove = (ev: MouseEvent) => {
        this.coordinate = getRelativeCoordinate(ev, this.canvas);
        this.currentTool.preview(this.ctx, this.coordinate, this.canvas);
        if(this.drawing){
          this.currentTool.onDrawing(this.ctx, this.coordinate, this.canvas);
        }
      }

      this.canvas.onmouseup = (ev: MouseEvent) => {
        this.drawing = false;
        this.currentTool.onEndDrawing(this.ctx, this.coordinate, this.canvas)
      }
    }

    this.route.queryParams.subscribe(params => {
      const source = params['source'];
      if(source){
        this.setCanvasContent(source)
      }
    });
  }

  public setColor(color: Color){
    this.selectedColor = color;
    this.currentTool.setColor(color);
  }

  setTool(tool: Tool){
    this.drawing = false;
    this.currentTool = tool;
    this.setColor(this.selectedColor);
  }

  undo(){
    const source = this.historic.pop();
    this.setCanvasContent(source);
    this.ngOnInit();
  }

  private setCanvasContent(source: string){
    const img = new Image;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);    
    img.src = source;
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0);
    };
  }

  clear(){
    console.log(this.historic);
    this.historic = []
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ngOnInit();
  }

  share(){
    this.shareUrl = environment.baseUrl + '/game?source=' + this.canvas.toDataURL();
    const input = document.createElement('input');
    input.setAttribute('value', this.shareUrl);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  isSelectedTool(tool: Tool): boolean {
    return this.currentTool === tool;
  }
}
