import VSElement from "./core/vs-element.js";
import VSLoop from "./vs-loop.js";
import VSIf from "./vs-if.js";
export default class CustomList extends VSElement{
    constructor(baseElement){
        super(baseElement);
        this.$store.count = 0;
        this.$store.attach(VSLoop.iterateSymbol,([v,k])=>{
            this.$store.dispatch("count",parseInt(v));
        })
        this.$store.attach(VSIf.condSymbol,(value)=>{
            this.style.display = "none";
        })
    }
    static get template(){
        return fetch("./Component/dom/element.html").then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "custom-counter";
    }
    async VShadow(root,$store){
        const countTag = root.getElementById("count");
        const addCountTag = root.getElementById("add-count");
        countTag.innerHTML = ($store.count);
        addCountTag.addEventListener("click",()=>{
            ++$store.count;
        })
        this.$store.attach("count",([v,k])=>{
            countTag.innerHTML = parseInt(v);
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