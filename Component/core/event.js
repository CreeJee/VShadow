
import Store from "./store.js";
import VSElement from "./vs-element.js";
const __pureEventSymbol = Symbol("@@pureEventSymbol");
const __travelNode = (selectedNode,findCallback)=>{
    let __recursive = (node)=> (node instanceof VSElement) ? findCallback(node) : Array.from(node.children).forEach(__recursive);
    return __recursive(selectedNode);
}
const __dispatchNearest = (selectedNode,key,value)=>{
    return __travelNode(selectedNode,(node)=>node.$store.dispatch(key,value));
}
const __inserthNode = (appendHost,key,value,node)=>{
    
    let selectedNode =  appendHost.appendChild(node.cloneNode(true));
    __dispatchNearest(selectedNode,key,value);
};
export default {
    dispatchAppend : (assignedElements,appendHost,k,v)=>{
        if(Array.isArray(assignedElements)){
            assignedElements.forEach(__inserthNode.bind(null,appendHost,k,v));
        }
        else{
            throw new Error("unknown dispatch target");
        }
    },
    dispatchChild : __dispatchNearest,
    parseExpression : (store,expr)=>{
        let keys = (store instanceof Store ? Array.from(store.keys()) : Object.keys(store)).filter((k)=>!(typeof k === "symbol"));
        let values = keys.map((k)=>store[k]);
        try{
            return new Function(...keys.concat(`return ${expr};`))(...values);
        }
        catch(e){
            throw new Error(`undefined expression on [${expr}]`);
        }
    },
    travelNode : __travelNode,
    symbol : __pureEventSymbol,
};