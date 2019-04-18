
import Store from "./store.js";
import VSElement from "./vs-element.js";
const __pureEventSymbol = Symbol("@@pureEventSymbol");
const __boundEventSymbol = Symbol("@@boundEventSymbol")
const __travelNode = async (selectedNode,findCallback)=>{
    let __recursive = async (node)=> (node instanceof VSElement) ? await findCallback(node) : Array.from(node.children).forEach(__recursive);
    return await __recursive(selectedNode);
}
const __dispatchNearest = async (selectedNode,key,value)=>{
    return await __travelNode(selectedNode,async (node)=>node.$store.dispatch(key,value));
}
const __inserthNode = async (appendHost,key,value,node)=>{
    
    let selectedNode = appendHost.appendChild(document.importNode(node,true));
    await __dispatchNearest(selectedNode,key,value);
};
export default {
    dispatchAppend : async (assignedElements,appendHost,k,v)=>{
        if(Array.isArray(assignedElements)){
            assignedElements.forEach(__inserthNode.bind(null,appendHost,k,v));
        }
        else{
            throw new Error("unknown dispatch target");
        }
    },
    dispatchChild : __dispatchNearest,
    // use bind expression scope this;
    parseExpression : function(store,expr){
        let keys = (store instanceof Store ? Array.from(store.keys()) : Object.keys(store)).filter((k)=>!(typeof k === "symbol"));
        let values = keys.map((k)=>store[k]);
        try{
            return new Function(...keys.concat(`return ${expr};`)).apply(this,values);
        }
        catch(e){
            throw new Error(`undefined expression on [${expr}]`);
        }
    },
    travelNode : __travelNode,
    symbol : __pureEventSymbol,
    boundSymbol : __boundEventSymbol,
};