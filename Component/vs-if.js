import VSLoop from "./vs-loop.js";
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {getRelativeUrl} from "./core/util.js";

const condSymbol = Symbol("@@condSymbol");
export default class VSif extends VSElement{
    constructor(baseElement){
        super(baseElement);
    }
    static get template(){
        return fetch(`${getRelativeUrl(import.meta.url)}/dom/base/vs-if.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-if";
    }
    async VShadow(root,$factory,$store){
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        const assignedElements = slots.assignedElements();
        
        let cond = false;
        $store.set("cond",cond = (attributes.cond ? !!VSEventCore.parseExpression(this.parent,attributes.cond.value) : false));
        if(!cond){
            debugger;
        }
        if(this.parent instanceof VSLoop){
            $store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>{
                $store.children.forEach(($store)=>$store.lazyDispatch(VSLoop.iterateSymbol,newVal))
            })
        }
        $store.attach("cond",(preVal,val)=>{

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
        this.$store.dispatch(key,newVal);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}