@echo off

:## uncomment the following line to set JAVA_HOME:
REM set JAVA_HOME=c:\programme\jdk13

set TARGET=%1%

:## --------------------------------------------
:## No need to edit anything past here
:## --------------------------------------------

if "%JAVA_HOME%" == "" goto javahomeerror

set BUILDFILE=build.xml

set CP="%CLASSPATH%;lib/ant.jar;lib/ant-launcher.jar;lib/jsch.jar;lib/ant-jsch.jar"

"%JAVA_HOME%\bin\java.exe" -cp %CP% org.apache.tools.ant.launch.Launcher -buildfile %BUILDFILE% %TARGET%

goto end

:## -----------ERROR-------------
:javahomeerror
echo "ERROR: JAVA_HOME not found in your environment."
echo "Please, set the JAVA_HOME variable in your environment to match the"
echo "location of the Java Virtual Machine you want to use."

:end

