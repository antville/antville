app.addRepository(app.dir + '/../lib/autolink-0.10.0.jar');
app.addRepository(app.dir + '/../lib/commonmark-0.14.0.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-autolink-0.14.0.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-gfm-strikethrough-0.14.0.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-gfm-tables-0.14.0.jar');

var renderMarkdown = (function() {
  const commonMark = new JavaImporter(
    Packages.org.commonmark.ext.autolink,
    Packages.org.commonmark.ext.gfm.strikethrough,
    Packages.org.commonmark.ext.gfm.tables,
    Packages.org.commonmark.parser.Parser,
    Packages.org.commonmark.renderer.html.HtmlRenderer
  );

  const extensions = [
    commonMark.AutolinkExtension.create(),
    commonMark.StrikethroughExtension.create(),
    commonMark.TablesExtension.create()
  ];

  const parser = commonMark.Parser.builder().extensions(extensions).build();
  const renderer = commonMark.HtmlRenderer.builder().extensions(extensions).build();

  return function(str) {
    const document = parser.parse(str);
    return renderer.render(document);
  };
})();
