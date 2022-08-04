# level


## Usage

1. `npx create-react-app [project-name] --template level`
2. `yarn`
3. `yarn sub`
4. `yarn start`


## Tips

* submodule address
  * `https://github.com/react-level/level-base.git`

* 更新 `submodule` 命令:
  * `git submodule update --remote`

* Linux下watch文件数量限制:
  * `sudo sysctl -w fs.inotify.max_user_watches=300000`

* js代码规范参考:
  * [airbnb javascript规范](https://github.com/airbnb/javascript)

* stylelint 规范参考:
  * https://stylelint.io/ --- http://stylelint.cn/user-guide/rules/
  * stylelint-scss: https://github.com/kristerkari/stylelint-scss

* 最佳实践:
  * 响应式编程([Rx.js](https://rxjs.dev/api))
  * 函数柯里化([Ramda.js](https://ramdajs.com/docs/))
  * 纯函数([Immutable.js](https://immutable-js.com/docs/v4.0.0-rc.14))
  * 高阶函数，高阶组件


* 善用佳软:
  * [lodash.js](https://lodash.com/docs/4.17.15)
  * [moment.js](https://momentjs.com/)
  * [math.js](https://mathjs.org/docs/index.html)
  * [viewer.js](https://fengyuanchen.github.io/viewerjs/)
  * [emotion](https://emotion.sh/docs/introduction)
  * [styled-components](https://styled-components.com/docs)

## Introduction

> 此项目基于 `create-react-app + typescript` 更新并演进.

> 项目基础框架: `react`, `react-router-dom`, `typescript`, `mobx`, `material-ui`, `sass`


## 目录结构

```bash
                              ** 别名 **                    ** 介绍 **
| -- src                      @ or @src                    代码目录
  | -- api                    @api                         接口请求
  | -- component              @comp                        组件
  | -- container              @con                         本项目公共组件
  | -- core                   @core                        项目核心功能
    | -- route                --                           路由
  | -- scss                   @scss                        样式
  | -- service                @service                     接口层数据处理
  | -- static                 @static                      静态资源
    | -- image                --                           image
    | -- icon                 --                           icon
  | -- store                  @store                       数据
  | -- styled                 @styled                      样式组件
  | -- test                   @test                        单元测试
  | -- tool                   @tool                        方法封装
  | -- types                  @types                       ts类型定义

| -- sub                      @sub                         子项目代码目录
  | -- api                    @subApi                      公共接口请求
  | -- component              @subComp                     公共组件
  | -- container              @subCon                      全局组件
  | -- core                   @subCore                     多项目共用核心功能
    | -- db                   --                           - 预留 -
    | -- i18n                 --                           多语言
    | -- theme                --                           多项目共用主题
  | -- docs                   --                           文档
  | -- scss                   @subScss                     全局样式
  | -- service                @subService                  公共接口层数据处理
  | -- static                 @subStatic                   多项目共用的静态资源
    | -- image                --                           image
    | -- icon                 --                           icon
  | -- store                  @subStore                    多项目共用的数据
  | -- styled                 @subStyled                   公共样式组件
  | -- test                   @subTest                     单元测试
  | -- tool                   @subTool                     公共方法
  | -- types                  @subTypes                    ts类型定义
```


## git commit 提交规范

> 约定式提交: https://www.conventionalcommits.org/zh-hans/v1.0.0-beta.4/

* `feat`: 新增功能/完成任务 (feature)
* `fix`: 修复bug
* `test`: 单元测试
* `docs`: 文档 (documentation)
* `style`: 样式
* `refactor`: 代码重构
* `pref`: 优化相关，比如提升性能/体验
* `ci`: CI/CD相关
* `chore`: 辅助/其它
* `revert`: 恢复变更/回滚到上一个版本
* `little`: 微不足道的变更
* `try`: 尝试

> scope:
  * `#task`: 完成的任务加任务编号
  * `#bug`: 修复的bug加bug号
  * `#test`: 单元测试加任务编号
  * `self-test`: 自测
  * `sub-**`: 变更了sub模块的**功能
  * `!`: 包含破环性变更

> 重点

* <b>Bug</b> 修复了bug的，带bug号，例:
  `fix(#11): 修复样式bug`
* <b>Feat</b> 完成了任务/新增了功能的，带任务编号，例:
  `feat(#12): 完成任务-添加视频宣传`
* <b>Test</b> 完成了单元测试功能的，加任务编号，例:
  `test(#13): 登录模块增加单元测试`
* <b>Log</b> 通过 git log 查看:
  * `git log --grep=feat`
  * `git log --grep fix`
* <b>`!`</b> 会触发 `MAJOR` 版本的变更
* <b>`feat`</b> 会触发 `MINOR` 版本的变更
* <b>`fix`</b> 会触发 `PATCH` 版本的变更
