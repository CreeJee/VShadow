export default class CustomList extends HTMLElement{
    constructor(){
        super();
    }
    static get template(){
        return fetch("./Component/dom/element.html").then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "custom-counter";
    }
    static async onFactory(store){
        store.count = 0;
    }
    async VShadow(root,$store){
        const countTag = root.getElementById("count");
        const addCountTag = root.getElementById("add-count");
        countTag.innerHTML = $store.count;
        addCountTag.addEventListener("click",()=>{
            countTag.innerHTML = parseInt(++$store.count); 
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