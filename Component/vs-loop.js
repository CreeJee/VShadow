const __getProperty = (data,...props)=>{
    if(props.length === 1){
        return data[props[0]];
    }
    return __getProperty(data instanceof Map ? data.get(props[0]) : Reflect.get(data,props[0]),props.slice(1))
};
const iterateSymbol = Symbol("@@IterateSymbol");
export default class VSLoop extends HTMLElement{
    constructor(){
        super();
    }
    static get template(){
        return fetch("./Component/dom/base/vs-loop.html").then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-loop";
    }
    static get iterateSymbol(){
        return iterateSymbol;
    }
    async VShadow(root,$factory,$store){
        $store.test = "true"
        //using for test


        const attributes = root.host.attributes;
        const baseElementArray = root.getElementById("slot").assignedElements();
        let temp = -1;
        let iterateStart = attributes.start ? (isNaN(temp = parseInt(attributes.start.value)) ? __getProperty(this.$parent,...attributes.start.value.split(".")) : temp ) : 0;
        let iterateCount = attributes.count ? (isNaN(temp = parseInt(attributes.count.value)) ? __getProperty(this.$parent,...attributes.count.value.split(".")) : temp ) : undefined; 
        let iterateAsArray = [];
        try{
            iterateAsArray = attributes.as ? (__getProperty(this.$parent,...attributes.as.value.split(".")) || []).slice(iterateStart,iterateCount) : Array(iterateCount).fill(null,iterateStart,iterateCount).map((v,k)=>k);
        }
        catch(e){
            throw new Error(`undefined variable on [${attributes.as.value}]`);
        }
        iterateAsArray.forEach((v,k,arr)=>{
            baseElementArray.forEach((node)=>{
                node = node.cloneNode(true);
                if(node.$store instanceof $store.constructor){
                    debugger;
                    node.$store.commit(iterateSymbol,v);
                }    
                root.appendChild(node);
            });
        });
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