
# typescript-plus

之前有个npm包叫做[typescript-plus](https://github.com/domchen/typescript-plus)，但是已经好久没有更新了，上次更新停留在了ts 3.1.3版本，一些新语法和新功能无法使用，所以我将微软原版[typescript](https://github.com/microsoft/TypeScript/tree/release-5.0) 5.0.4修改了一下，使其支持[typescript-plus](https://github.com/domchen/typescript-plus)包的功能。

当前TypeScript版本：5.0.4

## 额外选项

| Option                |  Type   | Default | Description                                                                      |
|:----------------------|:-------:|:-------:|:---------------------------------------------------------------------------------|
| emitReflection        | boolean |  false  | Emit the reflection data of the class.                                           |
| reorderFiles          | boolean |  false  | Automatically reordering the source files by dependencies.                       |
| defines               | Object  |         | Replace the global variables with the constants defined in the "defines" object. |

访问器已经被TypeScript内部优化了，所以`accessorOptimization`这个配置项去掉了。


其他说明请见[https://github.com/domchen/typescript-plus](https://github.com/domchen/typescript-plus)，感谢大佬