app.addRepository(app.dir + '/../lib/autolink-0.10.0.jar');
app.addRepository(app.dir + '/../lib/commonmark-0.17.1.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-autolink-0.17.1.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-gfm-strikethrough-0.17.1.jar');
app.addRepository(app.dir + '/../lib/commonmark-ext-gfm-tables-0.17.1.jar');

var renderMarkdown = (function() {
  const commonMark = new JavaImporter(
    Packages.org.commonmark.ext.autolink,
    Packages.org.commonmark.ext.gfm.strikethrough,
    Packages.org.commonmark.ext.gfm.tables,
    Packages.org.commonmark.parser.Parser,
    Packages.org.commonmark.renderer.html.AttributeProvider,
    Packages.org.commonmark.renderer.html.HtmlRenderer
  );

  const extensions = [
    commonMark.AutolinkExtension.create(),
    commonMark.StrikethroughExtension.create(),
    commonMark.TablesExtension.create()
  ];

  const parser = commonMark.Parser
    .builder()
    .extensions(extensions)
    .build();

  const AttributeProvider = function() {
    return new commonMark.AttributeProvider({
      setAttributes: function(node, tagName, attributes) {
        if (tagName === 'table') {
          attributes.put('class', 'uk-table uk-table-striped uk-table-hover uk-table-condensed');
        }
      }
    });
  };

  const renderer = commonMark.HtmlRenderer
    .builder()
    .attributeProviderFactory(AttributeProvider)
    .extensions(extensions)
    .build();

  return function(str) {
    const document = parser.parse(str);
    return renderer.render(document);
  };
})();
