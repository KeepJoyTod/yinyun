# GitHub 上传与多电脑协作检查清单

## 结论

仓库已经在 GitHub：

```text
https://github.com/dengzhekun/yingyue-cloud.git
```

本地开发使用 `D:\OtherProject\CameraApp\yingyue-cloud-repo`，不要从 `D:\OtherProject\CameraApp` 根目录提交。

多电脑协作主文档：

```text
docs/github-multi-computer-workflow.md
```

## 上传前检查

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short
rg -n "token|secret|password|private_key|access[_-]?key|refresh[_-]?key" .
```

发现真实密钥时先删除或替换为 `replace-with-*` 占位。

## 已有仓库推送

只加入本次任务文件，不要 `git add .`：

```powershell
git fetch origin
git pull --ff-only
git add <明确文件路径>
git diff --cached --stat
git commit -m "<type>(scope): <summary>"
git push -u origin <branch>
```

## 首次建仓参考

仅当重新建一个全新私有仓库时才使用：

```powershell
git init
git add <明确文件路径>
git commit -m "init yingyue cloud enterprise studio system"
gh repo create yingyue-cloud --private --source . --remote origin --push
```

如果后续要公开仓库，先重新做许可证、密钥、闭源素材、真实证据和复刻风险审计。
