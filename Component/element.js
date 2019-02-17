export default class CustomList extends HTMLElement{
    constructor(){
        super();
        debugger;
    }
    get template(){
        return import("./dom/element.html");
    }
    static get [elementRegistry.tagNameSymbol](){
        return "custom-list";
    }
}