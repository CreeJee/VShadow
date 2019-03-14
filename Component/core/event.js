
import Store from "./store.js";
import VSElement from "./vs-element.js";
const __dispatchNearest = (selectedNode,key,value)=>{
    let __recursive = (node)=> (node instanceof VSElement) ? node.$store.dispatch(key,value) : Array.from(node.children).forEach(__recursive);
    return __recursive(selectedNode);
}
const _inserthNode = (appendHost,isInsert,key,value,node,k)=>{
    
    let selectedNode =  isInsert ? appendHost.appendChild(node.cloneNode(true)) : appendHost.children[k];
    __dispatchNearest(selectedNode,key,value);
};
export default {
    dispatchAppend : (assignedElements,appendHost,k,v,isInsert = true)=>{
        let childStore = appendHost.$store.children;
        if(Array.isArray(assignedElements)){
            assignedElements.forEach(_inserthNode.bind(null,appendHost,isInsert,k,v));
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
    }
};