import VSLoop from "./vs-loop.js";
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import VSUtil from "./core/util.js";
export default class VSif extends VSElement{
    constructor(){
        super();
    }
    static get template(){
        return fetch(`${VSUtil.getRelativeUrl(import.meta.url)}/dom/base/vs-if.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-if";
    }
    async VShadow(root,$factory,$store){
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        const assignedElements = slots.assignedElements();
        
        let cond = attributes.cond ? !!VSEventCore.parseExpression(this.parent,attributes.cond.value) : false;
        if(!cond){
            this.remove();
        }
        else if(root.host.parent instanceof VSLoop){
            $store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>assignedElements.filter((element)=>element instanceof VSElement).map((el)=>el.$store.dispatch(VSLoop.iterateSymbol,newVal)))
        }
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