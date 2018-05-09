@echo off
    setlocal enabledelayedexpansion

    REM get all folders in the current folder, echo their names and size in bytes

    echo const localRawData ^= ^[ > data.js

    set "folder=G:\Anime\Series"
    for /d %%a in ("%folder%\*") do (
        set "size=0"
        for /f "tokens=3,5" %%b in ('dir /-c /a /w /s "%%~fa\*" 2^>nul ^| findstr /b /c:"  "') do if "%%~c"=="" set "size=%%~b"
        echo "%%~nxa#!size!"^, >> data.js
    )

    set "folder=G:\Anime\Movies"
    for %%a in ("%folder%\*") do (
        echo "%%~nxa#%%~za"^, >> data.js
    )

    set "folder=G:\Anime\Ghibli Movies"
    for %%a in ("%folder%\*") do (
        echo "%%~nxa#%%~za"^, >> data.js
    )

    set "folder=G:\Anime\Special and OVA"
    for %%a in ("%folder%\*") do (
        echo "%%~nxa#%%~za"^, >> data.js
    )

    echo ^]; >> data.js

    endlocal

    REM get my anime list page and echo contents

    echo const malHTML ^= ^` >> data.js
    powershell -Command "Invoke-WebRequest https://myanimelist.net/animelist/fncombo -OutFile malhtml.html"
    copy data.js+malhtml.html data.js
    echo ^`; >> data.js

    REM get my anime list api and echo contents

    echo const malXML ^= ^` >> data.js
    powershell -Command "Invoke-WebRequest https://myanimelist.net/malappinfo.php?u=fncombo\"^&\"status=all\"^&\"type=anime -OutFile malxml.html"
    copy data.js+malxml.html data.js
    echo ^`; >> data.js

    REM delete temp files

    del "malhtml.html"
    del "malxml.html"

    REM last updated date and time

    echo const batchUpdated ^= "%date% %time%" >> data.js