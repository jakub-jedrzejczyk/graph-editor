import Position from './Position';
import Utils from './Utils';

export default class GraphCanvas {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private center: Position;
    private scale: number = 1;
    private step: number = 150;
    private zoomRatio: number = 1.1;
    private minGridSize: number = 100;
    private maxGridSize: number = 200;
    private mode: EditorMode = 'view';

    private currentMousePosition: Position = new Position(0, 0);
    private previousMousePosition: Position = new Position(0, 0);
    private mouseDown: boolean = false;

    public constructor(container: HTMLElement, window: Window) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d')!;
        this.center = new Position(0, 0);

        this.resizeCanvas(
            this.container.clientWidth,
            this.container.clientHeight
        );
        window.addEventListener('resize', () => {
            if (this.canvas != null) {
                this.resizeCanvas(
                    this.container!.clientWidth,
                    this.container!.clientHeight
                );
            }
        });
        this.canvas.addEventListener('wheel', (event: WheelEvent) =>
            this.zoomHandler(event)
        );
        this.canvas.addEventListener('mousedown', (event: MouseEvent) =>
            this.clickHandler(event)
        );
        this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
            this.moveHandler(event);
        });
        this.canvas.addEventListener('mouseup', (event: MouseEvent) =>
            this.clickEndHandler(event)
        );
    }

    public zoomHandler(event: WheelEvent) {
        const modifier = event.deltaY > 0 ? 1 / this.zoomRatio : this.zoomRatio;
        const canvasCursorPosition = this.getCanvasPositionFromViewportPosition(
            new Position(event.clientX, event.clientY)
        );
        this.step *= modifier;

        const newCanvasCursorPosition =
            this.getCanvasPositionFromViewportPosition(
                new Position(event.clientX, event.clientY)
            );

        this.center.x += canvasCursorPosition.x - newCanvasCursorPosition.x;
        this.center.y += canvasCursorPosition.y - newCanvasCursorPosition.y;

        if (this.step < this.minGridSize) {
            this.step *= this.maxGridSize / this.minGridSize;
            this.scale /= this.maxGridSize / this.minGridSize;
        } else if (this.step > this.maxGridSize) {
            this.step *= this.minGridSize / this.maxGridSize;
            this.scale *= this.maxGridSize / this.minGridSize;
        }

        this.draw();
    }

    public clickHandler(event: MouseEvent) {
        this.currentMousePosition = new Position(event.offsetX, event.offsetY);
        this.mouseDown = true;
    }

    public moveHandler(event: MouseEvent) {
        // const canvasPosition = this.getCanvasPositionFromViewportPosition(
        //     new Position(event.offsetX, event.offsetY)
        // );
        // console.log(canvasPosition);
        if (!this.mouseDown) {
            return;
        }
        if (this.mode === 'view') {
            this.previousMousePosition = this.currentMousePosition;
            this.currentMousePosition = new Position(
                event.offsetX,
                event.offsetY
            );
            const currentCanvasPosition =
                this.getCanvasPositionFromViewportPosition(
                    this.currentMousePosition
                );
            const previousCanvasPosition =
                this.getCanvasPositionFromViewportPosition(
                    this.previousMousePosition
                );
            this.center.x -= currentCanvasPosition.x - previousCanvasPosition.x;
            this.center.y -= currentCanvasPosition.y - previousCanvasPosition.y;
            this.draw();
        }
    }

    public clickEndHandler(event: MouseEvent) {
        this.mouseDown = false;
    }

    public resizeCanvas(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.draw();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getSize(): {width: number; height: number} {
        return {width: this.canvas.width, height: this.canvas.height};
    }

    public draw() {
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    public getCenter(): Position {
        return this.center;
    }

    public getScale(): number {
        return this.scale;
    }

    private drawGrid() {
        /**
         * Draws the cartesian grid on the canvas, taking into account the current scale and center.
         */

        const size = this.getSize();
        const nearestScaleCenterX = Utils.toFixed(this.center.x, this.scale);
        const nearestScaleCenterY = Utils.toFixed(this.center.y, this.scale);
        console.log(
            `${nearestScaleCenterX}, ${nearestScaleCenterY}, ${this.scale}`
        );

        this.drawHorizontalGridLine(nearestScaleCenterY);
        this.drawVerticalGridLine(nearestScaleCenterX);

        let x = nearestScaleCenterX + this.scale;
        let y = nearestScaleCenterY + this.scale;
        let viewportPosition = this.getViewportPositionFromCanvasPosition(
            new Position(x, y)
        );
        while (
            viewportPosition.x < size.width ||
            viewportPosition.y < size.height
        ) {
            this.drawVerticalGridLine(x);
            this.drawHorizontalGridLine(y);
            x += this.scale;
            y += this.scale;
            viewportPosition = this.getViewportPositionFromCanvasPosition(
                new Position(x, y)
            );
        }

        x = nearestScaleCenterX - this.scale;
        y = nearestScaleCenterY - this.scale;
        viewportPosition = this.getViewportPositionFromCanvasPosition(
            new Position(x, y)
        );
        while (viewportPosition.x > 0 || viewportPosition.y > 0) {
            this.drawVerticalGridLine(x);
            this.drawHorizontalGridLine(y);
            x -= this.scale;
            y -= this.scale;
            viewportPosition = this.getViewportPositionFromCanvasPosition(
                new Position(x, y)
            );
        }
    }

    private drawVerticalGridLine(canvasX: number) {
        if (canvasX === 0) {
            this.context.strokeStyle = 'rgba(255, 255, 255, 1)';
            this.context.lineWidth = 2;
        } else {
            this.context.strokeStyle = 'rgba(255, 255, 255, 0.66)';
            this.context.lineWidth = 1;
        }
        const viewportX = this.getViewportPositionFromCanvasPosition(
            new Position(canvasX, 0)
        ).x;
        const size = this.getSize();
        this.context.beginPath();
        this.context.moveTo(viewportX, 0);
        this.context.lineTo(viewportX, size.height);
        this.context.stroke();
    }

    private drawHorizontalGridLine(canvasY: number) {
        if (canvasY === 0) {
            this.context.strokeStyle = 'rgba(255, 255, 255, 1)';
            this.context.lineWidth = 2;
        } else {
            this.context.strokeStyle = 'rgba(255, 255, 255, 0.66)';
            this.context.lineWidth = 1;
        }
        const viewportX = this.getViewportPositionFromCanvasPosition(
            new Position(0, canvasY)
        ).y;
        const size = this.getSize();
        this.context.beginPath();
        this.context.moveTo(0, viewportX);
        this.context.lineTo(size.width, viewportX);
        this.context.stroke();
    }

    public getCanvasPositionFromViewportPosition(
        viewportPosition: Position
    ): Position {
        const size = this.getSize();
        const xTranslated: number =
            (viewportPosition.x - size.width / 2) / (this.step / this.scale) +
            this.center.x;
        const yTranslated: number =
            (viewportPosition.y - size.height / 2) / (this.step / this.scale) +
            this.center.y;
        return new Position(xTranslated, yTranslated);
    }

    public getViewportPositionFromCanvasPosition(
        canvasPosition: Position
    ): Position {
        const size = this.getSize();
        const xTranslated: number =
            (canvasPosition.x - this.center.x) * (this.step / this.scale) +
            size.width / 2;
        const yTranslated: number =
            (canvasPosition.y - this.center.y) * (this.step / this.scale) +
            size.height / 2;
        return new Position(xTranslated, yTranslated);
    }
}
