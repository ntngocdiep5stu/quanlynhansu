$url = 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/MinGit-2.47.1-64-bit.zip'
$destZip = "$env:TEMP\mingit.zip"
$destFolder = 'E:\Diep\git'

Write-Host "Downloading MinGit from $url ..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $destZip -UseBasicParsing

Write-Host "Extracting to $destFolder ..."
if (!(Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
}
Expand-Archive -Path $destZip -DestinationPath $destFolder -Force
Remove-Item $destZip -Force -ErrorAction SilentlyContinue

Write-Host "Testing MinGit version:"
& "$destFolder\cmd\git.exe" --version

# Add to user PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$destFolder\cmd*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$destFolder\cmd", "User")
    Write-Host "Added to User PATH!"
}
