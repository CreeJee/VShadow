import VSLoop from "./vs-loop.js";
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";

import {getRelativeUrl} from "./core/util.js";
import Store from "./core/store.js";

const beforeDisplaySymbol = Symbol("@@beforeDisplay");
const condSymbol = Symbol("@@condSymbol");
const _dispatch = async function([val,key]){
    const $store = this.$store;
    const ChildElements = Array.from(this.children);
    let cond = !!VSEventCore.parseExpression({key : key,value : val},(this.getAttribute("cond") || ""));
    if(cond){
        this.style.display = $store.get(beforeDisplaySymbol);
        await $store.dispatchChild(VSLoop.iterateSymbol,[val,key]);
    }
    else{
        if(!this.$store.has(beforeDisplaySymbol)){
            this.$store.forceSet(beforeDisplaySymbol,window.getComputedStyle(this,null).display);
        }
        this.style.display = "none";
    }
}
const VSIfGen = (superClass) => class VSif extends VSElement.extend(superClass){
    constructor(){
        super();
        this.$store.attach(VSLoop.iterateSymbol,async (oldVal,newVal)=>{
            await _dispatch.apply(this,[newVal]);
        })
    }
    static get condSymbol(){
        return condSymbol;
    }
    static get template(){
        return fetch(`${getRelativeUrl(import.meta.url)}/dom/base/vs-if.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-if";
    }
    static extend(superClass){
        return VSIfGen(superClass);
    }
    async VShadow(root,$store){

    }
    //on dom attached
    connectedCallback(){
    }
    //on dom deteched
    disconnectedCallback(){

    }
    //on attribute change
    attributeChangedCallback(key,oldVal,newVal){
        this.$store.dispatch(key,newVal);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}
export default VSIfGen(HTMLElement);
export {VSIfGen,condSymbol};