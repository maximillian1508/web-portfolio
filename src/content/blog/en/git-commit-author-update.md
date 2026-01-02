---
title: "Update All Previous Git Commit Author Name & Email"
description: "How to change the author name and email for all previous git commits"
pubDate: 2025-10-27
featuredImage: ""
draft: false
lang: "en"
slug: "update-all-previous-git-commit-author-name-email"
translationKey: "git-commit-author-update"
---

## 1. Create a bash script with the following content

```bash
echo "Enter Old Email address: "
read OLD_EMAIL
echo "Enter new Email Address: "
read CORRECT_EMAIL
echo "Enter new user name (First name + Last Name): "
read CORRECT_NAME

env_filter="
OLD_EMAIL=\"$OLD_EMAIL\"
CORRECT_NAME=\"$CORRECT_NAME\"
CORRECT_EMAIL=\"$CORRECT_EMAIL\"
if [ \"\$GIT_COMMITTER_EMAIL\" = \"\$OLD_EMAIL\" ]
then
    export GIT_COMMITTER_NAME=\"\$CORRECT_NAME\"
    export GIT_COMMITTER_EMAIL=\"\$CORRECT_EMAIL\"
fi
if [ \"\$GIT_AUTHOR_EMAIL\" = \"\$OLD_EMAIL\" ]
then
    export GIT_AUTHOR_NAME=\"\$CORRECT_NAME\"
    export GIT_AUTHOR_EMAIL=\"\$CORRECT_EMAIL\"
fi
"

git filter-branch --env-filter "$env_filter" --tag-name-filter cat -- --branches --tags

rm -rf .git/refs/original/refs/*/*
```

## 2. Delete duplicate backup history

Delete the "original" backup that is created after executing the script:

```bash
git update-ref -d refs/original/refs/heads/master
```

## 3. Remove original refs folder

Check if `.git/refs/original` is empty, then remove it:

```bash
rm -rf .git/refs/original
```

## 4. Verify the updated logs

```bash
git log --pretty=format:"[%h] %cd - Committer: %cn (%ce), Author: %an (%ae)"
```

## 5. Force push

```bash
git push --force --tags origin HEAD:master
```

## References

- [Stack Overflow Discussion](https://stackoverflow.com/questions/750172/how-do-i-change-the-author-and-committer-name-email-for-multiple-commits)
- [Script](https://gist.github.com/yaronuliel/8157d7318de988f4399f561d466e12f3)
