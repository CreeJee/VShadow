
import Store from "./store.js";
import VSElement from "./vs-element.js";
const __pureEventSymbol = Symbol("@@pureEventSymbol");
const __boundEventSymbol = Symbol("@@boundEventSymbol");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const __travelNode = async (selectedNode,findCallback)=>{
    let __recursive = async (node)=> (node instanceof VSElement) ? await findCallback(node) : await asyncForEach(Array.from(node.children),__recursive);
    return await __recursive(selectedNode);
}
const __dispatchNearest = async (selectedNode,key,value)=>{
    return await __travelNode(selectedNode,async (node)=>node.$store.dispatch(key,value));
}
const __inserthNode = async (appendHost,key,value,node)=>{
    let selectedNode = appendHost.appendChild(document.importNode(node,true));
    await __dispatchNearest(selectedNode,key,value);
};
const __evalExpression = function(store,evalString,extra = {}){
    let keys = (store instanceof Store ? Array.from(store.keys()) : Object.keys(store)).filter((k)=>!(typeof k === "symbol"));
    let values = keys.map((k)=>store[k]);
    if(extra.constructor === Object){
        keys = keys.concat(Object.keys(extra));
        values = values.concat(Object.values(extra));
    }
    else{
        throw new Error("extra utils support object only");
    }
    return new Function(...keys.concat(evalString)).apply(this,values);
};
const self =  {
    asyncForEach : asyncForEach,
    dispatchAppend : async (assignedElements,appendHost,k,v)=>{
        if(Array.isArray(assignedElements)){
            await asyncForEach(assignedElements,__inserthNode.bind(null,appendHost,k,v));
        }
        else{
            throw new Error("unknown dispatch target");
        }
    },
    dispatchChild : __dispatchNearest,
    // use bind expression scope this;
    evalExpression : __evalExpression,
    parseExpression : function(store,expr,extra){
        try{
            return __evalExpression.apply(this,[
                store,
                `return ${expr};`,
                extra
            ]);
        }
        catch(e){
            throw new Error(`undefined expression on [${expr}]`);
        }
    },
    setExpression : function(store,expr,value,extra){
        try{
            let result = __evalExpression.apply(this,[
                store,
                `return (${expr} = ${value});`,
                extra
            ]);
            console.log(result,`(${expr} = ${value});`);
            return result;
        }
        catch(e){
            throw new Error(`undefined expression on [${expr}]`);
        }
    },
    travelNode : __travelNode,
    symbol : __pureEventSymbol,
    boundSymbol : __boundEventSymbol,
};
export default self