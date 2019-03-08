
import Store from "./store.js";
export default {
    dispatchChild : (assignedElements,appendHost,k,v)=>{
        let childStore = appendHost.$store.children;
        if(Array.isArray(assignedElements)){
            assignedElements.forEach((node)=>{
                let cloneNode = node.cloneNode(true);
                appendHost.appendChild(cloneNode);
                if(childStore.length > 0){
                    childStore[childStore.length-1].lazyDispatch(k,v);
                }
            });
        }
        else{
            throw new Error("unknown dispatch target");
        }
    },
    parseExpression : (parent,expr)=>{
        let keys = (parent instanceof Map ? Array.from(parent.keys()) : Object.keys(parent)).filter((k)=>!(typeof k === "symbol"));
        let values = keys.map((k)=>parent[k]);
        try{
            return new Function(...keys.concat(`return ${expr};`))(...values);
        }
        catch(e){
            throw new Error(`undefined expression on [${expr}]`);
        }
    }
};