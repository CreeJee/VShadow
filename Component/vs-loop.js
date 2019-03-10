import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {getRelativeUrl} from "./core/util.js";

const originalSymbol = Symbol("@@originalData");
const tempateSymbol = Symbol("@@templateSymbol");
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
        let iterateStart = null,iterateCount = null;
        let iterateAsArray = [];
        let fillEnd = -1;
        $store.set("start",iterateStart = attributes.start ? (isNaN(temp = parseInt(attributes.start.value)) ? VSEventCore.parseExpression(this.parent,attributes.start.value) : temp ) : 0);
        $store.set("count",iterateCount = attributes.count ? ((isNaN(temp = parseInt(attributes.count.value)) ? VSEventCore.parseExpression(this.parent,attributes.count.value) : temp ) ) : undefined); 
        fillEnd = iterateStart+iterateCount;
        try{
            $store.set("data",iterateAsArray = attributes.as ? ($store.set(originalSymbol,VSEventCore.parseExpression(this.parent,attributes.as.value) || [])).slice(iterateStart,fillEnd) : Object.keys(Array(fillEnd).fill(null,iterateStart,fillEnd)));
        }
        catch(e){
            throw new Error(`undefined variable on [${attributes.as.value}]`);
        }
        
        assignedElements.forEach((node)=>{
            node.remove();
        });
        // dispatch new generate and cached
        iterateAsArray.forEach((v)=>VSEventCore.dispatchChild(assignedElements,root.host,iterateSymbol,v));
        const limitChange = (key,value)=>{
            let iterateAsArray = key === "data" ? $store.set(originalSymbol,VSEventCore.parseExpression(this.parent,value)) : $store.get(originalSymbol);
            iterateAsArray.forEach((v)=>VSEventCore.dispatchChild(assignedElements,root.host,iterateSymbol,v));
        };
        $store.attach("start",limitChange.bind(null,"start"));
        $store.attach("count",limitChange.bind(null,"count"));
        $store.attach("data",limitChange.bind(null,"data"));
        
        // TODO : 각각 observe에 attach하기

    }
    //on dom attached
    connectedCallback(){
    }
    //on dom deteched
    disconnectedCallback(){

    }
    //on attribute change
    attributeChangedCallback(key,oldVal,newVal){
        debugger;
        return this.$store.dispatch(key,VSEventCore.parseExpression(newVal));
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}