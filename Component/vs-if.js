import VSLoop from "./vs-loop.js";
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {getRelativeUrl} from "./core/util.js";

const notSymbol = Symbol("@@notCondSymbol");
const isDispatched = Symbol("@@isDispatched");
const _dispatch = (self,val)=>{
    const attributes = self.attributes;
    const $store = self.$store;
    $store.children.forEach(($store)=>{
        if(VSEventCore.parseExpression({value : val},(attributes.cond || {}).value)){
            $store.dispatch(VSLoop.iterateSymbol,val)
        }
        else{
            $store.dispatch(notSymbol,val);
        }
    })
}
export default class VSif extends VSElement{
    constructor(baseElement){
        super(baseElement);
        this[isDispatched] = false;
        this.$store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>{
            this[isDispatched] = true;
            _dispatch(this,newVal);
        })
    }
    static get notSymbol(){
        return notSymbol;
    }
    static get template(){
        return fetch(`${getRelativeUrl(import.meta.url)}/dom/base/vs-if.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-if";
    }
    async VShadow(root,$store){
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        if(!isDispatched){ 
            let cond = (attributes.cond ? !!VSEventCore.parseExpression(this.parent,attributes.cond.value) : false)
            _dispatch(this,$store);
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
        this.$store.dispatch(key,newVal);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}