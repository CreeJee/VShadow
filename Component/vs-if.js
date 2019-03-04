import VSLoop from "./vs-loop.js";
const __parseExpr = (parent,expr)=>{
    let keys = (parent instanceof Map ? Array.from(parent.keys()) : Object.keys(parent)).filter((k)=>!(typeof k === "symbol"));
    let values = keys.map((k)=>parent[k]);
    try{
        return new Function(...keys.concat(`return ${expr};`))(...values);
    }
    catch(e){
        throw new Error(`undefined expression on [${expr}]`);
    }
}
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
        const baseElementArray = root.getElementById("slot").assignedElements();

        let cond = attributes.cond ? !!__parseExpr(this.$parent,attributes.cond.value) : false;
        
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