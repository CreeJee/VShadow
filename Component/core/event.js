
import Store from "./store.js";
export default {
    dispatchChild : (assignedElements,appendHost,k,v)=>{
        if(Array.isArray(assignedElements)){
            assignedElements.forEach((node)=>{
                let cloneNode = node.cloneNode(true);
                appendHost.appendChild(cloneNode);
                if(cloneNode.$store instanceof Store){
                    cloneNode.$store.lazyDispatch(k,v);
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