export default class CustomList extends HTMLElement{
    constructor(){
        super();
    }
    static get [elementRegistry.tagNameSymbol](){
        return "custom-list";
    }
}