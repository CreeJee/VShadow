import VSElement from "./core/vs-element.js";
import VSLoop from "./vs-loop.js";
export default class CustomList extends VSElement{
    constructor(baseElement){
        super(baseElement);
    }
    static get template(){
        return fetch("./Component/dom/element.html").then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "custom-counter";
    }
    static async onFactory($factory){
        $factory.uuid = ($factory.uuid || 0)+1;
    }
    async VShadow(root,$factory,$store){
        const countTag = root.getElementById("count");
        const addCountTag = root.getElementById("add-count");
        countTag.innerHTML = ($store.count = 0);
        addCountTag.addEventListener("click",()=>{
            ++$store.count
        })
        $store.attach("count",(oldVal,newVal)=>{
            countTag.innerHTML = parseInt(newVal);
        })
        $store.attach(VSLoop.iterateSymbol,(oldVal,newVal)=>{
            $store.dispatch("count",parseInt(newVal));
        })
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