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
    async VShadow(root){
        const countTag = root.getElementById("count");
        const addCountTag = root.getElementById("add-count");
        countTag.innerHTML = 0;
        addCountTag.addEventListener("click",()=>{
            countTag.innerHTML = 1+parseInt(countTag.innerHTML); 
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