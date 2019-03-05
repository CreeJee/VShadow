import VSLoop from "./vs-loop.js";
import EventCore from "./core/event.js";
export default class VSif extends HTMLElement{
    constructor(){
        super();
    }
    static get template(){
        return fetch("./Component/dom/base/vs-if.html").then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-if";
    }
    async VShadow(root,$factory,$store){
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        const assignedElements = slots.assignedElements();
        
        let cond = attributes.cond ? !!EventCore.parseExpression(this.parent,attributes.cond.value) : false;
        if(!cond){
            this.remove();
        }
        else if(root.host.parent instanceof VSLoop){
            $store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>{
            })
        }
        else{
            debugger;
        }

        // TODO : cond
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