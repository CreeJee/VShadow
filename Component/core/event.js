
import Store from "./store.js";
import VSElement from "./vs-element.js";
const _inserthNode = (appendHost,isInsert,key,value,node,k)=>{
    
    let selectedNode =  isInsert ? appendHost.appendChild(node.cloneNode(true)) : appendHost.children[k];
    let __recursive = (node,k)=>{
        if(node instanceof VSElement){
            node.$store.dispatch(key,value);
        }
        else{
            Array.from(node.children).forEach(__recursive);
        }
    };
    __recursive(selectedNode,k);
};
const _searchNode = ()=>{

}
export default {
    dispatchChild : (assignedElements,appendHost,k,v,isInsert = true)=>{
        let childStore = appendHost.$store.children;
        if(Array.isArray(assignedElements)){
            assignedElements.forEach(_inserthNode.bind(null,appendHost,isInsert,k,v));
        }
        else{
            throw new Error("unknown dispatch target");
        }
    },
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