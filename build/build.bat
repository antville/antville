@echo off

:## uncomment the following line to set JAVA_HOME:
REM set JAVA_HOME=c:\programme\jdk13

set TARGET=%1%

:## --------------------------------------------
:## No need to edit anything past here
:## --------------------------------------------

set BUILDFILE=build.xml
if "%TARGET%" == "" goto setdist

if "%JAVA_HOME%" == "" goto javahomeerror

"%JAVA_HOME%\bin\java.exe" -cp ant-launcher.jar org.apache.tools.ant.launch.Launcher -buildfile %BUILDFILE% %TARGET%

goto end

:## -----------ERROR-------------
:javahomeerror
echo "ERROR: JAVA_HOME not found in your environment."
echo "Please, set the JAVA_HOME variable in your environment to match the"
echo "location of the Java Virtual Machine you want to use."

:end

