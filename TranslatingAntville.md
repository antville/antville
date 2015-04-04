**Table of Contents:**


# Prerequisites #

If not already done so, please download and install the application Poedit, available for Linux, OS X and Windows:

http://www.poedit.net/download.php

# Creating the Translation File #

Run Poedit and follow the depicted path. (_Note:_ If your language is already available as PO file in the [i18n directory](http://antville.googlecode.com/svn/trunk/i18n) please jump directly to the section about translating a PO file.)

![http://antville.googlecode.com/svn/wiki/images/i18n/new-catalog-menu.png](http://antville.googlecode.com/svn/wiki/images/i18n/new-catalog-menu.png)

The file `antville.pot` is located in the Antville installation directory under `apps/antville/i18n` or you can get the latest version from the Subversion [code repository](http://antville.googlecode.com/svn/trunk/i18n/antville.pot) (ie. by right-clicking the link and downloading the file to your local hard disk).

![http://antville.googlecode.com/svn/wiki/images/i18n/new-catalog-dialog.png](http://antville.googlecode.com/svn/wiki/images/i18n/new-catalog-dialog.png)

After selecting the file, click `Open`. PoEdit currently confirms your action with a rather unorthodox message dialog:

![http://antville.googlecode.com/svn/wiki/images/i18n/alert.png](http://antville.googlecode.com/svn/wiki/images/i18n/alert.png)

(It actually means everything is alright, really.) Afterwards, the settings dialog is displayed.

![http://antville.googlecode.com/svn/wiki/images/i18n/settings-dialog.png](http://antville.googlecode.com/svn/wiki/images/i18n/settings-dialog.png)

Please fill in all the fields. As you will be the sole member of a translation team most of the time (or so they say), you can also enter your name and e-mail address. The most important information you should enter, though, are the [language and country ISO codes](http://www.mcanerin.com/en/articles/meta-language.asp).

Also check that you have entered UTF-8 as charset (also for the source code) and the string defining the plural forms is exactly as displayed in the screenshot:

`nplurals=2; plural=(n != 1)`

![http://antville.googlecode.com/svn/wiki/images/i18n/settings-dialog-2.png](http://antville.googlecode.com/svn/wiki/images/i18n/settings-dialog-2.png)

Now click `OK` and save the file with the language ISO code as filename plus the `.po` suffix:

![http://antville.googlecode.com/svn/wiki/images/i18n/save-as-dialog.png](http://antville.googlecode.com/svn/wiki/images/i18n/save-as-dialog.png)

(You might have noticed that “cn” is not the correct language ISO code for China – it should be “zh”.)

# Translating the File #

Translating message in a PO file is pretty straightforward. You pick a message from the list in the upper part of the PoEdit window and enter the translation in the lower form field (or fields, resp. in case of a plural form). Untranslated messages appear in bold font, newly translated ones are marked with a little star icon.

![http://antville.googlecode.com/svn/wiki/images/i18n/translate.png](http://antville.googlecode.com/svn/wiki/images/i18n/translate.png)

If a message contains placeholder patterns (like {0}, {1}, {2} and so on) please enter these exactly as given – of course at a semantically meaningful position.

_Note:_ It might not always be easy to understand and translate such
messages. If in doubt feel free to contact the Antville developers.

![http://antville.googlecode.com/svn/wiki/images/i18n/translate-singular.png](http://antville.googlecode.com/svn/wiki/images/i18n/translate-singular.png)

Some messages come in singular and plural form and need corresponding translations:

![http://antville.googlecode.com/svn/wiki/images/i18n/translate-plural.png](http://antville.googlecode.com/svn/wiki/images/i18n/translate-plural.png)

If you finished your translation save the file again.

![http://antville.googlecode.com/svn/wiki/images/i18n/save-menu.png](http://antville.googlecode.com/svn/wiki/images/i18n/save-menu.png)

Last but not least you should return the translated file to the Antville Project, either via e-mail or upload to http://translate.antville.org. If you should become a very busy and successful translator of Antville files you even could apply for write access to the Subversion code repository.

# Updating the Translation File #

Once in a while new messages will be added to Antville and thus an update of the translation file will be necessary. In order to do this first open the translation PO file as explained before. Afterwards select the `Updating from POT file...` command from the `Catalog` menu:

![http://antville.googlecode.com/svn/wiki/images/i18n/update-menu.png](http://antville.googlecode.com/svn/wiki/images/i18n/update-menu.png)

Select a new version of the `antville.pot` file:

![http://antville.googlecode.com/svn/wiki/images/i18n/update-dialog.png](http://antville.googlecode.com/svn/wiki/images/i18n/update-dialog.png)

PoEdit shows a summary of the update in a dialog window:

![http://antville.googlecode.com/svn/wiki/images/i18n/update-summary-dialog.png](http://antville.googlecode.com/svn/wiki/images/i18n/update-summary-dialog.png)

Now you can resume translation of the file.