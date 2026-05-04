### 1. `users` 用户表
增加收款码图片字段，大厨上传后存在这里。

| **字段名** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- |
| `_id` | String | 自动生成的文档ID | "user_001" |
| `_openid` | String | 微信用户唯一标识 | "oXy123..." |
| `nickname` | String | 微信昵称 | "老公" |
| `role` | String | 角色：`chef`<br/> (大厨) 或 `member`<br/> (家人) | "chef" |
| `rewardCodeUrl` | String | **[新增] 大厨专有：微信赞赏码/收款码的云存储图片路径** | "cloud://env-id/codes/code.jpg" |
| `createTime` | Date | 注册时间 | 2023-10-27 |


### 2. `dishes` 菜谱表 (私房菜库)
保持不变，管理菜品和上架状态。

| **字段名** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- |
| `_id` | String | 菜品ID | "dish_001" |
| `name` | String | 菜名 | "清蒸鲈鱼" |
| `image` | String | 菜品图片 | "cloud://..." |
| `isActive` | Boolean | 今日是否上架 | `true` |


### 3. `orders` 订单表
保持不变，管理点餐记录和做饭状态。

| **字段名** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- |
| `_id` | String | 订单号 | "order_001" |
| `_openid` | String | 下单人ID | "oXy123..." |
| `dishList` | Array | 菜品明细 | `[{name: "清蒸鲈鱼", num: 1}]` |
| `status` | Number | 进度：0(已点), 1(做饭中), 2(已吃完) | 2 |


### 4. `reward_messages` 打赏留言表 (新增)
由于无法记录真实金额流水，这张表专门用于记录家人打赏后的“报备”与“彩虹屁”。

| **字段名** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- |
| `_id` | String | 记录ID | "msg_001" |
| `_openid` | String | 留言人ID（谁打赏的） | "oXy123..." |
| `order_id` | String | 关联的订单ID（选填，知道是哪顿饭的打赏） | "order_001" |
| `message` | String | 家人的打赏留言/金额备注 | "大厨辛苦了，微信已转8.8元买奶茶！" |
| `createTime` | Date | 留言时间 | 2023-10-28 19:30 |


### 5. `wishes` 许愿池表
保持不变，用于家人的菜品点播。

| **字段名** | **类型** | **说明** | **示例** |
| --- | --- | --- | --- |
| `_id` | String | 许愿ID | "wish_001" |
| `content` | String | 想吃的菜 | "葱烧海参" |
| `isFulfilled` | Boolean | 是否已加入菜单 | `false` |


