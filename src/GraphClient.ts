/* eslint-disable @typescript-eslint/no-namespace */
import GraphCanvas from './components/GraphCanvas';
import Position from './components/Position';

export namespace GraphNamespace {
    export class GraphClient {
        private window: Window;
        private container: HTMLElement | null;
        private canvas: GraphCanvas | null;

        public constructor(containerId: string, window: Window) {
            this.window = window;
            this.container = document.getElementById(containerId);

            if (this.container == null) {
                console.log(
                    `Container with id ${containerId} not found - Client not initialized.`
                );
                this.canvas = null;
                return;
            }
            this.canvas = new GraphCanvas(this.container, window);
            this.canvas.draw();
        }
    }
}
