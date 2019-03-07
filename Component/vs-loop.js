
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {getRelativeUrl} from "./core/util.js";
const __getProperty = (data,...props)=>{
    if(props.length === 1){
        return data[props[0]];
    }
    return __getProperty(data instanceof Map ? data.get(props[0]) : Reflect.get(data,props[0]),props.slice(1))
};
const iterateSymbol = Symbol("@@IterateSymbol");
export default class VSLoop extends VSElement{
    constructor(){
        super();
    }
    static get template(){
        return fetch(`${getRelativeUrl(import.meta.url)}/dom/base/vs-loop.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-loop";
    }
    static get iterateSymbol(){
        return iterateSymbol;
    }
    async VShadow(root,$factory,$store){
        $store.test = true;

        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        const assignedElements = slots.assignedElements();
        let temp = -1;
        let iterateStart = attributes.start ? (isNaN(temp = parseInt(attributes.start.value)) ? VSEventCore.parseExpression(this.parent,attributes.start.value) : temp ) : 0;
        let iterateCount = attributes.count ? (isNaN(temp = parseInt(attributes.count.value)) ? VSEventCore.parseExpression(this.parent,attributes.count.value) : temp ) : undefined; 
        let iterateAsArray = [];
        try{
            iterateAsArray = attributes.as ? (VSEventCore.parseExpression(this.parent,attributes.as.value) || []).slice(iterateStart,iterateCount) : Array(iterateCount).fill(null,iterateStart,iterateCount).map((v,k)=>k);
        }
        catch(e){
            throw new Error(`undefined variable on [${attributes.as.value}]`);
        }
        iterateAsArray.forEach((v)=>{
            VSEventCore.dispatchChild(assignedElements,root.host,iterateSymbol,v);
        });
        assignedElements.forEach((node)=>{
            node.remove();
        })
    }
    //on dom attached
    connectedCallback(){
    }
    //on dom deteched
    disconnectedCallback(){

    }
    //on attribute change
    attributeChangedCallback(key,oldVal,newVal){

    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}