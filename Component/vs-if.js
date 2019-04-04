import VSLoop from "./vs-loop.js";
import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {getRelativeUrl} from "./core/util.js";

const condSymbol = Symbol("@@notCondSymbol");
const isDispatched = Symbol("@@isDispatched");
const _dispatch = (self,[val,key])=>{
    const attributes = self.attributes;
    const $store = self.$store;
    let cond = false;
    $store.children.forEach(($store)=>{
        if(cond = VSEventCore.parseExpression({value : val},(attributes.cond || {}).value)){
            $store.dispatch(VSLoop.iterateSymbol,[val,key])
        }
        $store.dispatch(condSymbol,[cond,val,key]);
    })
}
const VSIfGen = (superClass) => class VSif extends VSElement.extend(superClass){
    constructor(){
        super();
        this[isDispatched] = false;
        this.$store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>{
            this[isDispatched] = true;
            _dispatch(this,newVal);
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
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        if(!isDispatched){ 
            let cond = (attributes.cond ? !!VSEventCore.parseExpression(this,attributes.cond.value) : false);
            if(cond){
                _dispatch(this,$store);
            }
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
export default VSIfGen(HTMLElement);