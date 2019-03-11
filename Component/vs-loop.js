import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import Store from "./core/store.js";
import {getRelativeUrl} from "./core/util.js";

const iterateSymbol = Symbol("@@IterateSymbol");
const limitChange = function(assignedElements,key,value){
    let $store = this.$store;
    let start =  $store.get("start");
    let total = $store.get("total");
    let data = null;
    let $childStore = $store.children;

    if(key === "as"){
        $store.set("as",data = value);
    }
    if(Array.isArray(data)){
        $store.set("data",data = data.slice(start,total));
    }
    else{
        $store.set("data",data = Array.from({ length: (total - start) }, (_, i) => start + (i)))
    }
    data.forEach((v,k,arr)=>{
        if($childStore[k] instanceof Store){
            $childStore[k].dispatch(iterateSymbol,v);
        }
        else{
            VSEventCore.dispatchChild(assignedElements,this.root.host,iterateSymbol,v);
        }
    });
    debugger;
    // TODO : iterate관련 loop 핸들링
    $childStore.filter((v,i)=>!data.includes(i)).forEach(()=>{
        let index = data.length
        let garbageStore = $childStore.splice(index,1)[0];
        garbageStore.parent = null;
        this.children[index].remove();
    })
};
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
    static get observedAttributes() {
      return ['start','total','data','as'];
    }
    static get iterateSymbol(){
        return iterateSymbol;
    }
    async VShadow(root,$store){
        const attributes = root.host.attributes;
        const slots = root.getElementById("slot");
        const assignedElements = slots.assignedElements();
        let temp = -1;
        let iterateStart = null,iterateTotal = null;
        let iterateAsArray = [];
        let fillEnd = -1;
        $store.set("start",iterateStart = attributes.start ? (isNaN(temp = parseInt(attributes.start.value)) ? VSEventCore.parseExpression(this.parent,attributes.start.value) : temp ) : 0);
        $store.set("total",iterateTotal = attributes.total ? (isNaN(temp = parseInt(attributes.total.value)) ? VSEventCore.parseExpression(this.parent,attributes.total.value) : temp ) : undefined); 
        fillEnd = iterateStart+iterateTotal;
        try{
            $store.set("data",iterateAsArray = attributes.as ? ($store.forceSet("as",VSEventCore.parseExpression(this.parent,attributes.as.value) || [])).slice(iterateStart,fillEnd) : Array.from({ length: (fillEnd - iterateStart) }, (_, i) => iterateStart + (i)));
        }
        catch(e){
            throw new Error(`undefined variable on [${attributes.as.value}]`);
        }
        
        assignedElements.forEach((node)=>{
            node.remove();
        });
        // dispatch new generate and cached
        iterateAsArray.forEach((v)=>{
            VSEventCore.dispatchChild(assignedElements,root.host,iterateSymbol,v)
        });
        $store.attach("start",limitChange.bind(this,assignedElements,"start"));
        $store.attach("total",limitChange.bind(this,assignedElements,"total"));
        $store.attach("data",limitChange.bind(this,assignedElements,"data"));
        $store.attach("as",limitChange.bind(this,assignedElements,"as"));
    }
    //on dom attached
    connectedCallback(){
    }
    //on dom deteched
    disconnectedCallback(){

    }
    //on attribute change
    attributeChangedCallback(key,oldVal,newVal){
        let temp = 0;
        return this.$store.dispatch(key,isNaN(temp = parseInt(newVal)) ? VSEventCore.parseExpression(this.parent,newVal) : temp);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}