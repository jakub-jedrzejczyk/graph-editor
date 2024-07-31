import { GraphNamespace } from './GraphClient'
export { };
declare global {
    var GraphClient: typeof GraphNamespace.GraphClient;
    interface GraphClient extends GraphNamespace.GraphClient { }
}
Object.assign(globalThis, GraphNamespace);