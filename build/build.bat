@echo off

:## uncomment the following line to set JAVA_HOME:
REM set JAVA_HOME=c:\programme\jdk13

set TARGET=%1%

:## --------------------------------------------
:## No need to edit anything past here
:## --------------------------------------------

set BUILDFILE=build.xml
if "%TARGET%" == "" goto setdist
goto cont1

:cont1
if not "%2%" == "" goto setapp
goto final

:setdist
set TARGET=usage
goto cont1

:setapp
set APPNAME=-Dapplication=%2%
goto final

:final

if "%JAVA_HOME%" == "" goto javahomeerror

set CP=%CLASSPATH%;ant.jar;ant-launcher.jar
if exist "%JAVA_HOME%\lib\tools.jar" set CP=%CP%;%JAVA_HOME%\lib\tools.jar

echo Classpath: "%CP%"
echo JAVA_HOME: "%JAVA_HOME%"

"%JAVA_HOME%\bin\java.exe" -classpath "%CP%" %APPNAME% org.apache.tools.ant.Main -buildfile %BUILDFILE% %TARGET%

goto end


:## -----------ERROR-------------
:javahomeerror
echo "ERROR: JAVA_HOME not found in your environment."
echo "Please, set the JAVA_HOME variable in your environment to match the"
echo "location of the Java Virtual Machine you want to use."

:end

