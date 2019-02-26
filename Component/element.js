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
    static async onFactory($factory){
        $factory.uuid = ($factory.uuid || 0)+1;
    }
    async VShadow(root,$factory,$store){
        const countTag = root.getElementById("count");
        const addCountTag = root.getElementById("add-count");
        countTag.innerHTML = ($store.count = 0);
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