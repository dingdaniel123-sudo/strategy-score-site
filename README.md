# 股票策略评分网站

纯前端策略评价工具，支持上传策略净值 CSV，自动与内置基准进行交易日对齐并计算评分。

## 功能

- 上传策略 CSV（`date,nav`）
- 选择基准：万得全A、上证指数、沪深300、中证500
- 自动日期交集对齐，基准归一化
- 计算绝对收益、超额收益、Sharpe、Sortino、IR、最大回撤、最长创新高天数
- 按评分权重输出 0-100 综合分和评级

## 启动

```bash
npm install
npm run dev
```

## 一键部署到 Vercel

把代码放到 GitHub 后，使用下面链接可一键部署：

```text
https://vercel.com/new/clone?repository-url=<你的GitHub仓库URL>&project-name=strategy-score-site
```

部署完成后会得到固定网址，例如：

```text
https://strategy-score-site.vercel.app
```

## CSV 示例

```csv
date,nav
2020-01-02,1
2020-01-03,1.002
```

## 基准数据

位于 `public/benchmarks/*.json`，当前为占位数据，请替换为真实完整日频历史收盘价。
