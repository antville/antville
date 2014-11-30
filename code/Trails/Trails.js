Trails.load = function (trails) {
  trails || (trails = []);
  trails instanceof Array || (trails = [trails]);
  trails.forEach(function (name) {
    var repository = new helma.File(app.dir, '../trails/' + name);
    if (repository.exists()) {
      console.log('Adding trail', repository.toString());
      app.addRepository(repository.toString());
      app.data.trails.push(name);
    }
  });
  return;
};

Trails.prototype.main_action = function () {
  var self = this;
  res.writeln('<h1>Trails</h1><ul>');
  var dir = new helma.File(app.dir, '../trails');
  if (dir.exists()) {
    dir.list().forEach(function (name) {
      var repository = new helma.File(dir, name);
      if (repository.isDirectory()) {
        if (app.data.trails.indexOf(name) > -1) {
          res.writeln('<li><a href="' + self.href(name) + '">' + name + '</a></li>');
        } else {
          res.writeln('<li>' + name + '</li>');
        }
      }
    });
  }
  res.writeln('</ul>');
};
