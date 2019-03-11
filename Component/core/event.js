
import Store from "./store.js";
export default {
    dispatchChild : (assignedElements,appendHost,k,v,isInsert = true)=>{
        let childStore = appendHost.$store.children;
        if(Array.isArray(assignedElements)){
            assignedElements.forEach((node)=>{
                if(isInsert){
                    appendHost.appendChild(node.cloneNode(true));  
                }
                if(childStore.length > 0){
                    childStore[childStore.length-1].dispatch(k,v);
                }
            });
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