@echo off
chcp 65001 >nul
echo ========================================================
echo   ĐẨY DỰ ÁN LÊN GITHUB: https://github.com/ntngocdiep5stu/HR.git
echo ========================================================
echo.

set PATH=E:\Diep\git\cmd;%PATH%

echo [1/3] Kiểm tra Git...
git --version

echo.
echo [2/3] Kiểm tra nhánh và remote...
git status -s
git remote -v

echo.
echo [3/3] Đang đẩy mã nguồn lên nhánh main...
echo (Lưu ý: Nếu GitHub yêu cầu đăng nhập, hãy chọn đăng nhập qua trình duyệt hoặc nhập Personal Access Token)
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   THÀNH CÔNG! ĐÃ ĐẨY MÃ NGUỒN LÊN GITHUB REPOSITORY!
    echo   Xem tại: https://github.com/ntngocdiep5stu/HR
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   Nếu bị lỗi quyền xác thực (Authentication Failed):
    echo   Bạn có thể tạo Personal Access Token (classic) tại:
    echo   https://github.com/settings/tokens (chọn quyền 'repo')
    echo   và chạy lệnh sau trong PowerShell:
    echo.
    echo   git push https://TOKEN_CUA_BAN@github.com/ntngocdiep5stu/HR.git main
    echo ========================================================
)

pause
