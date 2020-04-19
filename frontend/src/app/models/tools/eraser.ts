import { Tool } from './tool';
import { Coordinate, getRelativeCoordinate } from '../coordinate';

export class Eraser extends Tool {

    private eraserDiv: HTMLDivElement;

    get name(): string {
        return "Eraser"
    }
    get icon(): string {
        return "Eraser tool"
    }
    startDrawing(ctx: CanvasRenderingContext2D, mouse: Coordinate, canvas: HTMLCanvasElement) {
        this.erase(ctx, mouse);
    }
    onDrawing(ctx: CanvasRenderingContext2D, mouse: Coordinate, canvas: HTMLCanvasElement) {
        this.erase(ctx, mouse);
    }
    onEndDrawing(ctx: CanvasRenderingContext2D, mouse: Coordinate, canvas: HTMLCanvasElement) {
        this.erase(ctx, mouse);
    }

    private erase(ctx: CanvasRenderingContext2D, mouse: Coordinate){
        ctx.fillStyle = this.color;
        ctx.fillRect(mouse.x - this.size/2 , mouse.y - this.size/2, this.size, this.size);
    }

    preview(ctx: CanvasRenderingContext2D, mouse: Coordinate, canvas: HTMLCanvasElement) {
        let draw = (coord: Coordinate) => {
            this.eraserDiv.style.width = `${this.size}px`;
            this.eraserDiv.style.height = `${this.size}px`;
            this.eraserDiv.style.backgroundColor = this.color
            this.eraserDiv.style.top = `${coord.y - this.size/2}px`;
            this.eraserDiv.style.left = `${coord.x - this.size/2}px`;
        }
        
        if(!this.eraserDiv){
            let container = document.getElementById("canvasContainer")
            this.eraserDiv = container.appendChild(document.createElement("div") as HTMLDivElement);
            this.eraserDiv.style.position = "absolute";
            this.eraserDiv.style.zIndex = "2"
            this.eraserDiv.onmousemove = (ev: MouseEvent) => {
                let coord = getRelativeCoordinate(ev, canvas);
                draw(coord);
                canvas.onmousemove(ev);
            }
        }
        this.eraserDiv.onmousedown = canvas.onmousedown;
        this.eraserDiv.onmouseup = canvas.onmouseup;
        draw(mouse);
        let rect = canvas.getBoundingClientRect()
        console.log(`mouse x: ${mouse.x}, rect.right: ${rect.right - rect.left} `)
        if(mouse.x < this.size/2 || mouse.x > rect.right - rect.left || mouse.y < this.size/2 || mouse.y > rect.bottom) {
            this.eraserDiv.style.display = "none";
        }
        else{
            this.eraserDiv.style.display = "block";
        }
    }
}