function VSElement(superConstructor = HTMLElement){
    if(!(Object.getPrototypeOf(superConstructor) === HTMLElement || superConstructor === HTMLElement)){
        throw new Error("need extends HTMLElement");
    }
    return class VSElement extends superConstructor{
        constructor(){
            super();
        }
        extend(superConstructor){
            return VSElement(superConstructor);
        }
    }
};
export default VSElement();