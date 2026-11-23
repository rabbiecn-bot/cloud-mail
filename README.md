<p align="center">
  <img src="doc/demo/logo.png" width="80px" />
</p>

<div align="center">
<h1>Cloud Mail</h1>
</div>
<div align="center">
    <h4>使用Vue3开发的响应式邮箱服务，支持邮件发送，无需服务器可部署到Cloudflare平台 🎉</h4> 
</div>
<div align="center">
    <span>简体中文 | <a href="/README-en.md" style="margin-left: 5px">English </a></span>
</div>

## 项目简介

只需要一个域名，就可以创建多个不同的邮箱，类似各大邮箱平台 QQ邮箱，谷歌邮箱等，本项目使用Cloudflare部署，Resend推送邮件，无需服务器费用，搭建自己的邮箱服务

## 项目展示

- [在线演示](https://skymail.ink)<br>
- [部署文档](https://doc.skymail.ink)<br>
- [小白保姆教程-界面部署](https://doc.skymail.ink/guide/via-ui.html)

| ![](/doc/demo/demo1.png) | ![](/doc/demo/demo2.png) |
|--------------------------|---------------------|
| ![](/doc/demo/demo3.png)      | ![](/doc/demo/demo4.png) |
| ![](/doc/demo/demo5.png)      | ![](/doc/demo/demo6.png) |
| ![](/doc/demo/demo7.png)      | ![](/doc/demo/demo8.png) |




## 功能介绍

- **💰 低成本使用**：无需服务器，部署到 Cloudflare Workers 降低使用成本

- **💻 响应式设计**：响应式布局自动适配PC和大部分手机端浏览器

- **📧 邮件发送**：集成resend发送邮件，支持群发，内嵌图片和附件发送，发送状态查看

- **🛡️ 管理员功能**：可以对用户，邮件进行管理，RABC权限控制对功能及使用资源限制

- **🔀 多号模式**：开启后一个用户可以添加多个邮箱，默认一用户一邮箱，类似各大邮箱平台

- **📦 附件收发**：支持收发附件，使用R2对象存储保存和下载文件

- **🔔 邮件推送**：接收邮件后可以转发到TG机器人或其他服务商邮箱

- **📡 开放API**：支持使用API批量生成用户，多条件查询邮件 

- **📈 数据可视化**：使用echarts对系统数据详情，用户邮件增长可视化显示

- **⭐ 星标邮件**：标记重要邮件，以便快速查阅

- **🎨 个性化设置**：可以自定义网站标题，登录背景，透明度

- **⚙️ 功能设置**：可以对注册，邮件发送，添加等功能关闭和开启，设为私人站点

- **🤖 人机验证**：集成Turnstile人机验证，防止人机批量注册

- **📜 更多功能**：正在开发中...



## 技术栈

- **框架**：[Vue3](https://vuejs.org/) + [Element Plus](https://element-plus.org/) 

- **Web框架**：[Hono](https://hono.dev/)

- **ORM：**[Drizzle](https://orm.drizzle.team/)

- **平台：** [Cloudflare workers](https://developers.cloudflare.com/workers/)

- **邮件推送：** [Resend](https://resend.com/)

- **缓存**：[Cloudflare KV](https://developers.cloudflare.com/kv/)

- **数据库**：[Cloudflare D1](https://developers.cloudflare.com/d1/)

- **文件存储**：[Cloudflare R2](https://developers.cloudflare.com/r2/)


## GitHub Actions 部署 Secrets 配置

使用仓库自带的 `.github/workflows/deploy-cloudflare.yml` 自动部署时，需要先在仓库 **Settings → Secrets and variables → Actions → New repository secret** 中逐个添加以下 Secrets。

**通用规则：每个 Secret 只填值本身，不要带变量名、不要有多余空格或换行；下表特别注明格式的按格式填写。**

| Secret 名称 | 必需 | 写入格式 | 示例 / 获取方式 |
| --- | :---: | --- | --- |
| `CLOUDFLARE_API_TOKEN` | ✅ | Cloudflare API 令牌原文，整串粘贴，不要加引号 | 在 Cloudflare 控制台「我的个人资料 → API 令牌」创建：选「编辑 Cloudflare Workers」模板，并补上 D1、KV、R2 的编辑权限 |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | 32 位十六进制字符串 | Cloudflare 控制台首页右侧栏或账户设置中的「账户 ID」 |
| `D1_DATABASE_ID` | ✅ | UUID 格式 | 形如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`；在 D1 数据库详情页复制「数据库 ID」。为空时工作流会跳过部署 |
| `KV_NAMESPACE_ID` | ✅ | 32 位十六进制字符串 | 在 Workers & Pages → KV 中打开命名空间，复制其 ID。为空时工作流会跳过部署 |
| `R2_BUCKET_NAME` | ❌ | 存储桶名称原文，不要加引号 | 如 `cloud-mail`；留空则不绑定 R2（工作流会自动删掉 R2 配置段） |
| `DOMAIN` | ✅ | **JSON 数组格式：必须带英文方括号和双引号，多个域名用英文逗号分隔** | 单域名：`["example.com"]`；多域名：`["example1.com","example2.com"]`。切勿只写裸域名（如 `example.com`），否则后端 JSON 解析失败、域名列表加载不出来 |
| `ADMIN` | ✅ | 管理员邮箱原文，不要加引号 | 如 `admin@example.com`，即后台管理员账号的邮箱 |
| `JWT_SECRET` | ✅ | 随机长字符串（建议 32 位以上，字母+数字），不要加引号 | 可用密码生成器生成。它同时是数据库初始化口令：部署后访问 `https://你的域名/api/init/<JWT_SECRET>` 可手动触发初始化 |

补充说明：

- 本工作流只用 Secrets，**Variables（变量）无需配置**。
- Secrets 只保存在 GitHub 仓库设置里，运行时由工作流注入并写入生成的 `wrangler-action.toml` 完成部署；**不要把真实值写进仓库的任何文件**。
- 修改任意 Secret 后，需重新运行一次工作流（推送 `mail-vue/**` 或 `mail-worker/**` 的改动，或在 Actions 页手动 Run workflow）才会生效。


## 赞助


<a href="https://doc.skymail.ink/support.html" >
<img width="170px" src="./doc/images/support.png" alt="">
</a><br><br>


**特别赞助商**

[DartNode](https://dartnode.com)：提供云计算服务资源支持

[![Powered by DartNode](https://dartnode.com/branding/DN-Open-Source-sm.png)](https://dartnode.com "Powered by DartNode - Free VPS for Open Source")

## 许可证

本项目采用 [MIT](LICENSE) 许可证	


## 交流

[Telegram](https://t.me/cloud_mail_tg)



