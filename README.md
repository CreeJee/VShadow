# VShadow
> webcomponents light library

## VShadow
- get BaseComponent 
    - when based Component class (extends HtmlElement)
    - get \[VShadow.tagNameSymbol\]
        - defined tagName (required)
    - get \[VShadow.extendsSymbol\]
        - defined extendsTagName (optional)
    - get template
        - for paresed tag template (using async)
    - onRegister()
        -when registerd tag called
- defind({OriginalClass extends HtmlElement}) return (VShadow.BaseComponent extends OriginalClass)
- async load({...path extends Array<String>}) return Promise\[\]<VShadow.BaseComponent extends HtmlELements>
### how to use
```javascript
    
```

## FixedType
>> it contains side effect
- property(obj extends Object,key extedns String,type extends Class) return obj
- expect(functor extends Function,type extends Class) return functor
- get BaseType 
    - get base type
- get Spread
    - get Spread type argument struct
- get Instance
    - use(...baseTypes extends FixedType.BaseType) : FixedType.Instance
    - \_\_useProps\_\_
        - get used type condition data
    - __get 
        - check argument type is sucess
    - __callMiddleWare(parent extends Map<String,Map<...>>)
        - call \_\_useProps\_\_ called
    
### how to use



