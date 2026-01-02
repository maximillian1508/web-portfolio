---
title: "Update All Previous Git Commit Author Name & Email"
description: "Cara mengubah nama dan email author untuk semua commit git sebelumnya"
pubDate: 2025-10-27
featuredImage: ""
draft: false
lang: "id"
slug: "update-semua-git-commit-author-name-email"
translationKey: "git-commit-author-update"
---

1. Buat bash script dengan konten berikut

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

2. Hapus duplikat backup history bernama "original" yang dibuat setelah menjalankan script

```bash
git update-ref -d refs/original/refs/heads/master
```

3. Cek apakah `.git/refs/original` kosong, hapus folder jika kosong.

```bash
rm -rf .git/refs/original
```

4. Cek dan verifikasi log yang sudah diupdate

```bash
git log --pretty=format:"[%h] %cd - Committer: %cn (%ce), Author: %an (%ae)"
```

5. Force push

```bash
git push --force --tags origin HEAD:master
```

Referensi:

* [Stack Overflow Discussion](https://stackoverflow.com/questions/750172/how-do-i-change-the-author-and-committer-name-email-for-multiple-commits "Stack Overflow Discussion")
* [Script](https://gist.github.com/yaronuliel/8157d7318de988f4399f561d466e12f3 "Script")
