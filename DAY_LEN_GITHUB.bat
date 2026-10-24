@echo off
chcp 65001 >nul
echo ========================================================
echo  ĐANG ĐẨY MÃ NGUỒN LÊN GITHUB: quanlynhansu.git
echo ========================================================

set "PATH=E:\Diep\git\cmd;%PATH%"

echo 1. Kiểm tra Git...
git --version
if errorlevel 1 (
    echo [LOI] Khong tim thay Git! Vui long kiem tra lai duong dan E:\Diep\git
    pause
    exit /b 1
)

echo 2. Cap nhat Remote Origin...
git remote set-url origin https://github.com/ntngocdiep5stu/quanlynhansu.git
git remote -v

echo 3. Them file va Commit...
git add -A
git commit -m "feat: cap nhat toan bo He thong Quan tri Nhan su & Tien luong Thong minh - Cong ty A"

echo 4. Day len GitHub (main)...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [CANH BAO] Neu GitHub yeu cau dang nhap, cua so trinh duyet se xuat hien de ban xac thuc (Sign in with your browser).
    echo Hoac neu ban co GitHub Personal Access Token (PAT), hay dang nhap bang Token.
    echo.
) else (
    echo.
    echo ========================================================
    echo  DA DAY THANH CONG TOAN BO SOURCE CODE LEN GITHUB!
    echo  Repo: https://github.com/ntngocdiep5stu/quanlynhansu
    echo ========================================================
)

pause
