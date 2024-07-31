export default class Utils {
    // per: https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e
    public static round(
        value: number,
        scale: number,
        resolution: number
    ): number {
        //const precision = Math.pow(10, Math.trunc(resolution));
        return (
            Math.round(
                Math.round(((value + Number.EPSILON) * resolution) / scale) *
                    scale
            ) / resolution
        );
    }

    public static toFixed(value: number, scale: number): number {
        return Math.round(value / scale) * scale;
    }
}
